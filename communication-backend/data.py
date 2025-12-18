from typing import List, Optional
from pydantic import BaseModel

class QuestionBase(BaseModel):
    id: str
    section: str
    promptText: Optional[str] = None
    audioSrc: Optional[str] = None
    followUpQuestion: Optional[str] = None
    correctAnswer: Optional[str] = None
    timeLimit: Optional[int] = None
    description: Optional[str] = None # Added description for context

MOCK_QUESTIONS = [
    # Section A: Listening Comprehension
    {
        "id": "a1",
        "section": "A",
        "description": "Listening Comprehension",
        "audioSrc": "The extensive renovation of the city library is essentially complete. New study rooms and a larger computer lab are available for public use starting tomorrow.",
        "promptText": "Listen to the paragraph and answer the question.",
        "followUpQuestion": "When can the public start using the new facilities?",
        "correctAnswer": "The public can start using the new facilities starting tomorrow." # Complete sentence required
    },
    # Section B: Conversation Response
    {
        "id": "b1",
        "section": "B",
        "description": "Conversation Response",
        "promptText": "Listen to the dialogue and respond politely.",
        "audioSrc": "Alex: 'Hey, are you coming to the Hackathon this weekend?' ... Sarah: 'I really want to, but I have a huge assignment due Monday.'",
        "followUpQuestion": "How would you advise Sarah to handle this situation politely?",
        "correctAnswer": "Sarah could try to finish her assignment early and join for a short time." # Example polite response
    },
    # Section C: Reading Aloud
    {
        "id": "c1",
        "section": "C",
        "description": "Reading Aloud",
        "promptText": "The quick brown fox jumps over the lazy dog to ensure strictly validated protocols are followed."
        # No audioSrc, user reads promptText. correctAnswer is promptText.
    },
    # Section D: Listen and Repeat
    {
        "id": "d1",
        "section": "D",
        "description": "Listen and Repeat",
        "audioSrc": "Please make sure to sign the register before entering the conference room.",
        "promptText": "(Listen and Repeat exactly)",
        "correctAnswer": "Please make sure to sign the register before entering the conference room."
    },
    # Section E: Fill the Missing Word
    {
        "id": "e1",
        "section": "E",
        "description": "Fill the Missing Word",
        "audioSrc": "The manager decided to [BEEP] the meeting until Friday.",
        "promptText": "The manager decided to _____ the meeting until Friday.",
        "correctAnswer": "The manager decided to postpone the meeting until Friday." # Full sentence
    },
    # Section F: Error Correction
    {
        "id": "f1",
        "section": "F",
        "description": "Error Correction",
        "audioSrc": "She have gone to the market yesterday.",
        "promptText": "(Correct the error and say the full sentence)",
        "correctAnswer": "She went to the market yesterday."
    },
    # Section G: Speaking on a Topic (Monologue)
    {
        "id": "g1",
        "section": "G",
        "description": "Speaking on a Topic",
        "promptText": "Describe a memorable team project you worked on.",
        "timeLimit": 45
    },
    # WRITTEN (Extra section from previous requirements, keeping it)
    {
        "id": "w1",
        "section": "WRITTEN",
        "description": "Written Communication",
        "promptText": "Scenario: You received critical feedback from your manager regarding a recent report which had data inaccuracies. Write an email explaining that you have corrected the data and ensuring it won't happen again."
    }
]
