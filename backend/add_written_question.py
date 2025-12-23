import boto3
from decimal import Decimal

# Initialize DynamoDB (using us-east-1 as default region)
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('communication_questions')

# Written email scenario
written_question = {
    'id': 'written_email_1',
    'section': 'WRITTEN',
    'prompt_text': 'You are a project manager at a software development company. Your team has been working on a critical client project for the past three months. The client, TechCorp Industries, is expecting the final deliverable by the end of this week. However, due to unexpected technical challenges with the integration of a third-party API and two team members being out sick, your team needs an additional two weeks to ensure the quality and stability of the product. The client has been very supportive throughout the project, but this is the second time you\'re requesting an extension. You need to inform them about this delay while maintaining their confidence in your team\'s ability to deliver a high-quality product. Write a professional email to the client (Sarah Johnson, VP of Technology at TechCorp Industries) explaining the situation, requesting the extension, and outlining your plan to ensure successful delivery. Your email should be between 200-250 words and maintain a professional yet empathetic tone.',
    'correct_answer': 'Professional email addressing the delay with clear explanation, timeline, and action plan',
    'voice_type': 'none',
    'audio_src': 'Email Writing: Project Delay Communication'
}

try:
    # Insert the question
    response = table.put_item(Item=written_question)
    print("✅ Successfully added written email question to DynamoDB!")
    print(f"   ID: {written_question['id']}")
    print(f"   Section: {written_question['section']}")
    
    # Verify it was added
    verify = table.get_item(Key={'id': 'written_email_1'})
    if 'Item' in verify:
        print("\n✅ Verification successful - question exists in database")
    else:
        print("\n❌ Verification failed - question not found")
        
except Exception as e:
    print(f"❌ Error adding question: {e}")
