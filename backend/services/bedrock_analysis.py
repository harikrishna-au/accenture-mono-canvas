
import boto3
import json
import os
from botocore.exceptions import ClientError

def analyze_overall_performance(history: list) -> dict:
    """
    Analyzes the user's overall performance using Claude 3 Haiku.
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

    system_prompt = """You are an encouraging, expert Native English Communication Coach. Your goal is to motivate the learner while providing specific, actionable feedback to help them improve.

INSTRUCTIONS:
1. Analyze the user's responses for Fluency, Grammar, Vocabulary, and Pronunciation.
2. Be HIGHLY MOTIVATIONAL in your "overall_feedback". Acknowledge their effort, tell them they are doing great, but also gently point out areas to focus on. Explicitly encourage them to "take time to practice more" and "analyze their answers".
3. For "section_feedback", do NOT use generic names like "Body" or "Conclusion" unless they match the transcript sections. Use the actual section names provided (e.g., "Section A", "Listening").
4. Provide concrete examples of how to improve in the "feedback" fields.
5. Return ONLY a valid JSON object."""

    user_message = f"""
TRANSCRIPT OF USER ANSWERS:
{transcript_text}

Provide the analysis in this JSON format:
{{
    "fluency_score": int (0-100),
    "grammar_score": int (0-100),
    "vocabulary_score": int (0-100),
    "pronunciation_score": int (0-100),
    "overall_feedback": "A detailed, encouraging paragraph (approx 3-4 sentences). Start with praise, then constructive advice, and end with a motivating call to action to practice.",
    "strengths": ["specific strength 1", "specific strength 2"],
    "improvements": ["specific actionable improvement 1", "specific actionable improvement 2"],
    "section_feedback": [
        {{ "section": "Section Name", "feedback": "Specific, encouraging advice for this section." }}
    ]
}}
"""

    # Claude 3 Haiku Payload
    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": user_message
            }
        ],
        "temperature": 0.7,
        "top_p": 0.9
    }

    try:
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            body=json.dumps(payload)
        )
        
        result_body = json.loads(response['body'].read())
        ai_response_text = result_body['content'][0]['text']
        
        # Parse JSON
        start = ai_response_text.find('{')
        end = ai_response_text.rfind('}') + 1
        if start != -1 and end != -1:
            return json.loads(ai_response_text[start:end])
        else:
            raise ValueError(f"AI format error: {ai_response_text[:100]}")
            
    except Exception as e:
        print(f"Claude Analysis Error: {e}")
        raise e


def grade_submission(question_text: str, user_transcript: str) -> dict:
    """
    Grades a single submission using Claude 3 Haiku.
    """
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name=os.getenv('BEDROCK_REGION', os.getenv('AWS_DEFAULT_REGION', 'us-east-1'))
    )
    
    system_prompt = "You are a communication coach. Evaluate the answer and return ONLY a valid JSON object."
    
    user_message = f"""
Question: {question_text}
User Answer: {user_transcript}

Evaluate the answer and return ONLY a JSON object:
{{
    "score": (0-100),
    "feedback": "string",
    "correct": boolean
}}
"""

    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": user_message
            }
        ],
        "temperature": 0.1,
        "top_p": 0.9
    }
    
    try:
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            body=json.dumps(payload)
        )
        
        result = json.loads(response['body'].read())
        text = result['content'][0]['text']
        
        s = text.find('{')
        e = text.rfind('}') + 1
        return json.loads(text[s:e])
        
    except Exception as e:
        print(f"Claude Grading Error: {e}")
        raise e




