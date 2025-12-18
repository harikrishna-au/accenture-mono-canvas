from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from data import MOCK_QUESTIONS, QuestionBase
from grading import grade_transcript, grade_written_text

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioSubmission(BaseModel):
    questionId: str
    transcript: str

class WrittenSubmission(BaseModel):
    questionId: str
    text: str

class FeedbackResponse(BaseModel):
    score: int
    feedback: str

@app.get("/")
def read_root():
    return {"status": "Communication Backend is running"}

@app.get("/questions/{section_id}", response_model=QuestionBase)
def get_question(section_id: str):
    # Find list of questions for this section
    matches = [q for q in MOCK_QUESTIONS if q["section"] == section_id]
    if not matches:
        # If no question found (or section invalid), just return a 404 or empty
        # For simplicity in this demo, if it's an invalid section, we error.
        raise HTTPException(status_code=404, detail="Section not found or no questions")
    
    # Return the first one for now (backend logic could be random)
    return matches[0]

@app.post("/submit/audio", response_model=FeedbackResponse)
def submit_audio(submission: AudioSubmission):
    question = next((q for q in MOCK_QUESTIONS if q["id"] == submission.questionId), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Pass the full question dict to the grader so it knows the Section and Correct Answer
    score, feedback = grade_transcript(submission.transcript, question)
    return {"score": score, "feedback": feedback}

@app.post("/submit/written", response_model=FeedbackResponse)
def submit_written(submission: WrittenSubmission):
    question = next((q for q in MOCK_QUESTIONS if q["id"] == submission.questionId), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    score, feedback = grade_written_text(submission.text)
    return {"score": score, "feedback": feedback}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
