
import boto3
import json
import os
from botocore.exceptions import ClientError

def analyze_overall_performance(history: list) -> dict:
    """
    Analyzes the user's overall performance across the entire game sessions 
    using AWS Bedrock (Claude 3.5 Sonnet).
    
    Args:
        history (list): List of dicts containing {question, answer, score}.
        
    Returns:
        dict: Detailed feedback and scores.
    """
    
    # Initialize Bedrock Client
    try:
        boto_config = {
            'service_name': 'bedrock-runtime',
            'region_name': os.getenv('AWS_DEFAULT_REGION', 'ap-south-1')
        }
        
        # Only explicitly pass keys if they are present in env (Local Dev)
        # On Lambda, we skip this to let boto3 use the attached IAM Role
        if os.getenv('AWS_ACCESS_KEY_ID'):
            boto_config['aws_access_key_id'] = os.getenv('AWS_ACCESS_KEY_ID')
            boto_config['aws_secret_access_key'] = os.getenv('AWS_SECRET_ACCESS_KEY')
            if os.getenv('AWS_SESSION_TOKEN'):
                boto_config['aws_session_token'] = os.getenv('AWS_SESSION_TOKEN')

        bedrock = boto3.client(**boto_config)
    except Exception as e:
        print(f"Bedrock Init Error: {e}")
        return _mock_feedback_error("Could not initialize AI service.")

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

    # Amazon Nova Schema
    system_list = [{"text": system_prompt}]
    
    user_message = {
        "role": "user",
        "content": [{"text": f"Here is the test transcript:\n{transcript_text}"}]
    }

    payload = {
        "system": system_list,
        "messages": [user_message],
        "inferenceConfig": {
            "max_new_tokens": 1000,
            "temperature": 0.1
        }
    }

    try:
        response = bedrock.invoke_model(
            modelId="amazon.nova-lite-v1:0",
            body=json.dumps(payload)
        )
        
        result_body = json.loads(response['body'].read())
        # Nova Response: output.message.content[0].text
        ai_response_text = result_body['output']['message']['content'][0]['text']
        
        # Parse JSON from response
        start = ai_response_text.find('{')
        end = ai_response_text.rfind('}') + 1
        if start != -1 and end != -1:
            json_str = ai_response_text[start:end]
            return json.loads(json_str)
        else:
             return _mock_feedback_error("AI response format error.")

    except ClientError as e:
        print(f"Bedrock Invocation Error: {e}")
        return _mock_feedback_error(f"AI Service Error: {str(e)}")
    except Exception as e:
        print(f"General Error: {e}")
        return _mock_feedback_error("Unknown system error.")


def grade_submission(question_text: str, user_transcript: str) -> dict:
    """
    Grades a single submission using reusable Bedrock logic.
    """
    system_prompt = """You are a communication coach. Grade the user's answer.
    Return JSON:
    {
        "score": (0-100),
        "feedback": "string",
        "correct": boolean
    }
    """
    user_content = f"Question: {question_text}\nAnswer: {user_transcript}"
    
    # Reuse the same invocation logic...
    # (Simplified for brevity, ensuring robustness)
    try:
        boto_config = {
            'service_name': 'bedrock-runtime',
            'region_name': os.getenv('AWS_DEFAULT_REGION', 'ap-south-1')
        }
        
        if os.getenv('AWS_ACCESS_KEY_ID'):
            boto_config['aws_access_key_id'] = os.getenv('AWS_ACCESS_KEY_ID')
            boto_config['aws_secret_access_key'] = os.getenv('AWS_SECRET_ACCESS_KEY')
            if os.getenv('AWS_SESSION_TOKEN'):
                boto_config['aws_session_token'] = os.getenv('AWS_SESSION_TOKEN')

        bedrock = boto3.client(**boto_config)
        
        # Amazon Nova Payload
        payload = {
            "system": [{"text": system_prompt}],
            "messages": [{"role": "user", "content": [{"text": user_content}]}],
            "inferenceConfig": {
                "max_new_tokens": 500,
                "temperature": 0.1
            }
        }
        
        response = bedrock.invoke_model(
            modelId="amazon.nova-lite-v1:0",
            body=json.dumps(payload)
        )
        
        result = json.loads(response['body'].read())
        # Nova Response: output.message.content[0].text
        text = result['output']['message']['content'][0]['text']
        
        # Extract JSON
        s = text.find('{')
        e = text.rfind('}') + 1
        return json.loads(text[s:e])
        
    except Exception as e:
        print(f"Grading Error: {e}")
        return {"score": 0, "feedback": "AI Grading Error", "correct": False}

def _mock_feedback_error(msg):
    return {
        "fluency_score": 0,
        "grammar_score": 0,
        "vocabulary_score": 0,
        "pronunciation_score": 0,
        "overall_feedback": msg,
        "strengths": ["N/A"],
        "improvements": ["Contact Administrator"]
    }

