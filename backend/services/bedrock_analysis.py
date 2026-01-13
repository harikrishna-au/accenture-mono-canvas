import json
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load env (if local)
load_dotenv()

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=api_key)

def analyze_overall_performance(history: list) -> dict:
    """
    Analyzes user performance using OpenAI GPT-4o-mini.
    Replaces Bedrock implementation.
    """
    client = get_openai_client()

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
5. Return ONLY a valid JSON object matching the requested schema."""
    
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
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7
        )
        
        result_text = response.choices[0].message.content
        return json.loads(result_text)
            
    except Exception as e:
        print(f"OpenAI Analysis Error: {e}")
        raise e

def grade_submission(question_text: str, user_transcript: str) -> dict:
    """
    Grades a single submission using Azure OpenAI / OpenAI.
    """
    client = get_openai_client()
    
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
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1
        )
        
        result_text = response.choices[0].message.content
        return json.loads(result_text)
        
    except Exception as e:
        print(f"OpenAI Grading Error: {e}")
        # Return fallback for safety
        return {
            "score": 0,
            "feedback": f"Error during grading: {str(e)}",
            "correct": False
        }
