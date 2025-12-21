
import os
import azure.cognitiveservices.speech as speechsdk
from typing import Optional

def get_speech_config():
    speech_key = os.getenv('AZURE_SPEECH_KEY')
    service_region = os.getenv('AZURE_SPEECH_REGION')
    
    if not speech_key or not service_region:
        print("Azure Speech credentials not found.")
        return None
        
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    # Set output format to MP3
    speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3)
    return speech_config

def generate_speech(text: str, voice_name: str = "en-US-GuyNeural") -> Optional[bytes]:
    """
    Generates speech audio from text using Azure TTS.
    Returns: Audio data as bytes (MP3) or None if failed.
    """
    speech_config = get_speech_config()
    if not speech_config:
        return None

    speech_config.speech_synthesis_voice_name = voice_name
    
    # Null output config means we handle the result in memory (not playing to speakers directly)
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
    
    result = synthesizer.speak_text_async(text).get()
    
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print(f"Speech synthesis canceled: {cancellation_details.reason}")
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print(f"Error details: {cancellation_details.error_details}")
    
    return None
