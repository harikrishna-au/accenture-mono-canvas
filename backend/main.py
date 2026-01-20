from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field, constr
import random
import shutil 
from pathlib import Path
from pypdf import PdfReader
from typing import List, Optional, Literal
import uvicorn
import os
from dotenv import load_dotenv
from mangum import Mangum # Adapter for AWS Lambda
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uuid
import time
import json
from openai import OpenAI
import boto3

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

# --- CLIENT INITIALIZATION ---
try:
    if os.environ.get("OPENAI_API_KEY"):
        openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    else:
        print("WARNING: OPENAI_API_KEY not found in environment variables.")
        openai_client = None
except Exception as e:
    print(f"OpenAI Init Error: {e}")
    openai_client = None

polly_client = boto3.client('polly')
dynamodb = boto3.resource('dynamodb')
interview_table = dynamodb.Table(os.environ.get('INTERVIEW_TABLE', 'interview_sessions'))

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
        # DEBUG: Return actual error to identify issue
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
    questionId: str = Field(..., max_length=100)
    transcript: str = Field(..., max_length=10000)

class WrittenSubmission(BaseModel):
    questionId: str = Field(..., max_length=100)
    text: str = Field(..., max_length=5000)

class TTSRequest(BaseModel):
    text: str = Field(..., max_length=500, description="Text to synthesize (max 500 chars)")
    voice_type: Literal["male_1", "male_2", "female_1", "female_2"] = "male_1"

# --- INTERVIEW MODELS ---
class InterviewStartRequest(BaseModel):
    resume_text: str = Field(..., max_length=10000)
    user_id: str = Field(None, description="Clerk User ID")

class InterviewChatRequest(BaseModel):
    session_id: str
    user_text: str

class InterviewEndRequest(BaseModel):
    session_id: str

class InterviewStartResponse(BaseModel):
    session_id: str
    ai_message: str
    audio_content: str

class InterviewChatResponse(BaseModel):
    ai_message: str
    audio_content: str
    status: str

# --- RESUME UPLOAD ENDPOINT ---

class ResumeUploadRequest(BaseModel):
    filename: str

@app.post("/api/resume/upload-url")
@limiter.limit("5/minute")
def get_resume_upload_url(request: Request, body: ResumeUploadRequest):
    try:
        bucket_name = os.environ.get("RESUME_BUCKET_NAME")
        if not bucket_name:
             # Fallback logic for local testing or if env var missing
             # In production, this should come from CloudFormation outputs -> Env Var
             print("WARNING: RESUME_BUCKET_NAME not set")
             return {"error": "Resume storage not configured"}

        object_name = f"resumes/{uuid.uuid4()}_{body.filename}"
        
        # Generate Presigned URL
        s3_client = boto3.client('s3')
        try:
            response = s3_client.generate_presigned_post(
                Bucket=bucket_name,
                Key=object_name,
                Fields={"acl": "public-read", "Content-Type": "application/pdf"},
                Conditions=[
                    {"acl": "public-read"},
                    {"Content-Type": "application/pdf"},
                    ["content-length-range", 1, 10485760] # Max 10MB
                ],
                ExpiresIn=3600
            )
            return response
        except Exception as e:
            print(f"S3 Presign Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate upload URL")

    except Exception as e:
        print(f"Resume Upload Setup Error: {e}")
        raise HTTPException(status_code=500, detail="Server Error")

