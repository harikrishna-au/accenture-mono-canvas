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
    speak(text: string, onEnd?: () => void) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
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
