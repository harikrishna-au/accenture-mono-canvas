from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field, constr
import random
from typing import List, Optional, Literal
import uvicorn
import os
from dotenv import load_dotenv
from mangum import Mangum # Adapter for AWS Lambda
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load env variables including Azure keys
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

try:
    from backend.data import DATA_BANK
    from backend.services.azure_speech import generate_speech
    from backend.services.bedrock_analysis import analyze_overall_performance, grade_submission
except ImportError:
    # Lambda environment where backend/ contents are at root
    from data import DATA_BANK
    from services.azure_speech import generate_speech
    from services.bedrock_analysis import analyze_overall_performance, grade_submission

# Security: Rate Limiter Setup
limiter = Limiter(key_func=get_remote_address)

class GameHistoryItem(BaseModel):
    question: str = Field(..., max_length=1000)
    answer: str = Field(..., max_length=10000)
    score: Optional[int] = Field(0, ge=0, le=100)
    section: Optional[str] = "General"

class GameHistoryRequest(BaseModel):
    history: List[GameHistoryItem] = Field(..., max_items=100)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-game")
@limiter.limit("10/minute")
def analyze_game(request: Request, body: GameHistoryRequest): # 'request' arg required for limiter
    try:
        # Flatten history to dicts
        history_data = [item.dict() for item in body.history]
        return analyze_overall_performance(history_data)
    except Exception as e:
        print(f"Bedrock Error in analyze_game: {e}")
        raise HTTPException(status_code=500, detail="Analysis service unavailable")

# Lambda Handler
handler = Mangum(app)

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
    questionId: str = Field(..., max_length=100)
    transcript: str = Field(..., max_length=10000)

class WrittenSubmission(BaseModel):
    questionId: str = Field(..., max_length=100)
    text: str = Field(..., max_length=5000)

class TTSRequest(BaseModel):
    text: str = Field(..., max_length=500, description="Text to synthesize (max 500 chars)")
    voice_type: Literal["male_1", "male_2", "female_1", "female_2"] = "male_1"

@app.get("/")
@limiter.limit("60/minute")
def read_root(request: Request):
    return {"status": "online", "message": "Communication Backend Active with Azure AI"}

@app.get("/api/round1/sentence", response_model=SentenceResponse)
@limiter.limit("30/minute")
def get_random_sentence(request: Request):
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

import boto3
from boto3.dynamodb.conditions import Key

# DynamoDB Setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('communication_questions')

def find_question_in_dynamo(q_id: str):
    # 1. Try finding directly (Primary Key)
    try:
        response = table.get_item(Key={'id': q_id})
        if 'Item' in response:
            item = response['Item']
            return {
                "text": item.get("prompt_text") or item.get("audio_src") or "Question",
                "correct_answer": item.get("correct_answer")
            }
    except Exception as e:
        print(f"DynamoDB Direct Get Error: {e}")

    # 2. If not found, scan for sub-questions (Small dataset allows this)
    try:
        # Scan only items that have sub_questions
        response = table.scan(FilterExpression="attribute_exists(sub_questions)")
        for item in response.get('Items', []):
            subs = item.get("sub_questions", [])
            if isinstance(subs, list):
                for sub in subs:
                    if sub.get("id") == q_id:
                        return {
                            "text": sub.get("audioSrc") or "Question", 
                            "correct_answer": sub.get("correctAnswer")
                        }
    except Exception as e:
        print(f"DynamoDB Sub-question Scan Error: {e}")
        
    return None

from decimal import Decimal

