from fastapi import APIRouter, HTTPException
try:
    from backend.schemas import TTSRequest
    from backend.services.aws_utils import generate_polly_audio
except ImportError:
    from schemas import TTSRequest
    from services.aws_utils import generate_polly_audio
import base64

router = APIRouter(tags=["misc"])

@router.get("/")
def read_root():
    return {"status": "online", "message": "Communication Backend Active with Azure AI"}

@router.post("/api/tts")
def get_tts_audio(body: TTSRequest):
    # Map friendly voice types to Amazon Polly Neural Voices
    voice_map = {"male_1": "Matthew", "male_2": "Joey", "female_1": "Joanna", "female_2": "Salli"}
    voice_id = voice_map.get(body.voice_type, "Matthew")
    
    encoded = generate_polly_audio(body.text, voice_id)
    if not encoded:
        raise HTTPException(status_code=500, detail="TTS Failed")
    
    return {"audio_content": encoded}
