
import boto3
import os
from dotenv import load_dotenv
import time

# Load env from backend folder with override
load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'), override=True)

from backend.data import DATA_BANK

def seed_data():
    region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
    table_name = os.getenv('DYNAMODB_TABLE', 'communication_questions')
    
    print(f"Connecting to DynamoDB (Region: {region}, Table: {table_name})...")
    # Debug identity
    sts = boto3.client('sts', region_name=region)
    print(f"Script Identity: {sts.get_caller_identity()['Arn']}")
    
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)
    
    try:
        table.load()
        print(f"Table '{table_name}' found. Status: {table.table_status}")
    except Exception as e:
        print(f"❌ Table '{table_name}' NOT found in this account.")
        print(f"Error: {e}")
        return

    print(f"Seeding {len(DATA_BANK)} items...")
    with table.batch_writer() as batch:
        for item in DATA_BANK:
            # Add section field for GSI
            item['section'] = item.get('category', 'General') 
            batch.put_item(Item=item)
            print(f"- Added {item['id']}")

    print("\n✅ Seeding complete!")

if __name__ == "__main__":
    seed_data()
