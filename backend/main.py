from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import random
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

# Load env variables including Azure keys
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

from backend.data import DATA_BANK
from backend.services.azure_grading import grade_submission
from backend.services.azure_speech import generate_speech

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionOption(BaseModel):
    id: str
    text: str
    options: List[str]

class SentenceResponse(BaseModel):
    id: str
    text: str
    voice_type: str
    questions: List[QuestionOption]

class GradeRequest(BaseModel):
    question_id: str
    sentence_id: str
    answer: str

class GradeResponse(BaseModel):
    score: int
    correct: bool
    explanation: str

class AudioSubmission(BaseModel):
    questionId: str
    transcript: str

class TTSRequest(BaseModel):
    text: str
    voice_type: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "Communication Backend Active with Azure AI"}

@app.get("/api/round1/sentence", response_model=SentenceResponse)
def get_random_sentence():
    """Returns a random sentence with its associated questions."""
    item = random.choice(DATA_BANK)
    
    # Transform to response model (hiding correct answer)
    questions_clean = []
    for q in item["questions"]:
        questions_clean.append({
            "id": q["id"],
            "text": q["text"],
            "options": q["options"]
        })
        
    return {
        "id": item["id"],
        "text": item["text"],
        "voice_type": item["voice_type"],
        "questions": questions_clean
    }

@app.post("/submit/audio")
def submit_audio(submission: AudioSubmission):
    # Search for question across all sentences
    target_question = None
    target_sentence_text = ""
    
    for sentence in DATA_BANK:
        for q in sentence["questions"]:
            if q["id"] == submission.questionId:
                target_question = q
                target_sentence_text = sentence["text"]
                break
        if target_question:
            break
            
    if not target_question:
        return {
            "score": 0,
            "feedback": "Question not found in bank."
        }
    
    # Use Azure OpenAI for grading if keys exist, else fallback
    if os.getenv("AZURE_OPENAI_API_KEY"):
        print(f"Grading with Azure OpenAI: {submission.transcript}")
        result = grade_submission(target_question["text"], target_question["correct_answer"], submission.transcript)
        return result
    else:
        # Fallback Logic (same as before)
        correct_answer = target_question["correct_answer"].lower()
        user_answer = submission.transcript.lower()
        score = 0
        feedback = ""
        keywords = correct_answer.split()
        matched_keywords = [k for k in keywords if k in user_answer]
        
        if len(matched_keywords) >= len(keywords) * 0.5:
            score = 85
            feedback = "Good answer! (Fallback grading used)"
        elif len(matched_keywords) > 0:
            score = 60
            feedback = f"Partially correct. The expected answer was related to: {target_question['correct_answer']}"
        else:
            score = 40
            feedback = f"Incorrect. The correct answer was: {target_question['correct_answer']}"

        return {
            "score": score,
            "feedback": feedback
        }

@app.post("/api/tts")
def get_tts_audio(request: TTSRequest):
    """Generates Azure Neural TTS audio"""
    
    # Map friendly voice types to Azure Neural Voices
    voice_map = {
        "male_1": "en-US-GuyNeural",
        "male_2": "en-US-DavisNeural",
        "female_1": "en-US-JennyNeural",
        "female_2": "en-US-SaraNeural"
    }
    
    azure_voice = voice_map.get(request.voice_type, "en-US-GuyNeural")
    
    audio_data = generate_speech(request.text, azure_voice)
    
    if not audio_data:
        raise HTTPException(status_code=500, detail="TTS Generation Failed (Check Azure Keys)")
        
    return Response(content=audio_data, media_type="audio/mpeg")

@app.post("/api/round1/grade", response_model=GradeResponse)
def grade_answer(request: GradeRequest):
    # Find the sentence
    sentence = next((s for s in DATA_BANK if s["id"] == request.sentence_id), None)
    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")
        
    # Find the question
    question = next((q for q in sentence["questions"] if q["id"] == request.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    is_correct = request.answer == question["correct_answer"]
    
    return {
        "score": 10 if is_correct else 0,
        "correct": is_correct,
        "explanation": f"The correct answer was: {question['correct_answer']}"
    }

# Entry point for running directly
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
