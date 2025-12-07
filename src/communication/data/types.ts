export type SectionType =
    | 'A' // Listening Comprehension
    | 'B' // Conversation Response
    | 'C' // Reading Aloud
    | 'D' // Listen and Repeat
    | 'E' // Fill the Missing Word
    | 'F' // Error Correction
    | 'G' // Speaking on a Topic (Monologue)
    | 'WRITTEN'; // Email Writing

export interface Question {
    id: string;
    section: SectionType;
    promptText?: string; // Text to read or topic
    audioSrc?: string; // Audio to listen to (simulated via TTS)
    followUpQuestion?: string; // Should be spoken after the audioSrc for Listening Comp
    correctAnswer?: string; // For grading
    timeLimit?: number; // In seconds
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
        id: 'A',
        title: 'Listening Comprehension',
        description: 'Listen to a short paragraph and answer a question.',
        skillTested: 'Listening skills and sentence formation',
        instructions: 'You must listen to a short paragraph and then speak the answer to a question based on the content in one complete sentence. The answer must be crisp and clear.',
    },
    {
        id: 'B',
        title: 'Conversation Response',
        description: 'Respond to a short dialogue politely.',
        skillTested: 'Context understanding',
        instructions: 'You will hear a short dialogue from a bot (simulating a person) and must respond appropriately in a polite and natural manner.',
    },
    {
        id: 'C',
        title: 'Reading Aloud',
        description: 'Read a sentence displayed on screen aloud.',
        skillTested: 'Pronunciation, fluency, and pace',
        instructions: 'You are required to read the sentence displayed on the screen aloud clearly. Maintain a steady tempo.',
    },
    {
        id: 'D',
        title: 'Listen and Repeat',
        description: 'Repeat exactly what you heard.',
        skillTested: 'Listening accuracy, memory, pronunciation',
        instructions: 'You must listen to a sentence and then repeat exactly what you heard. Observe pauses and avoid fumbling.',
    },
    {
        id: 'E',
        title: 'Fill the Missing Word',
        description: 'Repeat the sentence filling in the blank.',
        skillTested: 'Grammar and listening skills',
        instructions: 'You will hear a sentence with a missing word and must repeat the complete sentence, filling in the blank with the correct word.',
    },
    {
        id: 'F',
        title: 'Error Correction',
        description: 'Correct the grammatical mistake in the sentence.',
        skillTested: 'Grammar knowledge and quick correction',
        instructions: 'The bot will speak a sentence that contains a grammatical mistake. You need to rectify the error and read the corrected sentence aloud.',
    },
    {
        id: 'G',
        title: 'Speaking on a Topic',
        description: 'Speak on a topic for 45s after 30s prep.',
        skillTested: 'Fluency, vocabulary, and pronunciation',
        instructions: 'You are given a topic and allotted 30 seconds for preparation. Speak for about 45 seconds.',
    },
    {
        id: 'WRITTEN',
        title: 'Written Communication',
        description: 'Compose an email response.',
        skillTested: 'Writing skills, context understanding',
        instructions: 'Compose an email response based on a provided topic. Minimum 30 words.',
    }
];

export const MOCK_QUESTIONS: Question[] = [
    // Section A: Listening Comprehension
    {
        id: 'a1',
        section: 'A',
        promptText: 'Listen to the passage about the library.',
        audioSrc: 'The extensive renovation of the city library is essentially complete. New study rooms and a larger computer lab are available for public use starting tomorrow.', // Text for TTS
        followUpQuestion: 'When can the public start using the new facilities?',
        correctAnswer: 'The library renovation is complete and opens tomorrow.',
    },
    // Section B: Conversation Response
    {
        id: 'b1',
        section: 'B',
        promptText: 'Bot: "I am sorry, but I cannot approve your leave request for next week because of the upcoming project deadline."',
        audioSrc: 'I am sorry, but I cannot approve your leave request for next week because of the upcoming project deadline.',
        correctAnswer: 'I understand the situation. I will reschedule my leave for after the deadline.',
    },
    // Section C: Reading Aloud
    {
        id: 'c1',
        section: 'C',
        promptText: 'The quick brown fox jumps over the lazy dog to ensure strictly validated protocols are followed.',
    },
    // Section D: Listen and Repeat
    {
        id: 'd1',
        section: 'D',
        audioSrc: 'Please make sure to sign the register before entering the conference room.',
        promptText: '(Listen and Repeat)',
    },
    // Section E: Fill Missing Word
    {
        id: 'e1',
        section: 'E',
        audioSrc: 'The manager decided to [BEEP] the meeting until Friday.',
        promptText: 'The manager decided to _____ the meeting until Friday.',
        correctAnswer: 'The manager decided to postpone the meeting until Friday.',
    },
    // Section F: Error Correction
    {
        id: 'f1',
        section: 'F',
        audioSrc: 'She have gone to the market yesterday.', // Error: have -> went/has gone (context yesterday -> went)
        promptText: '(Correct the error)',
        correctAnswer: 'She went to the market yesterday.',
    },
    // Section G: Monologue
    {
        id: 'g1',
        section: 'G',
        promptText: 'Describe a memorable team project you worked on.',
        timeLimit: 45,
    },
    // Written
    {
        id: 'w1',
        section: 'WRITTEN',
        promptText: 'Scenario: You received critical feedback from your manager regarding a recent report which had data inaccuracies. Write an email explaining that you have corrected the data and ensuring it won\'t happen again.',
    }
];