def snake_to_camel(snake_str):
    """Convert snake_case to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def convert_to_camel_case(obj):
    """Recursively convert all keys in a dict/list from snake_case to camelCase"""
    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            # Convert Decimal to int/float
            if isinstance(v, Decimal):
                v = int(v) if v % 1 == 0 else float(v)
            # Recursively convert nested objects
            v = convert_to_camel_case(v)
            # Convert key to camelCase
            new_key = snake_to_camel(k)
            new_obj[new_key] = v
        return new_obj
    elif isinstance(obj, list):
        return [convert_to_camel_case(item) for item in obj]
    else:
        return obj

@app.get("/api/questions")
@limiter.limit("20/minute")
def get_questions(request: Request, section: str):
    try:
        # Use Scan with FilterExpression (works without GSI)
        response = table.scan(
            FilterExpression=Key('section').eq(section)
        )
        items = response.get('Items', [])
        
        # Define required counts per section (Updated per requirements)
        SECTION_COUNTS = {
            'A': 3,  # 3 Scenarios (approx 6 questions)
            'B': 2,  # 2 Passages (approx 6 questions)
            'C': 12, # Reading Aloud
            'D': 10, # Listen & Repeat
            'E': 8,  # Fill in Missing Word
            'F': 5,  # Error Correction
            'G': 1,  # Speaking Topic
            'WRITTEN': 1
        }
        
        required_count = SECTION_COUNTS.get(section, len(items))
        
        # Randomly sample unique items if pool is larger than required
        if len(items) > required_count:
            items = random.sample(items, required_count)
            
        # Transform to camelCase recursively
        transformed_items = [convert_to_camel_case(item) for item in items]
                    
        return transformed_items
    except Exception as e:
        print(f"DynamoDB Query Error: {e}")
        raise HTTPException(status_code=500, detail="Database Error")

@app.post("/submit/audio")
@limiter.limit("15/minute")
def submit_audio(request: Request, submission: AudioSubmission):
    target_question = None

    # Try DynamoDB
    found = find_question_in_dynamo(submission.questionId)
    if found:
        target_question = found
        print(f"Found question in DynamoDB: {found}")

    # Fallback to local DATA_BANK (legacy support)
    if not target_question:
        for sentence in DATA_BANK:
            for q in sentence["questions"]:
                if q["id"] == submission.questionId:
                    target_question = {"text": q["text"], "correct_answer": q["correct_answer"]}
                    break
            if target_question:
                break
            
    if not target_question:
        return {
            "score": 0,
            "feedback": "Question not found (checked DynamoDB and Local Bank)."
        }
    
    # Use Bedrock Grading (Claude 3.5 Sonnet)
    print(f"Grading with Bedrock: {submission.transcript}")
    try:
        result = grade_submission(target_question["text"], submission.transcript)
        return result
    except Exception as e:
        print(f"Bedrock Error in submit_audio: {e}")
        raise HTTPException(status_code=500, detail=f"Bedrock Error: {str(e)}")

@app.post("/submit/written")
@limiter.limit("15/minute")
def submit_written(request: Request, submission: WrittenSubmission):
    target_question = None

    # Try DynamoDB
    found = find_question_in_dynamo(submission.questionId)
    if found:
        target_question = found
        print(f"Found question in DynamoDB: {found}")

    # Fallback to local DATA_BANK (legacy support)
    if not target_question:
        for sentence in DATA_BANK:
            for q in sentence["questions"]:
                if q["id"] == submission.questionId:
                    target_question = {"text": q["text"], "correct_answer": q["correct_answer"]}
                    break
            if target_question:
                break
            
    if not target_question:
        return {
            "score": 0,
            "feedback": "Question not found (checked DynamoDB and Local Bank)."
        }
    
    # Use Bedrock Grading (Claude 3.5 Sonnet)
    print(f"Grading written response with Bedrock: {submission.text}")
    try:
        result = grade_submission(target_question["text"], submission.text)
        return result
    except Exception as e:
        print(f"Bedrock Error in submit_written: {e}")
        raise HTTPException(status_code=500, detail= "Grading Service Unavailable")

import base64

@app.post("/api/tts")
@limiter.limit("5/minute")
def get_tts_audio(request: Request, body: TTSRequest):
    """Generates Azure Neural TTS audio"""
    
    # Map friendly voice types to Azure Neural Voices
    voice_map = {
        "male_1": "en-US-GuyNeural",
        "male_2": "en-US-DavisNeural",
        "female_1": "en-US-JennyNeural",
        "female_2": "en-US-SaraNeural"
    }
    
    azure_voice = voice_map.get(body.voice_type, "en-US-GuyNeural")
    
    audio_data = generate_speech(body.text, azure_voice)
    
    if not audio_data:
        raise HTTPException(status_code=500, detail="TTS Generation Failed")
        
    # Robust Fix: Return Base64 encoded JSON to avoid API Gateway binary corruption
    b64_audio = base64.b64encode(audio_data).decode('utf-8')
    return {"audio_content": b64_audio}

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
