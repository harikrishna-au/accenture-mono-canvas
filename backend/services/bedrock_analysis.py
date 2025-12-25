
import boto3
import json
import os
from botocore.exceptions import ClientError

def analyze_overall_performance(history: list) -> dict:
    """
    Analyzes the user's overall performance using Amazon Titan Express.
    """
    
    # Initialize Bedrock Client
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name=os.getenv('BEDROCK_REGION', os.getenv('AWS_DEFAULT_REGION', 'us-east-1'))
    )

    # Group History by Section
    sections = {}
    for item in history:
        sec = item.get('section', 'General')
        if sec not in sections:
            sections[sec] = []
        sections[sec].append(item)

    # Construct the Prompt
    transcript_text = ""
    for sec_name, items in sections.items():
        transcript_text += f"\n=== SECTION: {sec_name} ===\n"
        for idx, item in enumerate(items):
            transcript_text += f"Q: {item.get('question', 'Unknown')}\n"
            transcript_text += f"A: {item.get('answer', 'No answer')}\n"

    prompt = f"""You are an expert communication coach. Analyze the user's performance in this speaking test.

TRANSCRIPT:
{transcript_text}

INSTRUCTIONS:
1. Rate Fluency, Grammar, Vocabulary, and Pronunciation (0-100).
2. Provide specific feedback for each section.
3. Return ONLY a valid JSON object in this format:
{{
    "fluency_score": int,
    "grammar_score": int,
    "vocabulary_score": int,
    "pronunciation_score": int,
    "overall_feedback": "string",
    "strengths": ["str", "str"],
    "improvements": ["str", "str"],
    "section_feedback": [
        {{ "section": "Name", "feedback": "Specific advice" }}
    ]
}}
JSON Response:
"""

    # Titan Payload
    payload = {
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 1024,
            "stopSequences": [],
            "temperature": 0.1,
            "topP": 0.9
        }
    }

    try:
        response = bedrock.invoke_model(
            modelId="amazon.titan-text-express-v1",
            body=json.dumps(payload)
        )
        
        result_body = json.loads(response['body'].read())
        ai_response_text = result_body['results'][0]['outputText']
        
        # Parse JSON
        start = ai_response_text.find('{')
        end = ai_response_text.rfind('}') + 1
        if start != -1 and end != -1:
            return json.loads(ai_response_text[start:end])
        else:
            raise ValueError(f"AI format error: {ai_response_text[:100]}")
            
    except Exception as e:
        print(f"Titan Analysis Error: {e}")
        raise e


def grade_submission(question_text: str, user_transcript: str) -> dict:
    """
    Grades a single submission using Amazon Titan Express.
    """
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name=os.getenv('BEDROCK_REGION', os.getenv('AWS_DEFAULT_REGION', 'us-east-1'))
    )
    
    prompt = f"""You are a communication coach.
Question: {question_text}
User Answer: {user_transcript}

Evaluate the answer and return ONLY a JSON object:
{{
    "score": (0-100),
    "feedback": "string",
    "correct": boolean
}}
JSON Response:
"""

    payload = {
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 512,
            "stopSequences": [],
            "temperature": 0.1,
            "topP": 0.9
        }
    }
    
    try:
        response = bedrock.invoke_model(
            modelId="amazon.titan-text-express-v1",
            body=json.dumps(payload)
        )
        
        result = json.loads(response['body'].read())
        text = result['results'][0]['outputText']
        
        s = text.find('{')
        e = text.rfind('}') + 1
        return json.loads(text[s:e])
        
    except Exception as e:
        print(f"Titan Grading Error: {e}")
        raise e



