
import os
from openai import AzureOpenAI
import json

def get_openai_client():
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    
    if not api_key or not endpoint:
        print("Azure OpenAI credentials not found.")
        return None
        
    return AzureOpenAI(
        api_key=api_key,
        api_version="2024-02-15-preview",
        azure_endpoint=endpoint
    )

def grade_submission(question_text: str, correct_answer: str, user_transcript: str) -> dict:
    """
    Grades the user's answer using Azure OpenAI.
    """
    client = get_openai_client()
    if not client:
        # Fallback if no keys
        return {"score": 0, "feedback": "Azure OpenAI not configured."}
        
    deployment_name = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-4o') 

    prompt = f"""
    You are an expert communication coach. Grade the user's answer based on the correct answer.
    
    Question: {question_text}
    Correct Answer/Key Concept: {correct_answer}
    User's Answer (Transcript): {user_transcript}
    
    Evaluate strict correctness of meaning, but allow for paraphrasing.
    Return JSON only:
    {{
        "score": (integer 0-100),
        "feedback": (string, 1-2 sentences coaching the user),
        "correct": (boolean)
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"OpenAI Grading Error: {e}")
        return {"score": 0, "feedback": "Error during AI grading."}
