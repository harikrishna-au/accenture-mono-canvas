import os
from openai import OpenAI

openai_client = None

try:
    if os.environ.get("OPENAI_API_KEY"):
        openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    else:
        print("WARNING: OPENAI_API_KEY not found in environment variables.")
except Exception as e:
    print(f"OpenAI Init Error: {e}")

def generate_chat_completion(messages: list, model: str = "gpt-4o"):
    if not openai_client:
        raise Exception("OpenAI API Key not configured")
    
    completion = openai_client.chat.completions.create(
        messages=messages,
        model=model,
    )
    return completion.choices[0].message.content

def transcribe_audio(file_path: str):
    if not openai_client:
        raise Exception("OpenAI API Key not configured")
        
    with open(file_path, "rb") as audio_file:
        transcript = openai_client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file
        )
    return transcript.text

def generate_openai_audio(text: str, voice: str = "alloy") -> str:
    """
    Generates audio using OpenAI TTS-1 model and returns base64 string.
    """
    if not openai_client:
        print("OpenAI API Key not configured for TTS")
        return ""
        
    try:
        import base64
        response = openai_client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=text
        )
        # iter_bytes() yields bytes, we consume them all
        audio_content = b"".join(response.iter_bytes())
        return base64.b64encode(audio_content).decode("utf-8")
    except Exception as e:
        print(f"OpenAI TTS Error: {e}")
        return ""
