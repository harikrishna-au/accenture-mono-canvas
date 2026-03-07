import boto3
import time
from botocore.exceptions import ClientError
from decimal import Decimal

# DynamoDB Setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('communication_questions')

# --- Audio Generation Helpers ---
cf_client = boto3.client('cloudformation')
s3_client = boto3.client('s3')
polly_client = boto3.client('polly')

AUDIO_BUCKET_NAME = None

def get_audio_bucket_name():
    global AUDIO_BUCKET_NAME
    if AUDIO_BUCKET_NAME: return AUDIO_BUCKET_NAME
    try:
        # Assuming stack name is fixed as per deploy script
        response = cf_client.describe_stacks(StackName='communication-backend')
        for output in response['Stacks'][0].get('Outputs', []):
            if output['OutputKey'] == 'AudioAssetsBucketName':
                AUDIO_BUCKET_NAME = output['OutputValue']
                print(f"✅ Found Audio Bucket: {AUDIO_BUCKET_NAME}")
                return AUDIO_BUCKET_NAME
    except Exception as e:
        print(f"⚠️ Failed to get bucket name (Run deploy first?): {e}")
    return None

VOICE_MAP = {
    "male_1": "Matthew",
    "male_2": "Joey",
    "female_1": "Joanna",
    "female_2": "Salli"
}

def ensure_audio(text, q_id, suffix="", voice_type="female_1"):
    bucket = get_audio_bucket_name()
    if not bucket or not text: return None

    filename = f"audio/{q_id}{suffix}.mp3"
    s3_key = filename
    # Construct S3 URL (Public)
    region = boto3.session.Session().region_name
    s3_url = f"https://{bucket}.s3.{region}.amazonaws.com/{s3_key}"

    # Optimization: Check if exists to avoid re-generating (Polly costs)
    try:
        s3_client.head_object(Bucket=bucket, Key=s3_key)
        # print(f"  ⏭️  Exists: {filename}")
        return s3_url
    except ClientError:
        pass # Not found

    print(f"  🎙️  Generating audio for {q_id}{suffix}...")
    voice_id = VOICE_MAP.get(voice_type, "Joanna")
    
    try:
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,
            Engine='neural'
        )
        if "AudioStream" in response:
            s3_client.put_object(
                Bucket=bucket,
                Key=s3_key,
                Body=response['AudioStream'].read(),
                ContentType='audio/mpeg'
            )
            return s3_url
    except Exception as e:
        print(f"  ❌ Audio Gen Failed: {e}")
    
    return None

def clear_table():
    print("🗑️  Clearing existing data...")
    # Scan and delete all items (simple for this scale, for prod use batch delete)
    scan = table.scan()
    with table.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(
                Key={
                    'id': each['id']
                }
            )
    print("✅ Table cleared!")

