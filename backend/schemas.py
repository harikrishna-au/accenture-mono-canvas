from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class GameHistoryItem(BaseModel):
    question: str = Field(..., max_length=1000)
    answer: str = Field(..., max_length=10000)
    score: Optional[int] = Field(0, ge=0, le=100)
    section: Optional[str] = "General"

class GameHistoryRequest(BaseModel):
    history: List[GameHistoryItem] = Field(..., max_items=100)

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

class ResumeUploadRequest(BaseModel):
    filename: str
