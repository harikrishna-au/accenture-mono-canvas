from fastapi import APIRouter, HTTPException, Form, UploadFile, File
try:
    from backend.schemas import (
        InterviewStartResponse, InterviewChatRequest, InterviewChatResponse, InterviewEndRequest
    )
    from backend.services.ai_utils import generate_chat_completion, transcribe_audio, openai_client
    from backend.services.aws_utils import (
        generate_polly_audio, save_session, get_session, update_session_history, mark_session_completed, interview_table
    )
except ImportError:
    from schemas import (
        InterviewStartResponse, InterviewChatRequest, InterviewChatResponse, InterviewEndRequest
    )
    from services.ai_utils import generate_chat_completion, transcribe_audio, openai_client
    from services.aws_utils import (
        generate_polly_audio, save_session, get_session, update_session_history, mark_session_completed, interview_table
    )
from pypdf import PdfReader
import uuid
import time
import json
import shutil
import os
from boto3.dynamodb.conditions import Key

router = APIRouter(prefix="/api/interview", tags=["interview"])

@router.post("/start", response_model=InterviewStartResponse)
def start_interview(
    resume_text: str = Form(None), 
    user_id: str = Form(None),
    resume_file: UploadFile = File(None)
):
    # 0. Check Attempt Limit
    if user_id:
        try:
            print(f"Checking limit for user: {user_id}")
            response = interview_table.query(
                IndexName='UserIdIndex',
                KeyConditionExpression=Key('user_id').eq(user_id)
            )
            items = response.get('Items', [])
            completed_count = sum(1 for item in items if item.get('status') == 'completed')
            
            if completed_count >= 2:
                raise HTTPException(status_code=403, detail="Free limit reached. You have completed 2 interviews.")
        except HTTPException:
            raise
        except Exception as e:
            print(f"⚠️ LIMIT CHECK FAILED: {e}")
            pass 

    # 1. Process Resume
    final_resume_text = ""
    if resume_file:
        try:
            reader = PdfReader(resume_file.file)
            for page in reader.pages:
                final_resume_text += page.extract_text() + "\n"
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to read PDF file")
    elif resume_text:
        final_resume_text = resume_text
    
    if not final_resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume content is required")

    session_id = str(uuid.uuid4())
    
    system_prompt = f"""
    You are Sarah, a Senior HR Manager at a top tech company. You are conducting a strict 15-minute behavioral interview.
    
    CANDIDATE RESUME:
    "{final_resume_text}"

    GOAL: Assess culture fit, communication, and project experience. Do NOT ask deep technical coding questions.

    STRUCTURE:
    1.  **Introduction Phase (0-4 minutes)**:
        *   Start by asking the candidate to introduce themselves.
        *   **CRITICAL**: Keep asking follow-up engagement questions until approx 4 minutes have passed.
        *   Do NOT move to main questions until rapport is established (~4 mins).

    2.  **Main Interview Questions (4-12 minutes)**:
        *   Ask exactly 5 distinct questions based on their resume (Teamwork, Challenges, Impact, Behavior, Why this role?).

    3.  **Closing (12-15 minutes)**:
        *   Wrap up and ask if they have questions.

    RULES:
    - Keep responses concise (under 3 sentences).
    - Be professional but encouraging.
    """
    
    # 2. Get Initial Question
    try:
        if not openai_client:
             raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

        initial_user_msg = f"Here is the candidate's resume:\n{final_resume_text[:2000]}...\n\nStart the interview."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": initial_user_msg}
        ]
        
        ai_text = generate_chat_completion(messages)
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate interview question: {str(e)}")

    full_history = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": initial_user_msg},
        {"role": "assistant", "content": ai_text}
    ]

    # 3. Save Session
    try:
        save_session({
            'session_id': session_id,
            'user_id': user_id,
            'history': json.dumps(full_history),
            'created_at': int(time.time()),
            'status': 'active'
        })
    except Exception as e:
        print(f"DynamoDB Error: {e}")
        raise HTTPException(status_code=500, detail="Database Error")

    # 4. Generate Audio
    audio_b64 = generate_polly_audio(ai_text)

    return {
        "session_id": session_id,
        "ai_message": ai_text,
        "audio_content": audio_b64
    }

@router.post("/chat", response_model=InterviewChatResponse)
def chat_interview(body: InterviewChatRequest):
    # 1. Fetch Session
    item = get_session(body.session_id)
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    
    history = json.loads(item['history'])
    history.append({"role": "user", "content": body.user_text})

    # 2. Generate AI
    try:
        ai_text = generate_chat_completion(history)
    except Exception:
        raise HTTPException(status_code=500, detail="AI Service Failed")

    history.append({"role": "assistant", "content": ai_text})
    
    # 3. Save & Audio
    update_session_history(body.session_id, history)
    audio_b64 = generate_polly_audio(ai_text)

    return {
        "ai_message": ai_text,
        "audio_content": audio_b64,
        "status": "active"
    }

@router.post("/end")
def end_interview_session(body: InterviewEndRequest):
    try:
        mark_session_completed(body.session_id)
        return {"message": "Session ended"}
    except Exception:
        raise HTTPException(status_code=500, detail="Database Error")

@router.post("/chat_audio")
async def chat_interview_audio(session_id: str, file: UploadFile = File(...)):
    # 1. Save & Transcribe
    temp_filename = f"/tmp/{uuid.uuid4()}.wav"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        user_text = transcribe_audio(temp_filename)
    except Exception as e:
        print(f"Transcription Error: {e}")
        # Return specific error to help debugging
        raise HTTPException(status_code=500, detail=f"Transcription Failed: {str(e)}")
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    # 2. Chat Logic (Inline reuse)
    item = get_session(session_id)
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    
    history = json.loads(item['history'])
    history.append({"role": "user", "content": user_text})

    try:
        ai_text = generate_chat_completion(history)
    except Exception:
        raise HTTPException(status_code=500, detail="AI Service Failed")

    history.append({"role": "assistant", "content": ai_text})
    update_session_history(session_id, history)
    
    audio_b64 = generate_polly_audio(ai_text)

    return {
        "ai_message": ai_text,
        "audio_content": audio_b64,
        "status": "active"
    }
