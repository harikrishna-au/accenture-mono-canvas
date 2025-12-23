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

print(f"DEBUG: Using Region: {region}")
print(f"DEBUG: Access Key: {ak[:4] + '****' if ak else 'None'}")

try:
    dynamodb = boto3.client(
        'dynamodb',
        region_name=region,
        aws_access_key_id=ak,
        aws_secret_access_key=sk
    )
    
    print("\nAttempting to list tables...")
    response = dynamodb.list_tables()
    tables = response.get('TableNames', [])
    
    if not tables:
        print("No tables found in this region.")
    else:
        print(f"Found {len(tables)} tables:")
        for t in tables:
            print(f" - {t}")
            
except Exception as e:
    print(f"\nERROR: {e}")
