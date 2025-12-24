
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

    system_prompt = """You are an expert communication coach. 
    Analyze the user's performance in a multi-section speaking test.
    
    1. Overall Scores (0-100): Fluency, Grammar, Vocabulary, Pronunciation.
    2. Section-wise Feedback: Specific advice for each section found in the transcript.
    
    Return ONLY valid JSON:
    {
        "fluency_score": int,
        "grammar_score": int,
        "vocabulary_score": int,
        "pronunciation_score": int,
        "overall_feedback": "string",
        "strengths": ["str"],
        "improvements": ["str"],
        "section_feedback": [
            { "section": "Name of Section", "feedback": "Specific feedback for this section." }
        ]
    }
    """

    # Meta Llama 3 Schema
    # Llama 3 uses a specific prompt format:
    # <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n
    
    user_content = f"Here is the test transcript:\n{transcript_text}"
    
    final_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    payload = {
        "prompt": final_prompt,
        "max_gen_len": 1000,
        "temperature": 0.1,
        "top_p": 0.9
    }

    try:
        response = bedrock.invoke_model(
            modelId="meta.llama3-8b-instruct-v1:0",
            body=json.dumps(payload)
        )
        
        result_body = json.loads(response['body'].read())
        # Llama Response: 'generation'
        ai_response_text = result_body['generation']
        
        # Parse JSON from response
        start = ai_response_text.find('{')
        end = ai_response_text.rfind('}') + 1
        if start != -1 and end != -1:
            json_str = ai_response_text[start:end]
            return json.loads(json_str)
        else:
             print(f"Llama Raw Output: {ai_response_text}")
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
        
        # Meta Llama 3 Payload
        final_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_content}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

        payload = {
            "prompt": final_prompt,
            "max_gen_len": 500,
            "temperature": 0.1,
            "top_p": 0.9
        }
        
        response = bedrock.invoke_model(
            modelId="meta.llama3-8b-instruct-v1:0",
            body=json.dumps(payload)
        )
        
        result = json.loads(response['body'].read())
        # Llama Response: 'generation'
        text = result['generation']
        
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