# --- ENDPOINTS ---

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
        # Use Query on GSI 'SectionIndex' for performance
        response = table.query(
            IndexName='SectionIndex',
            KeyConditionExpression=Key('section').eq(section)
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
    """Generates Amazon Polly TTS audio"""
    
    # Map friendly voice types to Amazon Polly Neural Voices
    voice_map = {
        "male_1": "Matthew",
        "male_2": "Joey",
        "female_1": "Joanna",
        "female_2": "Salli"
    }
    
    polly_voice = voice_map.get(body.voice_type, "Matthew")
    
    try:
        polly = boto3.client('polly')
        response = polly.synthesize_speech(
            Text=body.text,
            OutputFormat='mp3',
            VoiceId=polly_voice,
            Engine='neural'
        )
        
        if "AudioStream" in response:
            audio_bytes = response["AudioStream"].read()
            # Return Base64 encoded JSON
            b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            return {"audio_content": b64_audio}
        else:
            raise HTTPException(status_code=500, detail="Polly Generation Failed (No Stream)")
            
    except Exception as e:
        print(f"Polly Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS Error: {str(e)}")

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

# --- INTERVIEW ENDPOINTS ---
@app.post("/api/interview/start", response_model=InterviewStartResponse)
def start_interview(
    resume_text: str = Form(None), 
    user_id: str = Form(None),
    resume_file: UploadFile = File(None)
):
    # 0. Check Attempt Limit (if User ID provided)
    # 0. Check Attempt Limit (if User ID provided)
    if user_id:
        try:
            print(f"Checking limit for user: {user_id}")
            response = interview_table.query(
                IndexName='UserIdIndex',
                KeyConditionExpression=Key('user_id').eq(user_id)
            )
            items = response.get('Items', [])
            # Filter for completed sessions only
            completed_count = sum(1 for item in items if item.get('status') == 'completed')
            print(f"User {user_id} has {completed_count} completed interviews.")
            
            if completed_count >= 2:
                print(f"Limit reached for {user_id}")
                raise HTTPException(status_code=403, detail="Free limit reached. You have completed 2 interviews.")
        except HTTPException:
            raise
        except Exception as e:
            # FAIL OPEN: If DB check fails, let them proceed but log it
            print(f"⚠️ LIMIT CHECK FAILED (Allowing to proceed): {e}")
            pass 

    # 1. Process Resume
    final_resume_text = ""
    
    if resume_file:
        try:
            reader = PdfReader(resume_file.file)
            for page in reader.pages:
                final_resume_text += page.extract_text() + "\n"
        except Exception as e:
            print(f"PDF Error: {e}")
            raise HTTPException(status_code=400, detail="Failed to read PDF file")
    elif resume_text:
        final_resume_text = resume_text
    
    if not final_resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume content is required (text or PDF)")

    session_id = str(uuid.uuid4())
    
    system_prompt = f"""
    You are Sarah, a Senior HR Manager at a top tech company. You are conducting a strict 15-minute behavioral interview for the following candidate.
    
    CANDIDATE RESUME:
    "{body.resume_text}"

    GOAL: Assess culture fit, communication, and project experience. Do NOT ask deep technical coding questions (e.g., "Write a function to..."). Focus on the "Why", "How", and "Impact".

    STRUCTURE:
    1.  **Introduction Phase (0-4 minutes)**:
        *   Start by asking the candidate to introduce themselves.
        *   **CRITICAL**: You MUST keep asking follow-up engagement questions about their background, hobbies, or summary until approximately 4 minutes have passed.
        *   If the user answers quickly, say "That's interesting, tell me more about..." or "How did you get into [topic]?".
        *   Do NOT move to the main questions until you have established rapport and ~4 minutes of conversation have occurred.

    2.  **Main Interview Questions (4-12 minutes)**:
        *   Ask exactly 5 distinct questions based on their resume.
        *   Focus on: Teamwork, Challenges, Project Impact, and Behavioral Scenarios.
        *   Example Pattern:
            *   Q1: specific project challenge.
            *   Q2: conflict resolution / teamwork.
            *   Q3: handling deadlines / pressure.
            *   Q4: learning new technology (process, not code).
            *   Q5: why this role/company?

    3.  **Closing (12-15 minutes)**:
        *   Wrap up and ask if they have questions.

    RULES:
    - Keep your responses concise (under 3 sentences).
    - Be professional but encouraging.
    - If the user's answer is too short, PROBE DEEPER.
    
    Start with a warm greeting and ask them to introduce themselves.
    """
    
    # 2. Get Initial Question from OpenAI
    try:
        if not openai_client:
             raise HTTPException(status_code=500, detail="OpenAI API Key not configured on server")

        completion = openai_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the candidate's resume:\n{final_resume_text}\n\nStart the interview."}
            ],
            model="gpt-4o",
        )
        ai_text = completion.choices[0].message.content
    except HTTPException:
        raise
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate interview question")

    full_history = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Here is the candidate's resume:\n{final_resume_text}\n\nStart the interview."},
        {"role": "assistant", "content": ai_text}
    ]

    # 3. Save Session
    try:
        interview_table.put_item(
            Item={
                'session_id': session_id,
                'user_id': user_id,
                'history': json.dumps(full_history),
                'created_at': int(time.time()),
                'status': 'active'
            }
        )
    except Exception as e:
        print(f"DynamoDB Error: {e}")
        raise HTTPException(status_code=500, detail="Database Error")

    # 4. Generate Audio
    try:
        audio_response = polly_client.synthesize_speech(
            Text=ai_text,
            OutputFormat='mp3',
            VoiceId='Joanna',
            Engine='neural'
        )
        audio_b64 = base64.b64encode(audio_response['AudioStream'].read()).decode('utf-8')
    except Exception as e:
        print(f"Polly Error: {e}")
        audio_b64 = "" # Fail gracefully for audio

    return {
        "session_id": session_id,
        "ai_message": ai_text,
        "audio_content": audio_b64
    }