def seed_questions():
    questions = []
    
    # ==========================================
    # SECTION A: Conversation Response (Pool of 9 items, Need 3)
    # ==========================================
    # SET 1 (Original)
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
    
    # SET 2 (User Provided - Anna/Alice)
    questions.extend([
        {
            'id': 'a4', 'section': 'A',
            'prompt_text': 'Listen to the conversation about hobbies.',
            'context_audio_src': 'Your name is Anna. You like to paint in your free time.',
            'sub_questions': [
                {'id': 'a4_q1', 'section': 'A', 'audio_src': 'What do you do in your free time?', 'correct_answer': 'I like to paint in my free time.'},
                # Added dummy question to meet "2 sub-questions" structure preference
                {'id': 'a4_q2', 'section': 'A', 'audio_src': 'What is your name?', 'correct_answer': 'My name is Anna.'}
            ]
        },
        {
            'id': 'a5', 'section': 'A',
            'prompt_text': 'Listen to the conversation about Alice part 1.',
            'context_audio_src': 'Your name is Alice. You were born in London. You studied at the London Tech Institute. Tennis is your favorite sport.',
            'sub_questions': [
                {'id': 'a5_q1', 'section': 'A', 'audio_src': 'Which college did you study in?', 'correct_answer': 'London Tech Institute.'},
                {'id': 'a5_q2', 'section': 'A', 'audio_src': 'What is your favorite sport?', 'correct_answer': 'Tennis.'}
            ]
        },
        {
            'id': 'a6', 'section': 'A',
            'prompt_text': 'Listen to the conversation about Alice part 2.',
            'context_audio_src': 'You are irritated today because you lost your ticket to a major tennis match. If you do not get tickets, you prefer to watch movies at home.',
            'sub_questions': [
                {'id': 'a6_q1', 'section': 'A', 'audio_src': 'How are you feeling today?', 'correct_answer': 'I am feeling irritated today.'},
                {'id': 'a6_q2', 'section': 'A', 'audio_src': 'What do you prefer to do on weekends if you do not attend a match?', 'correct_answer': 'I prefer to watch movies at home.'}
            ]
        }
    ])

    # SET 3 (Generated - Office/Bug/Budget)
    questions.extend([
        {
            'id': 'a7', 'section': 'A',
            'prompt_text': 'Listen to the conversation about office relocation.',
            'context_audio_src': 'The office manager announces that the company is moving to a new building downtown next month. Employees need to pack their personal items by Friday.',
            'sub_questions': [
                {'id': 'a7_q1', 'section': 'A', 'audio_src': 'Where is the company moving?', 'correct_answer': 'To a new building downtown.'},
                {'id': 'a7_q2', 'section': 'A', 'audio_src': 'When do employees need to pack by?', 'correct_answer': 'By Friday.'}
            ]
        },
        {
            'id': 'a8', 'section': 'A',
            'prompt_text': 'Listen to the conversation about a software bug.',
            'context_audio_src': 'David reports a critical bug in the login page affecting 10% of users. The team decides to roll back the latest deployment immediately.',
            'sub_questions': [
                {'id': 'a8_q1', 'section': 'A', 'audio_src': 'What is the issue reported?', 'correct_answer': 'A critical bug in the login page.'},
                {'id': 'a8_q2', 'section': 'A', 'audio_src': 'What is the team\'s decision?', 'correct_answer': 'To roll back the latest deployment.'}
            ]
        },
        {
            'id': 'a9', 'section': 'A',
            'prompt_text': 'Listen to the conversation about budget cuts.',
            'context_audio_src': 'The finance director explains that the travel budget has been reduced by 20% for the next quarter. All non-essential trips must be cancelled.',
            'sub_questions': [
                {'id': 'a9_q1', 'section': 'A', 'audio_src': 'How much was the travel budget reduced?', 'correct_answer': 'By 20 percent.'},
                {'id': 'a9_q2', 'section': 'A', 'audio_src': 'What happens to non-essential trips?', 'correct_answer': 'They must be cancelled.'}
            ]
        }
    ])
    
    # ==========================================
    # SECTION B: Listening Comprehension (Pool of 6 items, Need 2)
    # ==========================================
    # SET 1
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

    # SET 2 (User Provided - Pizza Order)
    questions.extend([
        {
            'id': 'b3', 'section': 'B',
            'prompt_text': 'Listen to the dialogue about ordering pizza (Part 1).',
            'context_audio_src': 'Your name is Peter. You want to place an order for home delivery. Order: One large pepperoni pizza and one bottle of juice.',
            'sub_questions': [
                {'id': 'b3_q1', 'section': 'B', 'audio_src': 'Would you like to order for pickup or delivery?', 'correct_answer': 'I would like to order for home delivery.'},
                {'id': 'b3_q2', 'section': 'B', 'audio_src': 'Can I have your name please?', 'correct_answer': 'My name is Peter.'},
                {'id': 'b3_q3', 'section': 'B', 'audio_src': 'What would you like to order?', 'correct_answer': 'I would like one large pepperoni pizza and one bottle of juice.'}
            ]
        },
        {
            'id': 'b4', 'section': 'B',
            'prompt_text': 'Listen to the dialogue about ordering pizza (Part 2).',
            'context_audio_src': 'The total is $25. Payment mode is Cash. Confirm your order.',
            'sub_questions': [
                {'id': 'b4_q1', 'section': 'B', 'audio_src': 'Will that be all?', 'correct_answer': 'Yes, that will be all.'},
                {'id': 'b4_q2', 'section': 'B', 'audio_src': 'Are you paying by card or cash?', 'correct_answer': 'I will pay by cash.'},
                {'id': 'b4_q3', 'section': 'B', 'audio_src': 'Confirm your order in one sentence.', 'correct_answer': 'I would like to order one pepperoni pizza and one bottle of juice for home delivery, and I will pay in cash.'}
            ]
        }
    ])

    # SET 3 (Generated - OceanBlue/SkyHigh)
    questions.extend([
        {
            'id': 'b5', 'section': 'B',
            'prompt_text': 'Listen to the passage about OceanBlue.',
            'context_audio_src': 'OceanBlue Logistics started in Miami in 2010. They manage international shipping routes across the Atlantic. Last year, they transported over 1 million containers.',
            'sub_questions': [
                {'id': 'b5_q1', 'section': 'B', 'audio_src': 'Where did OceanBlue start?', 'correct_answer': 'Miami.'},
                {'id': 'b5_q2', 'section': 'B', 'audio_src': 'What year did they start?', 'correct_answer': '2010.'},
                {'id': 'b5_q3', 'section': 'B', 'audio_src': 'How many containers did they transport last year?', 'correct_answer': 'Over 1 million.'}
            ]
        },
        {
            'id': 'b6', 'section': 'B',
            'prompt_text': 'Listen to the passage about SkyHigh Airlines.',
            'context_audio_src': 'SkyHigh Airlines operates out of Denver International Airport. They recently added 12 new Dreamliner aircraft to their fleet. The airline serves 45 destinations worldwide.',
            'sub_questions': [
                {'id': 'b6_q1', 'section': 'B', 'audio_src': 'Which airport does SkyHigh operate out of?', 'correct_answer': 'Denver International Airport.'},
                {'id': 'b6_q2', 'section': 'B', 'audio_src': 'How many new aircraft did they add?', 'correct_answer': '12.'},
                {'id': 'b6_q3', 'section': 'B', 'audio_src': 'How many destinations do they serve?', 'correct_answer': '45.'}
            ]
        }
    ])
    
    # ==========================================
    # SECTION C: Reading (Pool of 24, Need 8)
    # ==========================================
    questions.extend([
        # SET 1
        {'id': 'c1', 'section': 'C', 'prompt_text': 'The quarterly financial report indicates a significant increase in revenue.', 'voice_type': 'male_1'},
        {'id': 'c2', 'section': 'C', 'prompt_text': 'Our team successfully implemented the new customer relationship management system.', 'voice_type': 'female_1'},
        {'id': 'c3', 'section': 'C', 'prompt_text': 'The project stakeholders have approved the budget allocation for next quarter.', 'voice_type': 'male_2'},
        {'id': 'c4', 'section': 'C', 'prompt_text': 'Please ensure all documentation is submitted before the deadline.', 'voice_type': 'female_2'},
        {'id': 'c5', 'section': 'C', 'prompt_text': 'The client has requested a comprehensive analysis of market trends.', 'voice_type': 'male_1'},
        {'id': 'c6', 'section': 'C', 'prompt_text': 'We are implementing new security protocols across all departments.', 'voice_type': 'female_1'},
        {'id': 'c7', 'section': 'C', 'prompt_text': 'The annual performance review will be conducted next month.', 'voice_type': 'male_2'},
        {'id': 'c8', 'section': 'C', 'prompt_text': 'All employees must complete the mandatory training by Friday.', 'voice_type': 'female_2'},
        # SET 2 (User Provided 13-24)
        {'id': 'c9', 'section': 'C', 'prompt_text': 'The college offers a unique curriculum for its exchange students.', 'voice_type': 'male_1'},
        {'id': 'c10', 'section': 'C', 'prompt_text': 'Please let me know if there are job opportunities in this field.', 'voice_type': 'female_1'},
        {'id': 'c11', 'section': 'C', 'prompt_text': 'How many pieces of baggage do you plan to carry with you?', 'voice_type': 'male_2'},
        {'id': 'c12', 'section': 'C', 'prompt_text': 'According to the President, the claims do not have any substance.', 'voice_type': 'female_2'},
        {'id': 'c13', 'section': 'C', 'prompt_text': 'What a lovely ambience.', 'voice_type': 'male_1'},
        {'id': 'c14', 'section': 'C', 'prompt_text': 'The dog tried to chase the cats when she took it out for a walk.', 'voice_type': 'female_1'},
        {'id': 'c15', 'section': 'C', 'prompt_text': 'My book says that the sun rises in the east.', 'voice_type': 'male_2'},
        {'id': 'c16', 'section': 'C', 'prompt_text': 'Give me one minute, please.', 'voice_type': 'female_2'},
        {'id': 'c17', 'section': 'C', 'prompt_text': 'What screen resolution should I work with?', 'voice_type': 'male_1'},
        {'id': 'c18', 'section': 'C', 'prompt_text': 'I can accompany you to the store after I complete my work.', 'voice_type': 'female_1'},
        {'id': 'c19', 'section': 'C', 'prompt_text': 'We ran hundreds of checks before launching the product.', 'voice_type': 'male_2'},
        {'id': 'c20', 'section': 'C', 'prompt_text': 'Fill out the form so that we know your preferences.', 'voice_type': 'female_2'},
        # SET 3
        {'id': 'c21', 'section': 'C', 'prompt_text': 'Innovation is the key to maintaining a competitive edge in this industry.', 'voice_type': 'male_1'},
        {'id': 'c22', 'section': 'C', 'prompt_text': 'The marketing campaign exceeded our expectations in terms of reach.', 'voice_type': 'female_1'},
        {'id': 'c23', 'section': 'C', 'prompt_text': 'The software update addresses several critical security vulnerabilities.', 'voice_type': 'male_2'},
        {'id': 'c24', 'section': 'C', 'prompt_text': 'Our customer support team is available twenty-four seven.', 'voice_type': 'female_2'}
    ])
    
    # ==========================================
    # SECTION D: Listen and Repeat (Pool of 24, Need 8)
    # ==========================================
    questions.extend([
        # SET 1
        {'id': 'd1', 'section': 'D', 'audio_src': 'Please submit your timesheet by end of day Friday.', 'correct_answer': 'Please submit your timesheet by end of day Friday.', 'voice_type': 'female_1'},
        {'id': 'd2', 'section': 'D', 'audio_src': 'The client has requested a comprehensive analysis of the market trends.', 'correct_answer': 'The client has requested a comprehensive analysis of the market trends.', 'voice_type': 'male_1'},
        {'id': 'd3', 'section': 'D', 'audio_src': 'We need to schedule a meeting with the stakeholders to discuss the timeline.', 'correct_answer': 'We need to schedule a meeting with the stakeholders to discuss the timeline.', 'voice_type': 'female_2'},
        {'id': 'd4', 'section': 'D', 'audio_src': 'The quarterly review will be held in the main conference room.', 'correct_answer': 'The quarterly review will be held in the main conference room.', 'voice_type': 'male_2'},
        {'id': 'd5', 'section': 'D', 'audio_src': 'Please update the project status in the tracking system.', 'correct_answer': 'Please update the project status in the tracking system.', 'voice_type': 'female_1'},
        {'id': 'd6', 'section': 'D', 'audio_src': 'The new policy will be effective from the first of next month.', 'correct_answer': 'The new policy will be effective from the first of next month.', 'voice_type': 'male_1'},
        {'id': 'd7', 'section': 'D', 'audio_src': 'All team members are required to attend the training session.', 'correct_answer': 'All team members are required to attend the training session.', 'voice_type': 'female_2'},
        {'id': 'd8', 'section': 'D', 'audio_src': 'The deadline for submission has been extended by one week.', 'correct_answer': 'The deadline for submission has been extended by one week.', 'voice_type': 'male_2'},
        # SET 2 (User Provided 25-34)
        {'id': 'd9', 'section': 'D', 'audio_src': 'He had treasured all his toys in the cupboard.', 'correct_answer': 'He had treasured all his toys in the cupboard.', 'voice_type': 'female_1'},
        {'id': 'd10', 'section': 'D', 'audio_src': 'How sweet of you to remember me.', 'correct_answer': 'How sweet of you to remember me.', 'voice_type': 'male_1'},
        {'id': 'd11', 'section': 'D', 'audio_src': 'You should talk softly, but clearly.', 'correct_answer': 'You should talk softly, but clearly.', 'voice_type': 'female_2'},
        {'id': 'd12', 'section': 'D', 'audio_src': 'You will have to click on cancel reservation to initialize the refund.', 'correct_answer': 'You will have to click on cancel reservation to initialize the refund.', 'voice_type': 'male_2'},
        {'id': 'd13', 'section': 'D', 'audio_src': 'Have you been to the movies lately?', 'correct_answer': 'Have you been to the movies lately?', 'voice_type': 'female_1'},
        {'id': 'd14', 'section': 'D', 'audio_src': 'Let’s wait a while longer and then decide what to do.', 'correct_answer': 'Let’s wait a while longer and then decide what to do.', 'voice_type': 'male_1'},
        {'id': 'd15', 'section': 'D', 'audio_src': 'I’ll conduct a thorough investigation of the case.', 'correct_answer': 'I’ll conduct a thorough investigation of the case.', 'voice_type': 'female_2'},
        {'id': 'd16', 'section': 'D', 'audio_src': 'What a great offer.', 'correct_answer': 'What a great offer.', 'voice_type': 'male_2'},
        {'id': 'd17', 'section': 'D', 'audio_src': 'The artist drew a portrait of me.', 'correct_answer': 'The artist drew a portrait of me.', 'voice_type': 'female_1'},
        {'id': 'd18', 'section': 'D', 'audio_src': 'Sir.', 'correct_answer': 'Sir.', 'voice_type': 'male_1'},
        # SET 3
        {'id': 'd19', 'section': 'D', 'audio_src': 'Innovation drives our company forward in a competitive market.', 'correct_answer': 'Innovation drives our company forward in a competitive market.', 'voice_type': 'female_1'},
        {'id': 'd20', 'section': 'D', 'audio_src': 'Please ensure your contact information is up to date.', 'correct_answer': 'Please ensure your contact information is up to date.', 'voice_type': 'male_1'},
        {'id': 'd21', 'section': 'D', 'audio_src': 'We have decided to postpone the launch date by two days.', 'correct_answer': 'We have decided to postpone the launch date by two days.', 'voice_type': 'female_2'},
        {'id': 'd22', 'section': 'D', 'audio_src': 'The technical support team resolved the issue within an hour.', 'correct_answer': 'The technical support team resolved the issue within an hour.', 'voice_type': 'male_2'},
        {'id': 'd23', 'section': 'D', 'audio_src': 'Quality assurance is a critical part of our development process.', 'correct_answer': 'Quality assurance is a critical part of our development process.', 'voice_type': 'female_1'},
        {'id': 'd24', 'section': 'D', 'audio_src': 'Visitors must sign in at the reception desk upon arrival.', 'correct_answer': 'Visitors must sign in at the reception desk upon arrival.', 'voice_type': 'male_1'}
    ])
    
    # ==========================================
    # SECTION E: Fill in Missing Word (Pool of 15, Need 5)
    # ==========================================
    questions.extend([
        # SET 1
        {'id': 'e1', 'section': 'E', 'audio_src': 'The report was submitted ___ the manager yesterday.', 'correct_answer': 'The report was submitted to the manager yesterday.', 'missing_word': 'to', 'voice_type': 'male_1'},
        {'id': 'e2', 'section': 'E', 'audio_src': 'She has been working ___ this project for three months.', 'correct_answer': 'She has been working on this project for three months.', 'missing_word': 'on', 'voice_type': 'female_1'},
        {'id': 'e3', 'section': 'E', 'audio_src': 'The meeting will take place ___ the conference room.', 'correct_answer': 'The meeting will take place in the conference room.', 'missing_word': 'in', 'voice_type': 'male_2'},
        {'id': 'e4', 'section': 'E', 'audio_src': 'We are looking forward ___ your response.', 'correct_answer': 'We are looking forward to your response.', 'missing_word': 'to', 'voice_type': 'female_2'},
        {'id': 'e5', 'section': 'E', 'audio_src': 'The project depends ___ timely delivery of materials.', 'correct_answer': 'The project depends on timely delivery of materials.', 'missing_word': 'on', 'voice_type': 'male_1'},
        # SET 2 (User Provided 35-42)
        {'id': 'e6', 'section': 'E', 'audio_src': 'Did he make an ___ with his dentist for Friday?', 'correct_answer': 'Did he make an appointment with his dentist for Friday?', 'missing_word': 'appointment', 'voice_type': 'male_1'},
        {'id': 'e7', 'section': 'E', 'audio_src': 'They gave ___ vote to someone else.', 'correct_answer': 'They gave their vote to someone else.', 'missing_word': 'their', 'voice_type': 'female_1'},
        {'id': 'e8', 'section': 'E', 'audio_src': 'I could hear him ___ angrily on the phone.', 'correct_answer': 'I could hear him shouting angrily on the phone.', 'missing_word': 'shouting', 'voice_type': 'male_2'},
        {'id': 'e9', 'section': 'E', 'audio_src': 'She is pleased ___ her project results.', 'correct_answer': 'She is pleased with her project results.', 'missing_word': 'with', 'voice_type': 'female_2'},
        {'id': 'e10', 'section': 'E', 'audio_src': 'She wore a sweater today because it is ___ outside.', 'correct_answer': 'She wore a sweater today because it is cold outside.', 'missing_word': 'cold', 'voice_type': 'male_1'},
        {'id': 'e11', 'section': 'E', 'audio_src': 'Will you call me if you ___ time?', 'correct_answer': 'Will you call me if you have time?', 'missing_word': 'have', 'voice_type': 'female_1'},
        {'id': 'e12', 'section': 'E', 'audio_src': 'Did the project get ___ because of the heavy rain?', 'correct_answer': 'Did the project get delayed because of the heavy rain?', 'missing_word': 'delayed', 'voice_type': 'male_2'},
        {'id': 'e13', 'section': 'E', 'audio_src': 'They arrived home late because of the ___ traffic.', 'correct_answer': 'They arrived home late because of the heavy traffic.', 'missing_word': 'heavy', 'voice_type': 'female_2'},
        # SET 3
        {'id': 'e14', 'section': 'E', 'audio_src': 'The team consists ___ five developers and one designer.', 'correct_answer': 'The team consists of five developers and one designer.', 'missing_word': 'of', 'voice_type': 'male_1'},
        {'id': 'e15', 'section': 'E', 'audio_src': 'They successfully applied ___ the grant last week.', 'correct_answer': 'They successfully applied for the grant last week.', 'missing_word': 'for', 'voice_type': 'female_1'}
    ])
    
    # ==========================================
    # SECTION F: Error Correction (Pool of 15, Need 5)
    # ==========================================
    questions.extend([
        # SET 1
        {'id': 'f1', 'section': 'F', 'audio_src': 'The team have completed their assignments on time.', 'correct_answer': 'The team has completed their assignments on time.', 'error_type': 'subject-verb agreement', 'voice_type': 'female_1'},
        {'id': 'f2', 'section': 'F', 'audio_src': "She don't have the required documentation for the audit.", 'correct_answer': "She doesn't have the required documentation for the audit.", 'error_type': 'subject-verb agreement', 'voice_type': 'male_1'},
        {'id': 'f3', 'section': 'F', 'audio_src': 'The project was completed more faster than expected.', 'correct_answer': 'The project was completed faster than expected.', 'error_type': 'comparative adjective', 'voice_type': 'female_2'},
        {'id': 'f4', 'section': 'F', 'audio_src': 'He go to the office every day by bus.', 'correct_answer': 'He goes to the office every day by bus.', 'error_type': 'subject-verb agreement', 'voice_type': 'male_2'},
        {'id': 'f5', 'section': 'F', 'audio_src': 'The manager have approved the budget request.', 'correct_answer': 'The manager has approved the budget request.', 'error_type': 'subject-verb agreement', 'voice_type': 'female_1'},
        # SET 2 (User Provided 43-47)
        {'id': 'f6', 'section': 'F', 'audio_src': 'They are waiting for you in the entrance.', 'correct_answer': 'They are waiting for you at the entrance.', 'error_type': 'preposition', 'voice_type': 'male_1'},
        {'id': 'f7', 'section': 'F', 'audio_src': 'Between you and she, I think your record is better.', 'correct_answer': 'Between you and me, I think your record is better.', 'error_type': 'pronoun case', 'voice_type': 'female_1'},
        {'id': 'f8', 'section': 'F', 'audio_src': 'Can you give me an envelope?', 'correct_answer': 'Can you give me an envelope?', 'error_type': 'no correction', 'voice_type': 'male_2'},
        {'id': 'f9', 'section': 'F', 'audio_src': 'Identify and correct the error in the sentence.', 'correct_answer': 'Identify and correct the error in the sentence.', 'error_type': 'none', 'voice_type': 'female_2'},
        {'id': 'f10', 'section': 'F', 'audio_src': 'Repeat the corrected sentence confidently.', 'correct_answer': 'Repeat the corrected sentence confidently.', 'error_type': 'none', 'voice_type': 'male_1'},
        # SET 3
        {'id': 'f11', 'section': 'F', 'audio_src': 'One of the engineers are absent today.', 'correct_answer': 'One of the engineers is absent today.', 'error_type': 'subject-verb agreement', 'voice_type': 'female_1'},
        {'id': 'f12', 'section': 'F', 'audio_src': 'I have seen him yesterday at the conference.', 'correct_answer': 'I saw him yesterday at the conference.', 'error_type': 'tense usage', 'voice_type': 'male_2'},
        {'id': 'f13', 'section': 'F', 'audio_src': 'Can you tell me where is the meeting room?', 'correct_answer': 'Can you tell me where the meeting room is?', 'error_type': 'embedded question', 'voice_type': 'female_2'},
        {'id': 'f14', 'section': 'F', 'audio_src': 'The data shows that sales is increasing.', 'correct_answer': 'The data shows that sales are increasing.', 'error_type': 'plural noun', 'voice_type': 'male_1'},
        {'id': 'f15', 'section': 'F', 'audio_src': 'We need to discuss about the new policy.', 'correct_answer': 'We need to discuss the new policy.', 'error_type': 'preposition', 'voice_type': 'female_1'}
    ])
    
    # ==========================================
    # SECTION G: Speaking Topic (Pool of 9, Need 3)
    # ==========================================
    questions.extend([
        # SET 1
        {'id': 'g1', 'section': 'G', 'prompt_text': 'Describe your favorite sport and why you enjoy it.', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g2', 'section': 'G', 'prompt_text': 'Talk about your dream house. Where would it be and what features would it have?', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g3', 'section': 'G', 'prompt_text': 'Describe a memorable vacation you have taken or would like to take.', 'preparation_time': 25, 'speaking_time': 45},
        # SET 2 (User Topic)
        {'id': 'g4', 'section': 'G', 'prompt_text': 'Topic: Your Dream Job. Describe it.', 'preparation_time': 30, 'speaking_time': 45},
        {'id': 'g5', 'section': 'G', 'prompt_text': 'Discuss the importance of teamwork in a professional setting.', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g6', 'section': 'G', 'prompt_text': 'Describe a technology that has significantly changed your life.', 'preparation_time': 25, 'speaking_time': 45},
        # SET 3
        {'id': 'g7', 'section': 'G', 'prompt_text': 'Do you prefer working remotely or in an office? Explain your reasons.', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g8', 'section': 'G', 'prompt_text': 'Describe a person who has influenced you and how.', 'preparation_time': 25, 'speaking_time': 45},
        {'id': 'g9', 'section': 'G', 'prompt_text': 'What are the qualities of a good leader? Explain with examples.', 'preparation_time': 25, 'speaking_time': 45}
    ])
    
    # ==========================================
    # WRITTEN ROUND: Email Writing (Pool of 3, Need 1)
    # ==========================================
    questions.extend([
        # SET 1
        {
            'id': 'written_email_1', 'section': 'WRITTEN',
            'prompt_text': 'You are a project manager at a software development company. Your team has been working on a critical client project for the past three months. The client, TechCorp Industries, is expecting the final deliverable by the end of this week. However, due to unexpected technical challenges with the integration of a third-party API and two team members being out sick, your team needs an additional two weeks to ensure the quality and stability of the product. The client has been very supportive throughout the project, but this is the second time you\'re requesting an extension. You need to inform them about this delay while maintaining their confidence in your team\'s ability to deliver a high-quality product. Write a professional email to the client (Sarah Johnson, VP of Technology at TechCorp Industries) explaining the situation, requesting the extension, and outlining your plan to ensure successful delivery. Your email should be between 200-250 words and maintain a professional yet empathetic tone.',
            'correct_answer': 'Professional email addressing the delay with clear explanation, timeline, and action plan',
            'email_type': 'project_delay_communication',
            'time_limit': 600,
            'word_range': '200-250'
        },
        # SET 2 (User Provided)
        {
            'id': 'written_email_2', 'section': 'WRITTEN',
            'prompt_text': 'You are a project manager at a software development company. Your team is facing a delay due to third-party API integration issues and temporary team unavailability. Write a professional email to the client requesting a two-week extension. Recipient: Sarah Johnson, VP of Technology at TechCorp Industries. Word limit: 200–250 words.',
            'correct_answer': 'Professional email addressing the delay',
            'email_type': 'project_delay_communication',
            'time_limit': 600,
            'word_range': '200-250'
        },
        # SET 3
        {
            'id': 'written_email_3', 'section': 'WRITTEN',
            'prompt_text': 'You are a Team Lead at CreativeDesign Agency. Your team has just completed a major rebranding project for a client, GreenEarth Foods. The client is extremely happy with the results. Write an email to your team (5 members) congratulating them on the successful completion. Highlight the specific challenges they overcame (tight deadline, last-minute scope changes) and express your appreciation for their hard work and late nights. Mention that you have arranged a celebratory lunch for Friday. keep the tone professional but warm and appreciative.',
            'correct_answer': 'Appreciation email to team highlighting success, overcoming challenges, and reward',
            'email_type': 'team_appreciation',
            'time_limit': 600,
            'word_range': '200-250'
        }
    ])
    
    # ==========================================
    # PATTERN 2 — P2_READ_SENTENCE (Pool of 15, picks 5 randomly per session)
    # promptText is shown on screen; user reads it aloud
    # ==========================================
    questions.extend([
        {'id': 'p2_rs_1',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'The committee has decided to postpone the annual shareholders meeting until further notice.', 'voice_type': 'male_1'},
        {'id': 'p2_rs_2',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'Effective communication skills are essential for career advancement in any professional field.', 'voice_type': 'female_1'},
        {'id': 'p2_rs_3',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'Please ensure all required documents are submitted before the end of the business day.', 'voice_type': 'male_2'},
        {'id': 'p2_rs_4',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'The revised policy will take effect from the first of next month across all departments.', 'voice_type': 'female_2'},
        {'id': 'p2_rs_5',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'We appreciate your continued support and look forward to a productive collaboration ahead.', 'voice_type': 'male_1'},
        {'id': 'p2_rs_6',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'The new software system will streamline our operations and reduce processing time significantly.', 'voice_type': 'female_1'},
        {'id': 'p2_rs_7',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'All team members are expected to attend the mandatory safety briefing on Monday morning.', 'voice_type': 'male_2'},
        {'id': 'p2_rs_8',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'The client has expressed satisfaction with the project progress and approved the next milestone.', 'voice_type': 'female_2'},
        {'id': 'p2_rs_9',  'section': 'P2_READ_SENTENCE', 'prompt_text': 'Our organisation is committed to providing equal opportunities for all employees at every level.', 'voice_type': 'male_1'},
        {'id': 'p2_rs_10', 'section': 'P2_READ_SENTENCE', 'prompt_text': 'The annual conference will be held at the Grand Hyatt Hotel in the city centre next week.', 'voice_type': 'female_1'},
        {'id': 'p2_rs_11', 'section': 'P2_READ_SENTENCE', 'prompt_text': 'Please review the attached documents and provide your feedback by the end of this week.', 'voice_type': 'male_2'},
        {'id': 'p2_rs_12', 'section': 'P2_READ_SENTENCE', 'prompt_text': 'The financial audit confirmed that all accounts are in compliance with regulatory standards.', 'voice_type': 'female_2'},
        {'id': 'p2_rs_13', 'section': 'P2_READ_SENTENCE', 'prompt_text': 'We have successfully launched the new product line ahead of the scheduled release date.', 'voice_type': 'male_1'},
        {'id': 'p2_rs_14', 'section': 'P2_READ_SENTENCE', 'prompt_text': 'The human resources department will be conducting interviews throughout the month of April.', 'voice_type': 'female_1'},
        {'id': 'p2_rs_15', 'section': 'P2_READ_SENTENCE', 'prompt_text': 'Collaboration between departments is essential to achieving our organisational goals this year.', 'voice_type': 'male_2'},
    ])

    # ==========================================
    # PATTERN 2 — P2_REPEAT_SENTENCE (Pool of 15, picks 5 randomly per session)
    # audio_src is the sentence spoken via TTS; user listens then repeats
    # ==========================================
    questions.extend([
        {'id': 'p2_rep_1',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The project deadline has been extended by two weeks due to unforeseen delays.', 'voice_type': 'male_1'},
        {'id': 'p2_rep_2',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'Please review the attached report and share your detailed feedback by Friday.', 'voice_type': 'female_1'},
        {'id': 'p2_rep_3',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The meeting will be held in the main conference room at twelve noon tomorrow.', 'voice_type': 'male_1'},
        {'id': 'p2_rep_4',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'All employees are requested to update their emergency contact information immediately.', 'voice_type': 'female_1'},
        {'id': 'p2_rep_5',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The quarterly results exceeded our initial expectations by a significant margin.', 'voice_type': 'male_1'},
        {'id': 'p2_rep_6',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The management team has approved the proposed budget for the upcoming quarter.', 'voice_type': 'female_1'},
        {'id': 'p2_rep_7',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'Please ensure your identification badge is visible at all times while on the premises.', 'voice_type': 'male_2'},
        {'id': 'p2_rep_8',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The training session will be conducted online via the company learning portal next Monday.', 'voice_type': 'female_2'},
        {'id': 'p2_rep_9',  'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'We are pleased to inform you that your application has been shortlisted for review.', 'voice_type': 'male_1'},
        {'id': 'p2_rep_10', 'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The customer satisfaction survey results were presented at this morning\'s board meeting.', 'voice_type': 'female_1'},
        {'id': 'p2_rep_11', 'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'All invoices must be processed within five business days of receipt.', 'voice_type': 'male_2'},
        {'id': 'p2_rep_12', 'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The new employee orientation programme will begin next Tuesday at nine in the morning.', 'voice_type': 'female_2'},
        {'id': 'p2_rep_13', 'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'Our technical team resolved the server outage issue within three hours of detection.', 'voice_type': 'male_1'},
        {'id': 'p2_rep_14', 'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'The management has decided to implement a flexible work-from-home policy from next month.', 'voice_type': 'female_1'},
        {'id': 'p2_rep_15', 'section': 'P2_REPEAT_SENTENCE', 'audio_src': 'Please be advised that the office will be closed on account of the national holiday.', 'voice_type': 'male_1'},
    ])

    # ==========================================
    # PATTERN 2 — P2_QA_SPOKEN (Pool of 12, picks 4 randomly per session)
    # audio_src is the question spoken via TTS; user records a verbal answer
    # ==========================================
    questions.extend([
        {'id': 'p2_qa_1',  'section': 'P2_QA_SPOKEN', 'audio_src': 'Tell me about a time you handled a difficult situation at work or college.', 'voice_type': 'female_1'},
        {'id': 'p2_qa_2',  'section': 'P2_QA_SPOKEN', 'audio_src': 'How do you prioritize your tasks when you have multiple deadlines at the same time?', 'voice_type': 'male_1'},
        {'id': 'p2_qa_3',  'section': 'P2_QA_SPOKEN', 'audio_src': 'Describe your ideal work environment and the kind of team you work best in.', 'voice_type': 'female_1'},
        {'id': 'p2_qa_4',  'section': 'P2_QA_SPOKEN', 'audio_src': 'What motivates you to perform at your best even during challenging times?', 'voice_type': 'male_1'},
        {'id': 'p2_qa_5',  'section': 'P2_QA_SPOKEN', 'audio_src': 'How do you handle constructive criticism from a manager or senior colleague?', 'voice_type': 'female_1'},
        {'id': 'p2_qa_6',  'section': 'P2_QA_SPOKEN', 'audio_src': 'Describe a situation where you had to learn something new quickly to complete a task.', 'voice_type': 'male_1'},
        {'id': 'p2_qa_7',  'section': 'P2_QA_SPOKEN', 'audio_src': 'What do you consider your greatest professional strength and how does it help you at work?', 'voice_type': 'female_1'},
        {'id': 'p2_qa_8',  'section': 'P2_QA_SPOKEN', 'audio_src': 'Tell me about a time you worked as part of a team to achieve a shared goal.', 'voice_type': 'male_1'},
        {'id': 'p2_qa_9',  'section': 'P2_QA_SPOKEN', 'audio_src': 'How do you manage your time when you have both urgent and important tasks competing for attention?', 'voice_type': 'female_1'},
        {'id': 'p2_qa_10', 'section': 'P2_QA_SPOKEN', 'audio_src': 'Describe a challenge you faced during an academic project and how you overcame it.', 'voice_type': 'male_1'},
        {'id': 'p2_qa_11', 'section': 'P2_QA_SPOKEN', 'audio_src': 'What steps do you take to ensure accuracy and quality in your work?', 'voice_type': 'female_1'},
        {'id': 'p2_qa_12', 'section': 'P2_QA_SPOKEN', 'audio_src': 'Tell me about an experience that made you a better communicator.', 'voice_type': 'male_1'},
    ])

    # ==========================================
    # PATTERN 2 — P2_REARRANGEMENT (Pool of 12, picks 4 randomly per session)
    # correct_answer is the full sentence; frontend splits into words and shuffles
    # ==========================================
    questions.extend([
        {'id': 'p2_rear_1',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'Reports must be submitted before the deadline', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_2',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'The team completed the project by collaborating effectively', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_3',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'All employees are required to attend the training program', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_4',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'The announcement will appear on the official website', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_5',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'She presented her ideas clearly during the meeting', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_6',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'The manager approved the budget for the new project', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_7',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'He completed the task ahead of schedule', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_8',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'The client was satisfied with the final report', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_9',  'section': 'P2_REARRANGEMENT', 'correct_answer': 'All applications must be received by the closing date', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_10', 'section': 'P2_REARRANGEMENT', 'correct_answer': 'The team leader praised the effort of every member', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_11', 'section': 'P2_REARRANGEMENT', 'correct_answer': 'Effective teamwork leads to better results for everyone', 'prompt_text': 'Rearrange the words.'},
        {'id': 'p2_rear_12', 'section': 'P2_REARRANGEMENT', 'correct_answer': 'The company launched a new product last quarter', 'prompt_text': 'Rearrange the words.'},
    ])

    # ==========================================
    # PATTERN 2 — P2_STORY_RETELLING (Pool of 5, picks 1 randomly per session)
    # audio_src is the full story text spoken via TTS; prompt_text is the story title
    # ==========================================
    questions.extend([
        {
            'id': 'p2_story_1', 'section': 'P2_STORY_RETELLING', 'voice_type': 'female_1',
            'prompt_text': "Priya's Initiative",
            'audio_src': "Priya joined a new company as a junior analyst. On her first day, she noticed that her team was struggling with a disorganized workflow. Instead of staying quiet, she scheduled a short meeting, presented a simple tracking system, and got approval to implement it. Within a month, the team's productivity increased by thirty percent. Her manager recognized her initiative and praised her contribution in the quarterly review. Within six months, Priya was promoted to team lead, setting an example of how proactive communication and problem-solving can drive career growth.",
        },
        {
            'id': 'p2_story_2', 'section': 'P2_STORY_RETELLING', 'voice_type': 'male_1',
            'prompt_text': "Rahul's Presentation",
            'audio_src': "Rahul was the quietest member of his software team. When the lead developer fell ill two days before a product demo, the manager had no choice but to ask Rahul to present. That night, Rahul studied every feature of the product, prepared clear notes, and rehearsed his delivery multiple times. The demo was a success. The client was impressed and signed a major contract. From that day, Rahul was known as the team's most reliable presenter and was given leadership responsibilities on the next project.",
        },
        {
            'id': 'p2_story_3', 'section': 'P2_STORY_RETELLING', 'voice_type': 'female_1',
            'prompt_text': "Ananya's Business",
            'audio_src': "Ananya started her own small business selling handmade jewellery online while she was still in college. She had no money for advertising, so she used social media to reach customers. Within six months, she had over two thousand followers and her first international order came from Singapore. By the time she graduated, she had saved enough to rent a small studio. Today, Ananya's brand is sold in fifteen stores across India and she employs four people from her hometown.",
        },
        {
            'id': 'p2_story_4', 'section': 'P2_STORY_RETELLING', 'voice_type': 'male_1',
            'prompt_text': "Dev's Complaint Log",
            'audio_src': "During his internship, Dev noticed that the company's customer complaints were never tracked properly. He created a simple spreadsheet to log and categorize each complaint, then shared it with his manager. Within a month, the company was responding to ninety percent of complaints within two days, compared to just forty percent before. The customer satisfaction score improved significantly. Dev was offered a full-time position before his internship even ended and was put in charge of the customer experience team.",
        },
        {
            'id': 'p2_story_5', 'section': 'P2_STORY_RETELLING', 'voice_type': 'female_1',
            'prompt_text': "Nina Overcomes Stage Fright",
            'audio_src': "Nina had always been afraid of public speaking. When her professor assigned her a group presentation, she was terrified. Instead of hiding, she rehearsed every day for two weeks, recorded herself on her phone, and asked her friends for honest feedback. On presentation day, she spoke clearly and confidently, making eye contact with the audience throughout. Her professor later told her she had the best delivery in the entire class. Inspired by this success, Nina went on to represent her college at a national debate competition the following semester.",
        },
    ])

    print(f"📝 Seeding {len(questions)} questions...")

    # --- Generate Audio Assets ---
    bucket_name = get_audio_bucket_name()
    if bucket_name:
        print(f"🔊 Processing Audio Assets (bucket: {bucket_name})...")
        for q in questions:
            voice = q.get('voice_type', 'female_1')
            
            # 1. Context Audio (Sections A, B)
            if q.get('context_audio_src'):
                url = ensure_audio(q['context_audio_src'], q['id'], suffix="_context", voice_type=voice)
                if url: q['context_audio_url'] = url
            
            # 2. Main Question Audio (Sections C, D, E, F + P2 sections)
            # Section C and P2_READ_SENTENCE use prompt_text (shown on screen, no TTS needed).
            # D, E, F, P2_REPEAT_SENTENCE, P2_QA_SPOKEN, P2_STORY_RETELLING use audio_src.
            audio_text = q.get('audio_src')
            if not audio_text and q.get('section') in ('C',):
                audio_text = q.get('prompt_text')
            
            # Special handling for Section E (Fill Blank) -> Replace '_' with 'blank'
            if q.get('section') == 'E' and audio_text:
                audio_text = audio_text.replace('_', ' blank ')

            if audio_text:
                url = ensure_audio(audio_text, q['id'], suffix="", voice_type=voice)
                if url: q['audio_url'] = url
            
            # 3. Sub-questions Audio
            if 'sub_questions' in q:
                for sub in q['sub_questions']:
                    if sub.get('audio_src'):
                        # Questions usually read by standard narrator (Joanna)
                        url = ensure_audio(sub['audio_src'], sub['id'], suffix="", voice_type="female_1")
                        if url: sub['audio_url'] = url
    else:
        print("⚠️ Skipping Audio Generation (No bucket found).")

    # Batch Write to DynamoDB
    with table.batch_writer() as batch:
        for question in questions:
            batch.put_item(Item=question)
    
    print(f"✅ Successfully seeded {len(questions)} questions!")
    print("\n📊 Question Pool Breakdown:")
    print("  [Pattern 1]")
    print("  Section A (Conversation): 9 items")
    print("  Section B (Listening Comp): 6 items")
    print("  Section C (Reading): 24 items")
    print("  Section D (Repeat): 24 items")
    print("  Section E (Fill Blank): 15 items")
    print("  Section F (Error Correction): 15 items")
    print("  Section G (Speaking Topic): 9 items")
    print("  Written Round: 3 items")
    print("  [Pattern 2]")
    print("  P2_READ_SENTENCE: 15 items  → picks 5 per session")
    print("  P2_REPEAT_SENTENCE: 15 items → picks 5 per session")
    print("  P2_QA_SPOKEN: 12 items      → picks 4 per session")
    print("  P2_REARRANGEMENT: 12 items  → picks 4 per session")
    print("  P2_STORY_RETELLING: 5 items → picks 1 per session")

if __name__ == '__main__':
    print("🚀 Starting DynamoDB reseed with Expanded Pool (Set 1 + User's Set 2 + Generated Set 3)...")
    clear_table()
    seed_questions()
    print("\n🎉 Database successfully updated with Random Pool!")
