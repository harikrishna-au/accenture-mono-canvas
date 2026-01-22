from fastapi import APIRouter, HTTPException, Request
try:
    from backend.schemas import ResumeUploadRequest
    from backend.services.aws_utils import generate_presigned_post
except ImportError:
    from schemas import ResumeUploadRequest
    from services.aws_utils import generate_presigned_post

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/upload-url")
def get_resume_upload_url_endpoint(request: Request, body: ResumeUploadRequest):
    try:
        response = generate_presigned_post(body.filename)
        return response
    except Exception as e:
        print(f"Resume Upload Error: {e}")
        # Return generic error to client, log specific
        if "RESUME_BUCKET_NAME not set" in str(e):
             return {"error": "Resume storage not configured"}
        raise HTTPException(status_code=500, detail="Server Error")
