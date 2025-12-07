import { Question, SectionType, MOCK_QUESTIONS, SECTIONS } from "../data/types";

export class CommunicationBackendService {
    private questions: Question[] = MOCK_QUESTIONS;

    // Simulate fetching a question
    async getQuestionForSection(section: SectionType): Promise<Question | undefined> {
        // In a real backend, this would fetch from DB randomly or sequentially
        return new Promise((resolve) => {
            setTimeout(() => {
                const q = this.questions.find(q => q.section === section);
                resolve(q);
            }, 500); // Simulate network delay
        });
    }

    // Simulate submitting an audio response (grading)
    async submitAudioResponse(questionId: string, transcript: string): Promise<{ score: number; feedback: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock grading logic
                const question = this.questions.find(q => q.id === questionId);
                if (!question) {
                    resolve({ score: 0, feedback: "Error: Question not found" });
                    return;
                }

                // Simple length check for demo
                if (transcript.length < 5) {
                    resolve({ score: 20, feedback: "Response too short." });
                    return;
                }

                // Fuzzy match simulation
                if (question.correctAnswer) {
                    // Very basic check: does it contain some words?
                    resolve({ score: 85, feedback: "Good attempt. Pronunciation was clear." });
                } else {
                    // For open ended (Monologue)
                    resolve({ score: 90, feedback: "Fluent speech with good structure." });
                }
            }, 1000);
        });
    }

    // Simulate submitting written response
    async submitWrittenResponse(questionId: string, text: string): Promise<{ score: number; feedback: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const wordCount = text.trim().split(/\s+/).length;
                if (wordCount < 30) {
                    resolve({ score: 40, feedback: "Response is too short. Minimum 30 words required." });
                } else {
                    resolve({ score: 95, feedback: "Excellent email structure and tone." });
                }
            }, 1000);
        });
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
