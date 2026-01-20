// Types definition for Communication Game
export type SectionType =
    | 'DEVICE_CHECK' // Intro check
    | 'A' // Listening Comprehension
    | 'B' // Conversation Response
    | 'C' // Reading Aloud
    | 'D' // Listen and Repeat
    | 'E' // Fill the Missing Word
    | 'F' // Error Correction
    | 'G' // Speaking on a Topic (Monologue)
    | 'WRITTEN' // Email Writing (Optional/Extra)
    | 'SUMMARY'; // Final Analysis

export interface Question {
    id: string;
    section: SectionType;
    promptText?: string; // Text to read or topic
    contextAudioSrc?: string; // Main story/situation audio (played once)
    contextAudioUrl?: string; // S3 URL for context audio
    audioSrc?: string; // Specific question audio (played for each sub-question)
    audioUrl?: string; // S3 URL for question audio
    followUpQuestion?: string; // Should be spoken after the audioSrc for Listening Comp
    correctAnswer?: string; // For grading
    timeLimit?: number; // In seconds
    voiceType?: string; // voice_type from backend
    wordRange?: string; // For written questions (e.g., "200-250 words")
    subQuestions?: { // For multi-turn dialogs like Section B or A
        id: string;
        section: SectionType; // Redundant but useful for type matching if needed, or just inherit
        text?: string; // Prompt text for sub-question
        audioSrc?: string; // Audio for the specific question
        audioUrl?: string; // S3 URL
        correctAnswer?: string;
        options?: string[];
    }[];
}

export interface SectionInfo {
    id: SectionType;
    title: string;
    description: string;
    skillTested: string;
    instructions: string;
}

export const SECTIONS: SectionInfo[] = [
    {
        id: 'DEVICE_CHECK',
        title: 'Device Compatibility',
        description: 'Read the sentence to test your microphone.',
        skillTested: 'Hardware Check',
        instructions: 'Please read the given sentence to ensure your microphone is working correctly.',
    },
    {
        id: 'A',
        title: 'Listening Comprehension',
        description: 'Listen to a short paragraph and answer a question.',
        skillTested: 'Listening skills and sentence formation',
        instructions: 'Listen to the given information and answer the following questions with a complete single sentence.',
    },
    {
        id: 'B',
        title: 'Conversation Response',
        description: 'Respond to a short dialogue politely.',
        skillTested: 'Context understanding',
        instructions: 'You will hear a description of a situation followed by a conversation dialogue. Please listen to the dialogue and provide an appropriate response.',
    },
    {
        id: 'C',
        title: 'Reading Aloud',
        description: 'Read a sentence displayed on screen aloud.',
        skillTested: 'Pronunciation, fluency, and pace',
        instructions: 'Speak the sentence displayed on the screen.',
    },
    {
        id: 'D',
        title: 'Listen and Repeat',
        description: 'Repeat exactly what you heard.',
        skillTested: 'Listening accuracy, memory, pronunciation',
        instructions: 'Listen and repeat the sentence that you hear. Each sentence will be played one time only.',
    },
    {
        id: 'E',
        title: 'Fill the Missing Word',
        description: 'Repeat the sentence filling in the blank.',
        skillTested: 'Grammar and listening skills',
        instructions: 'You will hear a sentence that is missing one word. Fill in the missing word and repeat the complete sentence.',
    },
    {
        id: 'F',
        title: 'Error Correction',
        description: 'Correct the grammatical mistake in the sentence.',
        skillTested: 'Grammar knowledge and quick correction',
        instructions: 'You will hear a sentence that contains an error. Correct the error and repeat the complete sentence.',
    },
    {
        id: 'G',
        title: 'Speaking on a Topic',
        description: 'Speak on a topic for 45s after 30s prep.',
        skillTested: 'Fluency, vocabulary, and pronunciation',
        instructions: 'You will be provided with a topic. You will have 30 seconds to think about the topic and 45 seconds to speak about it.',
    }
];


