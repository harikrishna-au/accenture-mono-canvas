import { Question, SectionType, SECTIONS } from "../data/types";

// Types matching Backend Response
interface BackendQuestion {
    id: string;
    text: string;
    options: string[];
}

interface BackendSentence {
    id: string;
    text: string;
    voice_type: string;
    questions: BackendQuestion[];
}



export class CommunicationBackendService {

    private backendUrl = "http://localhost:8000";

    // Round 1: Get Random Sentence
    async getRound1Content(): Promise<Question | undefined> {
        try {
            const response = await fetch(`${this.backendUrl}/api/round1/sentence`);
            if (!response.ok) return undefined;

            const data: BackendSentence = await response.json();

            // Map backend response to frontend Question format
            return {
                id: data.id,
                section: 'A',
                promptText: data.text,
                audioSrc: data.text, // For TTS to read
                voiceType: data.voice_type,
                subQuestions: data.questions
            };
        } catch (error) {
            console.error("Failed to fetch round 1 content:", error);
            return undefined;
        }
    }

    // Legacy/Other sections (keep existing or mock for now)
    async getQuestionForSection(section: SectionType): Promise<Question | undefined> {
        // For now, if Section is A (Listening), use the new Round 1 logic
        if (section === 'A') {
            return this.getRound1Content();
        }

        // Fallback or other sections implementation
        return undefined;
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
