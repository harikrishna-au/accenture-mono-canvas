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

def generate_interview_feedback(history: list, current_question_index: int = 0, total_questions: int = 1, interview_type: str = "hr") -> dict:
    """
    Analyzes the interview history and returns a structured JSON feedback report.
    Takes indices to penalize incomplete interviews.
    """
    if not openai_client:
        print("OpenAI API Key not configured for Feedback")
        return {}

    infy_criteria = """
    EVALUATION CRITERIA (HackWithInfy Round 3):
    Score each of these dimensions and factor them into the overall rating:
    - DSA Conceptual Clarity: Can they explain data structures / algorithms clearly?
    - CS Fundamentals Depth: OOPs, OS, DBMS, CN — accuracy and depth of answers.
    - Project Understanding: Do they own their resume projects or just list them?
    - Communication & Confidence: Clear, structured answers; no excessive filler words.
    - Infosys Fit: Awareness of Infosys, genuine motivation, relocation readiness.
    """ if interview_type == "hackwithinfy" else ""

    prompt = f"""
    Analyze the following interview transcript between a candidate and an AI Interviewer.
    Provide a detailed evaluation in VALID JSON format.
    {infy_criteria}
    COMPLETENESS CONTEXT:
    - The interview was designed for {total_questions} questions.
    - The candidate reached question {current_question_index + 1} of {total_questions}.

    CRITICAL SCORING RULES:
    1. If the candidate COMPLETED all {total_questions} questions, score them normally based on answer quality.
    2. If the candidate ENDED EARLY, YOU MUST PENALIZE the 'rating'.
    3. PENALTY: For every missing question, reduce the potential rating proportionally
       (e.g., 2/15 answered → max rating 2/10 regardless of quality).
    4. Include coaching in 'summary' and 'areas_for_improvement' about completing the full interview.

    OUTPUT FORMAT:
    {{
        "feedback": {{
            "strengths": ["List 3-4 key strengths identified"],
            "areas_for_improvement": ["List 3-4 specific, actionable areas to improve"],
            "rating": "Score out of 10 (penalized if incomplete)",
            "summary": "Concise 2-3 sentence summary of overall performance.",
            "detailed_analysis": [
                {{
                    "topic": "Brief topic name",
                    "analysis": "Specific critique of the candidate's answer.",
                    "better_answer_example": "A stronger phrasing or key points they missed."
                }}
            ]
        }}
    }}
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

def generate_hackwithinfy_questions(resume_text: str) -> dict:
    """
    Generates 15 interview questions tailored to the Infosys HackWithInfy
    Round 3 interview format — covers DSA concepts, core CS subjects,
    resume projects, and Infosys-specific HR questions.
    """
    if not openai_client:
        raise Exception("OpenAI API Key not configured or Client Init Failed")

    prompt = """
    You are Priya, an Infosys technical interviewer conducting the Round 3 (Interview Round)
    of HackWithInfy — India's biggest campus coding competition.

    The HackWithInfy interview tests:
    - DSA conceptual understanding (not just coding — explain logic, time/space complexity, real-world use)
    - Core CS subjects: OOPs, OS, DBMS, Computer Networks (for CS/IT candidates)
    - Resume-based technical deep-dives (projects, tech stack, challenges faced)
    - Infosys-specific HR questions (why Infosys, relocation, role fit, career goals)

    Generate exactly 15 interview questions following this structure:

    Q1  : "Please introduce yourself and tell me about your background."
    Q2  : Academic background + why they chose their stream / branch
    Q3-4: Deep-dive into their strongest resume project (what did you build, tech choices, challenges)
    Q5-6: DSA conceptual (e.g., explain a data structure, time complexity, when to use which algorithm —
           pick topics relevant to their resume; default to arrays, trees, sorting if none found)
    Q7  : OOPs concept question (inheritance vs composition, polymorphism, SOLID principle, etc.)
    Q8  : OS question (process vs thread, scheduling, deadlock, memory management)
    Q9  : DBMS question (normalization, indexing, ACID, SQL query logic)
    Q10 : CN question (TCP vs UDP, OSI layers, HTTP vs HTTPS, DNS)
    Q11 : Second resume project or technology they listed (framework, language, tool)
    Q12 : Problem-solving / scenario question based on their domain
    Q13 : "Why do you want to join Infosys specifically?"
    Q14 : Behavioral (teamwork challenge, conflict resolution, or leadership example)
    Q15 : "Where do you see yourself in 3 years, and how does this role fit your plan?"

    RULES:
    - Q1 must be exactly: "Please introduce yourself and tell me about your background."
    - All other questions must be concise (1-2 sentences max).
    - For CS questions (Q7-Q10), ask a specific concept, not just "tell me about OS".
      E.g., "Can you explain what a deadlock is and how an OS can prevent it?"
    - Do NOT include question numbers in the strings.
    - Tailor Q3-4, Q5-6, Q11-12 to the actual resume content provided.
    - If the resume is from a non-CS stream, replace Q7-Q10 with domain-relevant fundamentals.

    OUTPUT FORMAT:
    {
        "questions": [
            "Question 1 text...",
            ...
            "Question 15 text..."
        ]
    }
    """

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"Generate questions in strict JSON. CANDIDATE RESUME:\n{resume_text[:3000]}"}
    ]

    completion = openai_client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
        response_format={"type": "json_object"}
    )
    import json
    return json.loads(completion.choices[0].message.content)


def generate_interview_questions(resume_text: str) -> dict:
    """
    Generates a full list of 15 interview questions based on the resume.
    Returns a dict with 'questions': [list of strings]
    """
    if not openai_client:
        raise Exception("OpenAI API Key not configured or Client Init Failed")

    prompt = """
    You are Devi, an AI Interviewer at a top tech company.
    Generate a full interview script in strict JSON format.
    
    STRUCTURE:
    - Question 1: MUST be exactly "Please introduce yourself and tell me about your background."
    - Questions 2-5: Follow-ups on education/bio and background
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
        {"role": "user", "content": f"Respond in strict JSON format. CANDIDATE RESUME:\n{resume_text[:2000]}"}
    ]

    completion = openai_client.chat.completions.create(
        messages=messages,
        model="gpt-4o",
        response_format={ "type": "json_object" }
    )
    import json
    return json.loads(completion.choices[0].message.content)
