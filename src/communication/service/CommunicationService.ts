import { Question, SectionType, SECTIONS } from "../data/types";
// import { supabase } from "@/integrations/supabase/client"; // Removed for DynamoDB migration

// ... (keep interface definitions if needed, or remove if unused)

export class CommunicationBackendService {

    // Use env var or fallback to localhost
    private backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

    async getQuestionsForSection(section: SectionType): Promise<Question[]> {
        // Retry transient failures (flaky network, cold backend) before giving up.
        const maxAttempts = 3;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await fetch(`${this.backendUrl}/api/questions?section=${section}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                // Backend now returns camelCase directly
                return data || [];
            } catch (error) {
                lastError = error;
                console.warn(`Question fetch attempt ${attempt}/${maxAttempts} failed for section ${section}:`, error);
                if (attempt < maxAttempts) {
                    // Backoff: 400ms, 800ms
                    await new Promise(res => setTimeout(res, attempt * 400));
                }
            }
        }

        console.error('Error fetching questions from backend (all retries exhausted):', lastError);
        // Re-throw so callers can distinguish "load failed" from "no questions for section"
        // and show a retry UI instead of a broken prompt.
        throw lastError instanceof Error ? lastError : new Error('Failed to load questions');
    }

    // Submit an audio response (grading)
    async submitAudioResponse(questionId: string, transcript: string): Promise<{ score: number; feedback: string }> {
        try {
            const response = await fetch(`${this.backendUrl}/submit/audio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId, transcript })
            });
            if (!response.ok) {
                // Mock response if endpoint not implemented yet
                return { score: 75, feedback: "Good articulation, but try to speak more clearly." };
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to submit audio:", error);
            return { score: 0, feedback: "Network error" };
        }
    }

    // New: Analyze full game history
    async analyzeGame(history: { question: string, answer: string, score: number, section: string }[]): Promise<any> {
        try {
            const response = await fetch(`${this.backendUrl}/api/analyze-game`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history })
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }
            return await response.json();
        } catch (error) {
            console.error("Analysis Error:", error);
            return null;
        }
    }

    // Submit written response
    async submitWrittenResponse(questionId: string, text: string): Promise<{ score: number; feedback: string }> {
        try {
            const response = await fetch(`${this.backendUrl}/submit/written`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId, text })
            });
            if (!response.ok) {
                return { score: 80, feedback: "Well written, good grammar." };
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to submit written:", error);
            return { score: 0, feedback: "Network error" };
        }
    }

    // Text-To-Speech Helper
    async speak(text: string, voiceType: string = 'male_1', onEnd?: () => void) {
        // Stop any current speaking ( browser synthesis)
        window.speechSynthesis.cancel();

        try {
            // Request Azure TTS Audio
            const response = await fetch(`${this.backendUrl}/api/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({ text, voice_type: voiceType })
            });

            if (!response.ok) {
                throw new Error("TTS Failed");
            }

            const data = await response.json();
            if (!data.audio_content) throw new Error("No audio content in response");

            // Decode Base64
            const binaryString = window.atob(data.audio_content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
                if (onEnd) onEnd();
                URL.revokeObjectURL(url); // Cleanup
            };

            audio.play().catch(e => {
                console.warn("Audio playback failed (likely Safari/Autoplay restriction). Switching to browser TTS fallback.", e);
                URL.revokeObjectURL(url); // Cleanup
                this.speakFallback(text, voiceType, onEnd);
            });

        } catch (error) {
            console.error("Azure TTS failed, falling back to browser:", error);
            // Fallback to browser TTS
            this.speakFallback(text, voiceType, onEnd);
        }
    }

    private speakFallback(text: string, voiceType: string, onEnd?: () => void) {
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        if (voiceType.includes('female')) {
            selectedVoice = voices.find(v => v.name.includes("Zira") || v.name.includes("Female") || v.name.includes("Google US English")) || voices[1];
        } else {
            selectedVoice = voices.find(v => v.name.includes("David") || v.name.includes("Male")) || voices[0];
        }

        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 0.9;

        if (onEnd) utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
    }

    async playAudio(url: string, onEnd?: () => void) {
        window.speechSynthesis.cancel();
        try {
            const audio = new Audio(url);
            audio.onended = () => {
                if (onEnd) onEnd();
            };
            await audio.play();
        } catch (e) {
            console.error("Audio playback failed:", e);
            if (onEnd) onEnd();
        }
    }

    stopSpeaking() {
        window.speechSynthesis.cancel();
    }

    getSectionInfo(sectionId: SectionType) {
        return SECTIONS.find(s => s.id === sectionId);
    }
}

export const communicationService = new CommunicationBackendService();
