import boto3
import os
import uuid
import base64
from botocore.config import Config

# Initialize AWS Clients
# Explicitly set region for S3 to avoid 307 Temporary Redirects (Global -> Regional) which break CORS
# Using s3v4 signature version is also best practice
# FORCE endpoint_url to ensure presigned URLs are regional
s3_client = boto3.client(
    's3', 
    region_name='ap-south-1', 
    endpoint_url='https://s3.ap-south-1.amazonaws.com',
    config=Config(signature_version='s3v4')
)
polly_client = boto3.client('polly', region_name='ap-south-1')
dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')

# Table References
interview_table = dynamodb.Table(os.environ.get('INTERVIEW_TABLE', 'interview_sessions'))
communication_table = dynamodb.Table('communication_questions') # Hardcoded or env var

def generate_presigned_post(filename: str):
    bucket_name = os.environ.get("RESUME_BUCKET_NAME")
    if not bucket_name:
        raise Exception("RESUME_BUCKET_NAME not set")

    object_name = f"resumes/{uuid.uuid4()}_{filename}"
    
    try:
        response = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=object_name,
            # No 'acl': 'public-read' because BlockPublicAccess is ON
            Fields={"Content-Type": "application/pdf"},
            Conditions=[
                {"Content-Type": "application/pdf"},
                ["content-length-range", 1, 10485760] # Max 10MB
            ],
            ExpiresIn=3600
        )
        return response
    except Exception as e:
        print(f"S3 Presign Error: {e}")
        raise e

def generate_polly_audio(text: str, voice_id: str = 'Joanna'):
    try:
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,
            Engine='neural'
        )
        if "AudioStream" in response:
            return base64.b64encode(response['AudioStream'].read()).decode('utf-8')
    except Exception as e:
        print(f"Polly Error: {e}")
    return ""

def get_session(session_id: str):
    response = interview_table.get_item(Key={'session_id': session_id})
    return response.get('Item')

def save_session(item: dict):
    interview_table.put_item(Item=item)

def update_session_history(session_id: str, history: list):
    import json
    interview_table.update_item(
        Key={'session_id': session_id},
        UpdateExpression="set history = :h",
        ExpressionAttributeValues={':h': json.dumps(history)}
    )

def mark_session_completed(session_id: str):
    interview_table.update_item(
        Key={'session_id': session_id},
        UpdateExpression="set #s = :s",
        ExpressionAttributeNames={'#s': 'status'},
        ExpressionAttributeValues={':s': 'completed'}
    )
