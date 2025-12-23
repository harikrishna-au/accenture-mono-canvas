import boto3
import os
from dotenv import load_dotenv
from pathlib import Path

# Load env variables
script_dir = Path(__file__).resolve().parent
env_path = script_dir / '.env'
load_dotenv(dotenv_path=env_path, override=True)

ak = os.getenv('AWS_ACCESS_KEY_ID')
sk = os.getenv('AWS_SECRET_ACCESS_KEY')
region = os.getenv('AWS_DEFAULT_REGION', 'ap-south-1')

print(f"DEBUG: Checking Bedrock in Region: {region}")

try:
    bedrock = boto3.client(
        'bedrock',
        region_name=region,
        aws_access_key_id=ak,
        aws_secret_access_key=sk
    )
    
    print("\nAttempting to list foundational models...")
    response = bedrock.list_foundation_models()
    models = response.get('modelSummaries', [])
    
    print(f"Found {len(models)} models available in {region}.")
    
    # Filter for text models (Titan, Claude, etc.)
    text_models = [m['modelId'] for m in models if 'TEXT' in m.get('outputModalities', []) or 'TEXT' in str(m)]
    
    print("\nText Models:")
    for m in text_models:
        print(f" - {m}")
            
except Exception as e:
    print(f"\nERROR: {e}")
    print("Does your user require 'AmazonBedrockFullAccess'?")
