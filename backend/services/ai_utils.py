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

def generate_interview_feedback(history: list) -> dict:
    """
    Analyzes the interview history and returns a structured JSON feedback report.
    """
    if not openai_client:
        print("OpenAI API Key not configured for Feedback")
        return {}

    prompt = """
    Analyze the following interview transcript between a candidate and an HR Manager (Sarah).
    Provide a detailed evaluation in VALID JSON format.
    
    OUTPUT FORMAT:
    {
        "feedback": {
            "strengths": ["List 3-4 key strengths identified"],
            "areas_for_improvement": ["List 3-4 specific areas to improve"],
            "rating": "Provide a score out of 10 (e.g., '8/10')",
            "summary": "A concise 2-3 sentence summary of the candidate's performance."
        }
    }
    """

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"TRANSCRIPT:\n{str(history)}"}
    ]

    try:
        completion = openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o",
            response_format={ "type": "json_object" }
        )
        import json
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Feedback Generation Error: {e}")
        return {}

def generate_interview_questions(resume_text: str) -> dict:
    """
    Generates a full list of 15 interview questions based on the resume.
    Returns a dict with 'questions': [list of strings]
    """
    if not openai_client:
        raise Exception("OpenAI API Key not configured or Client Init Failed")

    prompt = """
    You are Devi, an AI Interviewer at a top tech company.
    Generate a full interview script in stric JSON format.
    
    STRUCTURE:
    - Questions 1-5: Introduction & Background (Ice breakers, tell me about yourself, follow-ups on education/bio)
    - Questions 6-12: Technical Experience & Projects (Based on resume specific projects, technologies, challenges)
    - Questions 13-15: HR & Behavioral (Teamwork, conflict, career goals)

    OUTPUT FORMAT:
    {
        "questions": [
            "Question 1 text...",
            "Question 2 text...",
            ...
            "Question 15 text..."
        ]
    }
    
    RULES:
    - The output MUST be a valid JSON object.
    - Questions must be concise (1-2 sentences).
    - Do not include question numbers in the strings.
    - Tailor technical questions to the resume content below.
    """

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"CANDIDATE RESUME:\n{resume_text[:2000]}"}
    ]

    completion = openai_client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
        response_format={ "type": "json_object" }
    )
    import json
    return json.loads(completion.choices[0].message.content)
