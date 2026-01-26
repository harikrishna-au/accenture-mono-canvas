from fastapi import APIRouter, HTTPException, Form, UploadFile, File
try:
    from backend.schemas import (
        InterviewStartResponse, InterviewChatRequest, InterviewChatResponse, InterviewEndRequest
    )
    from backend.services.ai_utils import generate_chat_completion, transcribe_audio, openai_client, generate_openai_audio, generate_interview_feedback, generate_interview_questions
    from backend.services.aws_utils import (
        generate_polly_audio, save_session, get_session, update_session_history, mark_session_completed, interview_table
    )
except ImportError:
    from schemas import (
        InterviewStartResponse, InterviewChatRequest, InterviewChatResponse, InterviewEndRequest
    )
    from services.ai_utils import generate_chat_completion, transcribe_audio, openai_client, generate_openai_audio, generate_interview_feedback, generate_interview_questions
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
    # 0. Check Attempt Limit - REMOVED (Unlimited Access)
    # if user_id:
    #     try:
    #         print(f"Checking limit for user: {user_id}")
    #         response = interview_table.query(
    #             IndexName='UserIdIndex',
    #             KeyConditionExpression=Key('user_id').eq(user_id)
    #         )
    #         items = response.get('Items', [])
    #         completed_count = sum(1 for item in items if item.get('status') == 'completed')
    #         
    #         if completed_count >= 2:
    #             raise HTTPException(status_code=403, detail="Free limit reached. You have completed 2 interviews.")
    #     except HTTPException:
    #         raise
    #     except Exception as e:
    #         print(f"⚠️ LIMIT CHECK FAILED: {e}")
    #         pass 

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
    You are Devi, an AI Interviewer at a top tech company.
    
    CANDIDATE RESUME:
    "{final_resume_text}"

    GOAL: Conduct a structured interview based on the pre-generated question queue.
    """
    
    # 2. Pre-generate Questions
    try:
        if not openai_client:
             raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

        # Generate Full Question Queue
        q_data = generate_interview_questions(final_resume_text)
        question_queue = q_data.get("questions", [])
        
        if not question_queue:
            raise HTTPException(status_code=500, detail="Failed to generate interview questions")

        # Prepend Intro to Q1
        intro_msg = "Hello, I am Devi, your AI Interviewer taking a mock interview for you. "
        initial_ai_text = intro_msg + question_queue[0]

    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate interview questions: {str(e)}")

    # Initial History
    full_history = [
        {"role": "system", "content": system_prompt},
        {"role": "assistant", "content": initial_ai_text}
    ]

    # 3. Save Session with Queue
    try:
        save_session({
            'session_id': session_id,
            'user_id': user_id,
            'history': json.dumps(full_history),
            'question_queue': json.dumps(question_queue),
            'current_question_index': 0,
            'created_at': int(time.time()),
            'status': 'active'
        })
    except Exception as e:
        print(f"DynamoDB Error: {e}")
        raise HTTPException(status_code=500, detail="Database Error")

    # 4. Generate Audio
    audio_b64 = generate_openai_audio(initial_ai_text, voice="shimmer")

    return {
        "session_id": session_id,
        "ai_message": initial_ai_text,
        "audio_content": audio_b64
    }

@router.post("/chat", response_model=InterviewChatResponse)
def chat_interview(body: InterviewChatRequest):
    # 1. Fetch Session
    item = get_session(body.session_id)
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 2. Update History with User Answer
    history = json.loads(item.get('history', '[]'))
    history.append({"role": "user", "content": body.user_text})

    # 3. Get Next Question from Queue
    question_queue = json.loads(item.get('question_queue', '[]'))
    current_index = int(item.get('current_question_index', 0))
    
    next_index = current_index + 1
    
    if next_index < len(question_queue):
        # Next Question Exists
        ai_text = question_queue[next_index]
        history.append({"role": "assistant", "content": ai_text})
        
        # Save Updates (History + Index)
        # We need to update index in DB. aws_utils update_session_history currently only updates history.
        # We should update generic item or expand that function. For now, let's use a generic update or modify the util.
        # Ideally, we should modify aws_utils.py to support generic updates, but to be safe/fast:
        # We will use the table resource directly here or assume an expanded utility.
        # Let's check aws_utils again. It has specific update functions.
        # I'll use a direct update here via boto3 logic if needed, OR better:
        # I'll update `update_session_history` in the NEXT tool call to be more flexible, 
        # BUT for this specific tool call, I will assume the function `update_session_progress` (which I will create/modify next).
        # Wait, I can just modify `aws_utils` first. 
        # Actually, let's write the logic here assuming I can call `update_session_state` which updates history AND index.
        
        # Let's revert to simplicity: just use table.update_item directly here since I have the table reference from imports?
        # No, `interview_table` is imported from aws_utils.
        # I will update `aws_utils.py` to add `update_session_progress` in a separate step? 
        # No, I should have done that. Let me do this:
        # I will write the code here to use `update_session_progress`, and then I will immediately add that function to `aws_utils.py`.
        
        try:
            from backend.services.aws_utils import update_session_progress
        except ImportError:
            from services.aws_utils import update_session_progress
            
        update_session_progress(body.session_id, history, next_index)

        status = "active"
        audio_b64 = generate_openai_audio(ai_text, voice="shimmer")
        
        return {
            "ai_message": ai_text,
            "audio_content": audio_b64,
            "status": status
        }
    else:
        # End of Interview
        feedback = generate_interview_feedback(history, next_index, len(question_queue))
        mark_session_completed(body.session_id, feedback)
        
        return {
            "ai_message": "Thank you for your time. The interview is now complete.",
            "audio_content": "", 
            "status": "completed",
            "feedback": feedback
        }

@router.post("/end")
def end_interview_session(body: InterviewEndRequest):
    try:
        # 1. Fetch Session for History
        item = get_session(body.session_id)
        if not item:
            # If session not found, we can't do much, but let's return a safe error
            return JSONResponse(status_code=404, content={"message": "Session not found"})
        
        history = json.loads(item.get('history', '[]'))
        question_queue = json.loads(item.get('question_queue', '[]'))
        current_index = int(item.get('current_question_index', 0))

        # 2. Generate Feedback (Safely)
        feedback = {}
        try:
            # Pass indices to penalize if incomplete
            feedback = generate_interview_feedback(history, current_index, len(question_queue))
        except Exception as e:
            print(f"Feedback Generation Failed: {e}")
            feedback = {
                "feedback": {
                    "strengths": ["Feedback generation unavailable"],
                    "areas_for_improvement": ["Please contact support if this persists"],
                    "rating": "N/A",
                    "summary": "We encountered an issue generating your detailed feedback, but your interview has been recorded.",
                    "detailed_analysis": []
                }
            }
        
        # 3. Save & Mark Completed (Safely)
        try:
            mark_session_completed(body.session_id, feedback)
        except Exception as e:
             print(f"DB Update Failed: {e}")
             # If we can't mark it, we still return success to the user so they can exit
        
        return {
            "message": "Session ended",
            "feedback": feedback
        }
    except Exception as e:
        print(f"End Session Critical Error: {e}")
        # Return a valid 200 OK with fallback so the UI exits cleanly
        return {
             "message": "Session ended with errors",
             "feedback": {
                "feedback": {
                    "summary": "Interview completed. Detailed feedback could not be generated at this time."
                }
             }
        }

@router.post("/chat_audio")
async def chat_interview_audio(session_id: str, file: UploadFile = File(...)):
    # 1. Save & Transcribe
    # 1. Save & Transcribe
    # Preserve extension (e.g., .webm, .mp4, .m4a) because OpenAI needs it or ffmpeg needs it
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".wav"
        
    temp_filename = f"/tmp/{uuid.uuid4()}{ext}"
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
    
    audio_b64 = generate_openai_audio(ai_text, voice="shimmer")

    return {
        "ai_message": ai_text,
        "audio_content": audio_b64,
        "status": "active"
    }
