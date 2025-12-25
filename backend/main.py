from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import random
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from mangum import Mangum # Adapter for AWS Lambda

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

class GameHistoryItem(BaseModel):
    question: str
    answer: str
    score: Optional[int] = 0
    section: Optional[str] = "General"

class GameHistoryRequest(BaseModel):
    history: List[GameHistoryItem]

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-game")
def analyze_game(request: GameHistoryRequest):
    try:
        # Flatten history to dicts
        history_data = [item.dict() for item in request.history]
        return analyze_overall_performance(history_data)
    except Exception as e:
        print(f"Bedrock Error in analyze_game: {e}")
        raise HTTPException(status_code=500, detail=f"Bedrock Error: {str(e)}")

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
    questionId: str
    transcript: str

class WrittenSubmission(BaseModel):
    questionId: str
    text: str

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
def get_questions(section: str):
    try:
        # Use Scan with FilterExpression (works without GSI)
        response = table.scan(
            FilterExpression=Key('section').eq(section)
        )
        items = response.get('Items', [])
        
        # Transform to camelCase recursively
        transformed_items = [convert_to_camel_case(item) for item in items]
                    
        return transformed_items
    except Exception as e:
        print(f"DynamoDB Query Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit/audio")
def submit_audio(submission: AudioSubmission):
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
def submit_written(submission: WrittenSubmission):
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
        raise HTTPException(status_code=500, detail=f"Bedrock Error: {str(e)}")

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
