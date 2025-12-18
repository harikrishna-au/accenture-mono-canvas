from fuzzywuzzy import fuzz
from textblob import TextBlob
import re

class AdvancedGrader:
    
    @staticmethod
    def grade_section_a(transcript: str, correct_answer: str) -> tuple[int, str]:
        # A: Listening Comprehension. "One complete sentence. Crisp and clear."
        # Logic: Check similarity to expected answer + Sentence Structure check.
        
        # 1. Similarity check (Token Set Ratio handles partial matches well)
        similarity = fuzz.token_set_ratio(transcript.lower(), correct_answer.lower())
        
        # 2. Length check (Must be a complete sentence, approximation)
        word_count = len(transcript.split())
        if word_count < 5:
            return 40, "Answer too short. Please speak in a complete sentence."
            
        if similarity > 85:
            return 100, "Perfect. Clear and correct."
        elif similarity > 60:
            return 80, "Correct idea, but could be more precise."
        else:
            return 40, f"Incorrect. logic expected: {correct_answer[:20]}..."

    @staticmethod
    def grade_section_b(transcript: str) -> tuple[int, str]:
        # B: Conversation Response. "Polite and natural manner."
        blob = TextBlob(transcript)
        polarity = blob.sentiment.polarity # -1 to 1
        
        # Politeness keywords
        polite_words = ["could", "would", "please", "thanks", "appreciate", "sorry", "apologize", "can i"]
        has_polite = any(word in transcript.lower() for word in polite_words)
        
        score = 80 # Base score for relevance (assumed relevant for now)
        
        if polarity < -0.1:
            score -= 20
            feedback = "Tone seems negative or aggressive."
        elif has_polite:
            score += 10
            feedback = "Very polite and appropriate response."
            score = min(score, 100)
        else:
            feedback = "Response fits, but could be more polite."
            
        return score, feedback

    @staticmethod
    def grade_section_c(transcript: str, expected_text: str) -> tuple[int, str]:
        # C: Reading Aloud. "Maintain steady tempo... avoid fumbling"
        # Strict matching.
        ratio = fuzz.ratio(transcript.lower(), expected_text.lower())
        
        if ratio > 95:
            return 100, "Excellent reading. Clear and accurate."
        elif ratio > 80:
            return 85, "Good reading, minor pronunciation misses."
        else:
            return 50, "Several words were missed or mispronounced."

    @staticmethod
    def grade_section_d(transcript: str, expected_text: str) -> tuple[int, str]:
        # D: Listen and Repeat. "Repeat exactly what you heard."
        # Very Strict matching.
        ratio = fuzz.ratio(transcript.lower(), expected_text.lower())
        
        if ratio > 98:
            return 100, "Perfect recall."
        elif ratio > 90:
            return 90, "Almost perfect."
        elif ratio > 70:
            return 70, "Missed some details."
        else:
            return 40, "Significant deviation from the original sentence."

    @staticmethod
    def grade_section_e(transcript: str, expected_text: str) -> tuple[int, str]:
        # E: Fill Missing Word. "Repeat the complete sentence."
        # Logic: Must match the full expected sentence.
        ratio = fuzz.ratio(transcript.lower(), expected_text.lower())
        
        if ratio > 90:
            return 100, "Correctly filled and repeated."
        else:
            # Check if they only said the word
            expected_words = expected_text.split()
            # If transcript is very short (1-2 words)
            if len(transcript.split()) <= 2 and len(expected_words) > 5:
                 return 30, "Please repeat the COMPLETE sentence, not just the missing word."
            return 50, "Incorrect sentence construction."

    @staticmethod
    def grade_section_f(transcript: str, expected_text: str) -> tuple[int, str]:
        # F: Error Correction. "Rectify error and read total corrected sentence."
        ratio = fuzz.ratio(transcript.lower(), expected_text.lower())
        
        if ratio > 90:
            return 100, "Error corrected perfectly."
        else:
             return 50, "Failed to correct the error or repeat the full sentence correctly."

    @staticmethod
    def grade_section_g(transcript: str) -> tuple[int, str]:
        # G: Monologue. "45 seconds... Fluency, vocabulary."
        words = transcript.split()
        word_count = len(words)
        
        # 1. Fluency (Word Count roughly) - expecting ~100-150 words for 45s? 
        # Actually 45s speech is usually 90-110 words. 
        if word_count < 30:
            return 40, "Speech too short. Elaborate more."
        
        # 2. Vocabulary (Unique words)
        unique_words = set(w.lower() for w in words)
        ttr = len(unique_words) / word_count # Type-Token Ratio
        
        # 3. Fillers
        fillers = ["um", "uh", "like", "sort of", "you know"]
        filler_count = sum(transcript.lower().count(f) for f in fillers)
        
        score = 85
        feedback_parts = []
        
        if ttr > 0.6:
            score += 10
            feedback_parts.append("Good vocabulary usage.")
        
        if filler_count > 3:
            score -= 10
            feedback_parts.append(f"Detected {filler_count} filler words. Try to pause instead.")
        else:
            feedback_parts.append("Fluent speech.")

        score = min(max(score, 0), 100)
        return score, " ".join(feedback_parts)


def grade_transcript(transcript: str, question: dict) -> tuple[int, str]:
    section = question["section"]
    correct_answer = question.get("correctAnswer") or question.get("promptText") or "" # Fallback
    
    transcript = transcript.strip()
    if not transcript:
        return 0, "No speech detected."

    if section == "A":
        return AdvancedGrader.grade_section_a(transcript, correct_answer)
    elif section == "B":
        return AdvancedGrader.grade_section_b(transcript)
    elif section == "C":
        return AdvancedGrader.grade_section_c(transcript, correct_answer)
    elif section == "D":
        return AdvancedGrader.grade_section_d(transcript, correct_answer)
    elif section == "E":
        return AdvancedGrader.grade_section_e(transcript, correct_answer)
    elif section == "F":
        return AdvancedGrader.grade_section_f(transcript, correct_answer)
    elif section == "G":
        return AdvancedGrader.grade_section_g(transcript)
    else:
        # Default fallback
        return 50, "Section grading not implemented."

def grade_written_text(text: str) -> tuple[int, str]:
    # WRITTEN section
    # "Minimum 30 words"
    words = text.split()
    if len(words) < 30:
        return 40, f"Too short ({len(words)}/30 words)."
    
    # Structure check
    has_greeting = any(x in text.lower() for x in ["dear", "hi", "hello", "team"])
    has_signoff = any(x in text.lower() for x in ["regards", "sincerely", "thanks", "best"])
    
    score = 80
    feedback = "Good content."
    
    if not has_greeting:
        score -= 10
        feedback += " Missing professional greeting."
    if not has_signoff:
        score -= 5
        feedback += " Missing sign-off."
        
    if score >= 80:
        feedback = "Excellent professional email."
        
    return score, feedback
