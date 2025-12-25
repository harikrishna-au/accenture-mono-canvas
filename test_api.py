
import requests
import json
import time

API_URL = "https://kcg5nbeql3.execute-api.us-east-1.amazonaws.com/Prod"

def test_endpoint(name, method, path, payload=None):
    url = f"{API_URL}{path}"
    print(f"\nTesting {name} [{method} {path}]...")
    
    try:
        start = time.time()
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=payload)
        
        duration = time.time() - start
        
        if response.status_code in [200, 201]:
            print(f"✅ Success ({response.status_code}) - {duration:.2f}s")
            try:
                data = response.json()
                # Print snippet
                print(f"Response: {str(data)[:200]}...")
                return True
            except:
                print(f"Response (text): {response.text[:200]}")
                return True
        else:
            print(f"❌ Failed ({response.status_code})")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def run_tests():
    # 1. Health Check
    test_endpoint("Health Check", "GET", "/")
    
    # 2. Get Random Sentence (Round 1)
    test_endpoint("Get Sentence", "GET", "/api/round1/sentence")
    
    # 3. Get Questions (DynamoDB check)
    # Using 'Project Updates' which maps to 's1' in seed data
    test_endpoint("Get Questions", "GET", "/api/questions?section=Project%20Updates")
    
    # 4. Submit Audio (Bedrock check)
    # Using 's1' q1_1 ID from seed data
    audio_payload = {
        "questionId": "q1_1",
        "transcript": "The primary cause was unexpected server downtime."
    }
    test_endpoint("Submit Audio (Bedrock)", "POST", "/submit/audio", audio_payload)
    
    # 5. Submit Written (Bedrock check)
    written_payload = {
        "questionId": "q1_1",
        "text": "The implementation was delayed due to server issues."
    }
    test_endpoint("Submit Written (Bedrock)", "POST", "/submit/written", written_payload)

    # 6. Analyze Game (Summary Scoring) - Full Session
    # 6. Analyze Game (Summary Scoring) - Full Session
    print("\nLoading exam data from full_test_payload.json...")
    with open('full_test_payload.json', 'r') as f:
        history_payload = json.load(f)
        
    print(f"Sending {len(history_payload['history'])} Q&A pairs for analysis...")
    test_endpoint("Analyze Game (Summary)", "POST", "/api/analyze-game", history_payload)

if __name__ == "__main__":
    run_tests()
