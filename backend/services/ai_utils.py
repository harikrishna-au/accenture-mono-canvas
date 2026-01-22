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
