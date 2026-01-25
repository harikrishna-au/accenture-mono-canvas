import requests
import sys
import time
import json

# Default to localhost, can be overridden
BASE_URL = "http://127.0.0.1:8000"
# BASE_URL = "https://kcg5nbeql3.execute-api.us-east-1.amazonaws.com/Prod"

def test_feedback_flow():
    print(f"Testing against {BASE_URL}")

    # Wait for server to be ready
    print("Waiting for server...")
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/")
            print("Server is up!")
            break
        except requests.exceptions.ConnectionError:
            time.sleep(1)
    else:
        print("❌ Server not reachable.")
        return

    # 1. Start Interview
    print("\n1. Starting Interview...")
    start_url = f"{BASE_URL}/api/interview/start"
    
    # Dummy resume text
    resume_text = """
    John Doe
    Software Engineer
    Experience: 5 years in Python, FastAPI, React.
    Projects: Built an AI Interview bot.
    """
    
    try:
        response = requests.post(start_url, data={"resume_text": resume_text, "user_id": "test_user_123"})
        if response.status_code != 200:
            print(f"❌ Start Failed: {response.status_code} - {response.text}")
            return
        
        data = response.json()
        session_id = data.get("session_id")
        print(f"✅ Interview Started. Session ID: {session_id}")
        
    except Exception as e:
        print(f"❌ Exception during Start: {e}")
        return

    # 2. End Interview (to trigger feedback)
    print("\n2. Ending Interview to get Feedback...")
    end_url = f"{BASE_URL}/api/interview/end"
    
    try:
        response = requests.post(end_url, json={"session_id": session_id})
        
        if response.status_code != 200:
            print(f"❌ End Failed: {response.status_code} - {response.text}")
            return
            
        data = response.json()
        feedback = data.get("feedback")
        
        if feedback:
            print("✅ Feedback Received!")
            print(json.dumps(feedback, indent=2))
        else:
            print("⚠️ Response received but 'feedback' key missing.")
            print(data)
            
    except Exception as e:
        print(f"❌ Exception during End: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        BASE_URL = sys.argv[1]
    test_feedback_flow()
