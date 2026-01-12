import os
import requests
from typing import Optional

def generate_speech(text: str, voice_name: str = "en-US-GuyNeural") -> Optional[bytes]:
    """
    Generates speech audio from text using Azure TTS REST API.
    Returns: Audio data as bytes (MP3) or None if failed.
    """
    speech_key = os.getenv('AZURE_SPEECH_KEY')
    service_region = os.getenv('AZURE_SPEECH_REGION')
    
    if not speech_key or not service_region:
        print("Azure Speech credentials not found.")
        return None

    # Azure TTS REST API Endpoint
    url = f"https://{service_region}.tts.speech.microsoft.com/cognitiveservices/v1"

    headers = {
        "Ocp-Apim-Subscription-Key": speech_key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
        "User-Agent": "AccentureMonoCanvas"
    }

    # Construct SSML payload
    ssml = f"""
    <speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' xml:gender='Male' name='{voice_name}'>
            {text}
        </voice>
    </speak>
    """

    try:
        response = requests.post(url, headers=headers, data=ssml)
        if response.status_code == 200:
            return response.content
        else:
            print(f"Azure TTS Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Azure TTS Request Failed: {e}")
        return None
