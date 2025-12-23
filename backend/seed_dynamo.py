"""
Accenture Communication Assessment - Question Distribution
Total: 41 verbal questions + 1 written email

Section A (Conversation Response): 6 questions
Section B (Listening Comprehension): 6 questions  
Section C (Reading): 8 questions
Section D (Listen & Repeat): 8 questions
Section E (Fill in Missing Word): 5 questions
Section F (Error Correction): 5 questions
Section G (Speaking Topic): 3 questions
Written Round: 1 email scenario
"""

import boto3
import os
from dotenv import load_dotenv

load_dotenv()

dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_DEFAULT_REGION', 'ap-south-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

table = dynamodb.Table('communication_questions')

def clear_table():
    print("🗑️  Clearing existing data...")
    scan = table.scan()
    with table.batch_writer() as batch:
        for item in scan['Items']:
            batch.delete_item(Key={'id': item['id']})
    print("✅ Table cleared!")

def seed_questions():
    questions = []
    
    # SECTION A: Conversation Response - 6 questions (3 scenarios with 2 questions each)
    questions.extend([
        {
            'id': 'a1', 'section': 'A',
            'prompt_text': 'Listen to the conversation about a project update.',
            'context_audio_src': 'Sarah is talking to her manager about a delayed project. She explains that the vendor missed the deadline due to supply chain issues, and the new expected delivery date is next Friday.',
            'sub_questions': [
                {'id': 'a1_q1', 'section': 'A', 'audio_src': 'Why was the project delayed?', 'correct_answer': 'The vendor missed the deadline due to supply chain issues.'},
                {'id': 'a1_q2', 'section': 'A', 'audio_src': 'When is the new expected delivery date?', 'correct_answer': 'Next Friday.'}
            ]
        },
        {
            'id': 'a2', 'section': 'A',
            'prompt_text': 'Listen to the conversation about a client meeting.',
            'context_audio_src': 'John is scheduling a meeting with a client. The client prefers Tuesday afternoon at 3 PM. John confirms the meeting room is booked and will send a calendar invite.',
            'sub_questions': [
                {'id': 'a2_q1', 'section': 'A', 'audio_src': 'What time is the meeting scheduled?', 'correct_answer': 'Tuesday afternoon at 3 PM.'},
                {'id': 'a2_q2', 'section': 'A', 'audio_src': 'What will John send to the client?', 'correct_answer': 'A calendar invite.'}
            ]
        },
        {
            'id': 'a3', 'section': 'A',
            'prompt_text': 'Listen to the conversation about team resources.',
            'context_audio_src': 'Maria is requesting additional developers for her team. She mentions that the current team of 5 is insufficient for the Q4 deliverables. The manager approves hiring 2 more developers.',
            'sub_questions': [
                {'id': 'a3_q1', 'section': 'A', 'audio_src': 'How many developers does Maria currently have?', 'correct_answer': 'Five developers.'},
                {'id': 'a3_q2', 'section': 'A', 'audio_src': 'How many additional developers were approved?', 'correct_answer': 'Two more developers.'}
            ]
        }
    ])
    
    # SECTION B: Listening Comprehension - 6 questions (2 passages with 3 questions each)
    questions.extend([
        {
            'id': 'b1', 'section': 'B',
            'prompt_text': 'Listen to the passage about TechCorp.',
            'context_audio_src': 'TechCorp was founded in Seattle by Dr. Michael Chen in 2015. The company specializes in artificial intelligence solutions for healthcare. Their flagship product, MediScan, has been adopted by over 200 hospitals.',
            'sub_questions': [
                {'id': 'b1_q1', 'section': 'B', 'audio_src': 'What city was TechCorp founded in?', 'correct_answer': 'Seattle'},
                {'id': 'b1_q2', 'section': 'B', 'audio_src': 'Who founded the company?', 'correct_answer': 'Dr. Michael Chen'},
                {'id': 'b1_q3', 'section': 'B', 'audio_src': 'What is their flagship product called?', 'correct_answer': 'MediScan'}
            ]
        },
        {
            'id': 'b2', 'section': 'B',
            'prompt_text': 'Listen to the passage about GreenEnergy Inc.',
            'context_audio_src': 'GreenEnergy Inc. is based in Austin, Texas. Founded by Jennifer Lopez in 2018, the company focuses on solar panel installation. They have completed projects in 15 states and employ over 500 technicians.',
            'sub_questions': [
                {'id': 'b2_q1', 'section': 'B', 'audio_src': 'Where is GreenEnergy Inc. located?', 'correct_answer': 'Austin, Texas'},
                {'id': 'b2_q2', 'section': 'B', 'audio_src': 'When was the company founded?', 'correct_answer': '2018'},
                {'id': 'b2_q3', 'section': 'B', 'audio_src': 'How many technicians do they employ?', 'correct_answer': 'Over 500 technicians'}
            ]
        }
    ])
    
    # SECTION C: Reading - 8 sentences
    questions.extend([
        {'id': 'c1', 'section': 'C', 'prompt_text': 'The quarterly financial report indicates a significant increase in revenue.', 'voice_type': 'male_1'},
        {'id': 'c2', 'section': 'C', 'prompt_text': 'Our team successfully implemented the new customer relationship management system.', 'voice_type': 'female_1'},
        {'id': 'c3', 'section': 'C', 'prompt_text': 'The project stakeholders have approved the budget allocation for next quarter.', 'voice_type': 'male_2'},
        {'id': 'c4', 'section': 'C', 'prompt_text': 'Please ensure all documentation is submitted before the deadline.', 'voice_type': 'female_2'},
        {'id': 'c5', 'section': 'C', 'prompt_text': 'The client has requested a comprehensive analysis of market trends.', 'voice_type': 'male_1'},
        {'id': 'c6', 'section': 'C', 'prompt_text': 'We are implementing new security protocols across all departments.', 'voice_type': 'female_1'},
        {'id': 'c7', 'section': 'C', 'prompt_text': 'The annual performance review will be conducted next month.', 'voice_type': 'male_2'},
        {'id': 'c8', 'section': 'C', 'prompt_text': 'All employees must complete the mandatory training by Friday.', 'voice_type': 'female_2'}
    ])
    
    # SECTION D: Listen and Repeat - 8 sentences
    questions.extend([
        {'id': 'd1', 'section': 'D', 'audio_src': 'Please submit your timesheet by end of day Friday.', 'correct_answer': 'Please submit your timesheet by end of day Friday.', 'voice_type': 'female_1'},
        {'id': 'd2', 'section': 'D', 'audio_src': 'The client has requested a comprehensive analysis of the market trends.', 'correct_answer': 'The client has requested a comprehensive analysis of the market trends.', 'voice_type': 'male_1'},
        {'id': 'd3', 'section': 'D', 'audio_src': 'We need to schedule a meeting with the stakeholders to discuss the timeline.', 'correct_answer': 'We need to schedule a meeting with the stakeholders to discuss the timeline.', 'voice_type': 'female_2'},
        {'id': 'd4', 'section': 'D', 'audio_src': 'The quarterly review will be held in the main conference room.', 'correct_answer': 'The quarterly review will be held in the main conference room.', 'voice_type': 'male_2'},
        {'id': 'd5', 'section': 'D', 'audio_src': 'Please update the project status in the tracking system.', 'correct_answer': 'Please update the project status in the tracking system.', 'voice_type': 'female_1'},
        {'id': 'd6', 'section': 'D', 'audio_src': 'The new policy will be effective from the first of next month.', 'correct_answer': 'The new policy will be effective from the first of next month.', 'voice_type': 'male_1'},
        {'id': 'd7', 'section': 'D', 'audio_src': 'All team members are required to attend the training session.', 'correct_answer': 'All team members are required to attend the training session.', 'voice_type': 'female_2'},
        {'id': 'd8', 'section': 'D', 'audio_src': 'The deadline for submission has been extended by one week.', 'correct_answer': 'The deadline for submission has been extended by one week.', 'voice_type': 'male_2'}
    ])
    
    # SECTION E: Fill in Missing Word - 5 questions
    questions.extend([
        {'id': 'e1', 'section': 'E', 'audio_src': 'The report was submitted ___ the manager yesterday.', 'correct_answer': 'The report was submitted to the manager yesterday.', 'missing_word': 'to', 'voice_type': 'male_1'},
        {'id': 'e2', 'section': 'E', 'audio_src': 'She has been working ___ this project for three months.', 'correct_answer': 'She has been working on this project for three months.', 'missing_word': 'on', 'voice_type': 'female_1'},
        {'id': 'e3', 'section': 'E', 'audio_src': 'The meeting will take place ___ the conference room.', 'correct_answer': 'The meeting will take place in the conference room.', 'missing_word': 'in', 'voice_type': 'male_2'},
        {'id': 'e4', 'section': 'E', 'audio_src': 'We are looking forward ___ your response.', 'correct_answer': 'We are looking forward to your response.', 'missing_word': 'to', 'voice_type': 'female_2'},
        {'id': 'e5', 'section': 'E', 'audio_src': 'The project depends ___ timely delivery of materials.', 'correct_answer': 'The project depends on timely delivery of materials.', 'missing_word': 'on', 'voice_type': 'male_1'}
    ])
    
    # SECTION F: Error Correction - 5 questions
    questions.extend([
        {'id': 'f1', 'section': 'F', 'audio_src': 'The team have completed their assignments on time.', 'correct_answer': 'The team has completed their assignments on time.', 'error_type': 'subject-verb agreement', 'voice_type': 'female_1'},
        {'id': 'f2', 'section': 'F', 'audio_src': "She don't have the required documentation for the audit.", 'correct_answer': "She doesn't have the required documentation for the audit.", 'error_type': 'subject-verb agreement', 'voice_type': 'male_1'},
        {'id': 'f3', 'section': 'F', 'audio_src': 'The project was completed more faster than expected.', 'correct_answer': 'The project was completed faster than expected.', 'error_type': 'comparative adjective', 'voice_type': 'female_2'},
        {'id': 'f4', 'section': 'F', 'audio_src': 'He go to the office every day by bus.', 'correct_answer': 'He goes to the office every day by bus.', 'error_type': 'subject-verb agreement', 'voice_type': 'male_2'},
        {'id': 'f5', 'section': 'F', 'audio_src': 'The manager have approved the budget request.', 'correct_answer': 'The manager has approved the budget request.', 'error_type': 'subject-verb agreement', 'voice_type': 'female_1'}
    ])
    
    # SECTION G: Speaking Topic - 3 questions
    questions.extend([
        {'id': 'g1', 'section': 'G', 'prompt_text': 'Describe your favorite sport and why you enjoy it.', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g2', 'section': 'G', 'prompt_text': 'Talk about your dream house. Where would it be and what features would it have?', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g3', 'section': 'G', 'prompt_text': 'Describe a memorable vacation you have taken or would like to take.', 'preparation_time': 25, 'speaking_time': 45}
    ])
    
    # WRITTEN ROUND: Email Writing - 1 detailed scenario
    questions.append({
        'id': 'written_email_1', 'section': 'WRITTEN',
        'prompt_text': 'You are a project manager at a software development company. Your team has been working on a critical client project for the past three months. The client, TechCorp Industries, is expecting the final deliverable by the end of this week. However, due to unexpected technical challenges with the integration of a third-party API and two team members being out sick, your team needs an additional two weeks to ensure the quality and stability of the product. The client has been very supportive throughout the project, but this is the second time you\'re requesting an extension. You need to inform them about this delay while maintaining their confidence in your team\'s ability to deliver a high-quality product. Write a professional email to the client (Sarah Johnson, VP of Technology at TechCorp Industries) explaining the situation, requesting the extension, and outlining your plan to ensure successful delivery. Your email should be between 200-250 words and maintain a professional yet empathetic tone.',
        'correct_answer': 'Professional email addressing the delay with clear explanation, timeline, and action plan',
        'email_type': 'project_delay_communication',
        'time_limit': 600,
        'word_range': '200-250'
    })
    
    print(f"📝 Seeding {len(questions)} questions...")
    with table.batch_writer() as batch:
        for question in questions:
            batch.put_item(Item=question)
    
    print(f"✅ Successfully seeded {len(questions)} questions!")
    print("\n📊 Question breakdown:")
    print("  Section A (Conversation): 6 questions (3 scenarios × 2 questions)")
    print("  Section B (Listening Comp): 6 questions (2 passages × 3 questions)")
    print("  Section C (Reading): 8 sentences")
    print("  Section D (Repeat): 8 sentences")
    print("  Section E (Fill Blank): 5 sentences")
    print("  Section F (Error Correction): 5 sentences")
    print("  Section G (Speaking Topic): 3 topics")
    print("  Written Round: 1 email scenario")
    print(f"\n  Total Verbal: 41 questions")
    print(f"  Total Written: 1 email")

if __name__ == '__main__':
    print("🚀 Starting DynamoDB reseed with 41 verbal questions + 1 email...")
    clear_table()
    seed_questions()
    print("\n🎉 Database successfully updated!")
