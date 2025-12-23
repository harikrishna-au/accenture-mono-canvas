import boto3
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize DynamoDB client
dynamodb = boto3.client(
    'dynamodb',
    region_name=os.getenv('AWS_DEFAULT_REGION', 'ap-south-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

def create_table():
    """Create the communication_questions table"""
    try:
        print("🔨 Creating DynamoDB table...")
        response = dynamodb.create_table(
            TableName='communication_questions',
            KeySchema=[
                {
                    'AttributeName': 'id',
                    'KeyType': 'HASH'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'id',
                    'AttributeType': 'S'
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        print("⏳ Waiting for table to be created...")
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName='communication_questions')
        
        print("✅ Table created successfully!")
        return True
        
    except dynamodb.exceptions.ResourceInUseException:
        print("ℹ️  Table already exists, skipping creation")
        return True
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        return False

if __name__ == '__main__':
    create_table()
