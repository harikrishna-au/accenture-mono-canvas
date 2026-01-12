import boto3
import os

def list_models():
    client = boto3.client('bedrock', region_name='us-east-1')
    response = client.list_foundation_models()
    
    print("Available Models:")
    for model in response['modelSummaries']:
        if 'TEXT' in model['outputModalities']:
            print(f"- {model['modelId']} ({model['modelName']}) - Status: {model['modelLifecycle']['status']}")

if __name__ == "__main__":
    list_models()
