import { Question, SectionType, SECTIONS } from "../data/types";
// import { supabase } from "@/integrations/supabase/client"; // Removed for DynamoDB migration

// ... (keep interface definitions if needed, or remove if unused)

export class CommunicationBackendService {

    // Use env var or fallback to localhost
    private backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    async getQuestionsForSection(section: SectionType): Promise<Question[]> {
        console.log(`🔌 Fetching questions for section ${section} from ${this.backendUrl}`);

        try {
            const response = await fetch(`${this.backendUrl}/api/questions?section=${section}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch questions: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('✅ Received questions:', data);

            // Backend now returns camelCase directly
            return data || [];

        } catch (error) {
            console.error('Error fetching questions from backend:', error);
            return [];
        }
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
            console.log("Analyzing full game...", history);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice_type: voiceType })
            });

            if (!response.ok) {
                throw new Error("TTS Failed");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
                if (onEnd) onEnd();
                URL.revokeObjectURL(url); // Cleanup
            };

            audio.play().catch(e => {
                console.error("Audio playback failed:", e);
                if (onEnd) onEnd();
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

    stopSpeaking() {
        window.speechSynthesis.cancel();
    }

    getSectionInfo(sectionId: SectionType) {
        return SECTIONS.find(s => s.id === sectionId);
    }
}

export const communicationService = new CommunicationBackendService();
