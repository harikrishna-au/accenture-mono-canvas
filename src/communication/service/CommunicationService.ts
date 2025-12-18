import { Question, SectionType, SECTIONS } from "../data/types";

export class CommunicationBackendService {

    private backendUrl = "http://localhost:8000";

    // Fetch a question from the backend
    async getQuestionForSection(section: SectionType): Promise<Question | undefined> {
        try {
            const response = await fetch(`${this.backendUrl}/questions/${section}`);
            if (!response.ok) return undefined;
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch question:", error);
            return undefined;
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
                return { score: 0, feedback: "Error submitting response" };
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
                return { score: 0, feedback: "Error submitting response" };
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to submit written:", error);
            return { score: 0, feedback: "Network error" };
        }
    }

    // Text-To-Speech Helper (Frontend side of "Backend" services)
    // Text-To-Speech Helper (Frontend side of "Backend" services)
    speak(text: string, onEnd?: () => void) {
        // Stop any current speaking
        window.speechSynthesis.cancel();

        // Check for our special "dialogue" format roughly
        // Format: "PersonA: ... ... PersonB: ..."
        if (text.includes("Alex (Male voice):") || text.includes("Sarah (Female voice):")) {
            this.speakDialogue(text, onEnd);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        if (onEnd) utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
    }

    private speakDialogue(fullText: string, onEnd?: () => void) {
        // Simple splitter for demo purposes - assumes the specific format in our mock data
        // "Alex (Male voice): [Text] ... Sarah (Female voice): [Text]"
        const parts = fullText.split(" ... ");

        let currentIndex = 0;

        const speakPart = () => {
            if (currentIndex >= parts.length) {
                if (onEnd) onEnd();
                return;
            }

            const part = parts[currentIndex];
            let cleanText = part;
            let isMale = true; // default

            if (part.includes("Alex (Male voice):")) {
                cleanText = part.replace("Alex (Male voice):", "").trim();
                isMale = true;
            } else if (part.includes("Sarah (Female voice):")) {
                cleanText = part.replace("Sarah (Female voice):", "").trim();
                isMale = false;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voices = window.speechSynthesis.getVoices();

            // Try to find gendered voices (rough heuristic)
            // Note: Browser support for specific voices varies wildly. 
            // This is a best-effort attempt.
            const maleVoice = voices.find(v => v.name.includes("David") || v.name.includes("Male")) || voices[0];
            const femaleVoice = voices.find(v => v.name.includes("Zira") || v.name.includes("Female") || v.name.includes("Google US English")) || voices[1] || voices[0];

            utterance.voice = isMale ? maleVoice : femaleVoice;
            utterance.rate = 0.9;

            utterance.onend = () => {
                currentIndex++;
                setTimeout(speakPart, 300); // Pause between speakers
            };

            window.speechSynthesis.speak(utterance);
        };

        speakPart();
    }

    stopSpeaking() {
        window.speechSynthesis.cancel();
    }

    getSectionInfo(sectionId: SectionType) {
        return SECTIONS.find(s => s.id === sectionId);
    }
}

export const communicationService = new CommunicationBackendService();