@app.post("/api/interview/chat", response_model=InterviewChatResponse)
def chat_interview(body: InterviewChatRequest):
    # 1. Fetch Session
    try:
        response = interview_table.get_item(Key={'session_id': body.session_id})
        item = response.get('Item')
        if not item:
            raise HTTPException(status_code=404, detail="Session not found")
            
        history = json.loads(item['history'])
    except Exception as e:
        print(f"DynamoDB Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Database Error")

    # 2. Append User Message
    history.append({"role": "user", "content": body.user_text})

    # 3. Generate AI Response
    try:
        if not openai_client:
             raise HTTPException(status_code=500, detail="OpenAI API Key not configured")
        
        completion = openai_client.chat.completions.create(
            messages=history,
            model="gpt-4o",
        )
        ai_text = completion.choices[0].message.content
    except HTTPException:
        raise
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail="AI Service Failed")

    # 4. Append AI Message & Save
    history.append({"role": "assistant", "content": ai_text})
    
    try:
        interview_table.update_item(
            Key={'session_id': body.session_id},
            UpdateExpression="set history = :h",
            ExpressionAttributeValues={':h': json.dumps(history)}
        )
    except Exception as e:
        print(f"DynamoDB Update Error: {e}")
        # Continue even if save fails? No, critical.
        raise HTTPException(status_code=500, detail="Database Save Error")

    # 5. Generate Audio
    try:
        audio_response = polly_client.synthesize_speech(
            Text=ai_text,
            OutputFormat='mp3',
            VoiceId='Joanna',
            Engine='neural'
        )
        audio_b64 = base64.b64encode(audio_response['AudioStream'].read()).decode('utf-8')
    except Exception as e:
        print(f"Polly Error: {e}")
        audio_b64 = ""

    return {
        "ai_message": ai_text,
        "audio_content": audio_b64,
        "status": "active"
    }

@app.post("/api/interview/end")
def end_interview_session(body: InterviewEndRequest):
    try:
        interview_table.update_item(
            Key={'session_id': body.session_id},
            UpdateExpression="set #s = :s",
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':s': 'completed'}
        )
        return {"message": "Session ended"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database Error")

@app.post("/api/interview/chat_audio")
async def chat_interview_audio(session_id: str, file: UploadFile = File(...)):
    # 1. Save Temp Audio File
    temp_filename = f"/tmp/{uuid.uuid4()}.wav"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="File Upload Error")

    # 2. Transcribe (Whisper)
    try:
        with open(temp_filename, "rb") as audio_file:
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        user_text = transcript.text
    except Exception as e:
        print(f"Whisper Error: {e}")
        raise HTTPException(status_code=500, detail="Transcription Failed")
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    # 3. Proceed with Chat Logic (Reuse chat_interview logic manually for now to save complexity)
    # Fetch Session
    try:
        response = interview_table.get_item(Key={'session_id': session_id})
        item = response.get('Item')
        if not item:
            raise HTTPException(status_code=404, detail="Session not found")
        history = json.loads(item['history'])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database Fetch Error")

    # Append User
    history.append({"role": "user", "content": user_text})

    # Generate AI
    try:
        if not openai_client:
             raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

        completion = openai_client.chat.completions.create(
            messages=history,
            model="gpt-4o",
        )
        ai_text = completion.choices[0].message.content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI Service Failed")

    # Append AI & Save
    history.append({"role": "assistant", "content": ai_text})
    try:
        interview_table.update_item(
            Key={'session_id': session_id},
            UpdateExpression="set history = :h",
            ExpressionAttributeValues={':h': json.dumps(history)}
        )
    except Exception as e:
        print(f"DynamoDB Update Error: {e}")

    # Generate Audio (Polly)
    try:
        audio_response = polly_client.synthesize_speech(
            Text=ai_text,
            OutputFormat='mp3',
            VoiceId='Joanna',
            Engine='neural'
        )
        audio_b64 = base64.b64encode(audio_response['AudioStream'].read()).decode('utf-8')
    except Exception as e:
        print(f"Polly Error: {e}")
        audio_b64 = ""

    return {
        "ai_message": ai_text,
        "audio_content": audio_b64,
        "status": "active"
    }

# Entry point for running directly
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
