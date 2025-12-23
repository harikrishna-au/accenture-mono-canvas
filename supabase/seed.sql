-- Seed data for communication_questions
-- Run this in the Supabase SQL Editor

INSERT INTO public.communication_questions (id, section, prompt_text, context_audio_src, audio_src, follow_up_question, correct_answer, time_limit, sub_questions)
VALUES
  -- Intro
  ('intro_1', 'DEVICE_CHECK', 'Would you like to start your free trial today?', NULL, NULL, NULL, 'Would you like to start your free trial today', NULL, NULL),

  -- Section A
  ('a1', 'A', 'Listen to the information about Anna.', 'Your name is Anna. You like to paint in your free time.', 'The question is, what do you do in your free time?', NULL, 'I like to paint in my free time.', NULL, NULL),
  ('a2', 'A', 'Listen to the information about Alice.', 'Your name is Alice. You were born in London. In high school, you became interested in engineering. After graduation, you studied at the London Tech Institute. You are irritated today because you lost your ticket to a major tennis match. Tennis is your favorite sport, and you never miss a match if you can get tickets, otherwise, you prefer to spend your weekends watching movies at home.', NULL, NULL, NULL, NULL, 
   '[
      {"id": "a2_q1", "section": "A", "audioSrc": "Which college did you study in?", "correctAnswer": "I studied at the London Tech Institute."},
      {"id": "a2_q2", "section": "A", "audioSrc": "What is your favorite sport?", "correctAnswer": "Tennis is my favorite sport."},
      {"id": "a2_q3", "section": "A", "audioSrc": "How are you feeling today?", "correctAnswer": "I am feeling irritated today."}
   ]'),

  -- Section B
  ('b1', 'B', 'Situation: Your name is Peter. You wish to place an order for home delivery for a large pepperoni pizza and one bottle of juice. You will pay in cash.', 'Hi, this is Pizza Grill. Would you like to order for pickup or delivery?', NULL, NULL, NULL, NULL, 
   '[
      {"id": "b1_1", "section": "B", "audioSrc": "Hi, this is Pizza Grill. Would you like to order for pickup or delivery?", "correctAnswer": "I would like to order for home delivery."},
      {"id": "b1_2", "section": "B", "audioSrc": "Can I have your name please?", "correctAnswer": "My name is Peter."},
      {"id": "b1_3", "section": "B", "audioSrc": "Okay, what would you like?", "correctAnswer": "I would like a large pepperoni pizza and one bottle of juice."},
      {"id": "b1_4", "section": "B", "audioSrc": "Sure. Will that be all?", "correctAnswer": "Yes, that is all."},
      {"id": "b1_5", "section": "B", "audioSrc": "Okay. Are you paying by card or cash?", "correctAnswer": "I will pay by cash."}
   ]'),

  -- Section C
  ('c1', 'C', 'The college offers a unique curriculum for its exchange students.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c2', 'C', 'Please let me know if there are job opportunities in this field.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c3', 'C', 'How many pieces of baggage do you plan to carry with you?', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c4', 'C', 'According to President, the claims do not have any substance.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c5', 'C', 'What lovely ambience.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c6', 'C', 'The dog tried to chase the cats when she took it out for a walk.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c7', 'C', 'My book says that the sun rises in the east.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c8', 'C', 'Give me one minute, please.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c9', 'C', 'At what screen resolution should I work?', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c10', 'C', 'I can accompany you to store after I complete my work.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c11', 'C', 'We ran hundreds of checks before launching the product.', NULL, NULL, NULL, NULL, NULL, NULL),
  ('c12', 'C', 'Fill out the form so that we know your preferences.', NULL, NULL, NULL, NULL, NULL, NULL),

  -- Section D
  ('d1', 'D', '(Listen and Repeat)', NULL, 'He had treasured all his toys in the cupboard.', NULL, NULL, NULL, NULL),
  ('d2', 'D', '(Listen and Repeat)', NULL, 'How sweet of you to remember me.', NULL, NULL, NULL, NULL),
  ('d3', 'D', '(Listen and Repeat)', NULL, 'You should talk softly, but clearly.', NULL, NULL, NULL, NULL),
  ('d4', 'D', '(Listen and Repeat)', NULL, 'You will have to click on Cancel reservation to initialize the refund.', NULL, NULL, NULL, NULL),
  ('d5', 'D', '(Listen and Repeat)', NULL, 'Have you been to the movies lately?', NULL, NULL, NULL, NULL),
  ('d6', 'D', '(Listen and Repeat)', NULL, 'Let''s wait a while longer and then decide what to do.', NULL, NULL, NULL, NULL),
  ('d7', 'D', '(Listen and Repeat)', NULL, 'I''ll conduct a thorough investigation of the case.', NULL, NULL, NULL, NULL),
  ('d8', 'D', '(Listen and Repeat)', NULL, 'What a great offer.', NULL, NULL, NULL, NULL),
  ('d9', 'D', '(Listen and Repeat)', NULL, 'The artist drew a portrait of me.', NULL, NULL, NULL, NULL),

  -- Section E
  ('e1', 'E', 'Did he make an _____ with his dentist for Friday?', NULL, 'Did he make an [BEEP] with his dentist for Friday?', NULL, 'appointment', NULL, NULL),
  ('e2', 'E', 'They gave _____ vote to someone else.', NULL, 'They gave [BEEP] vote to someone else.', NULL, 'their', NULL, NULL),
  ('e3', 'E', 'I could hear him _____ angrily on the phone.', NULL, 'I could hear him [BEEP] angrily on the phone.', NULL, 'shouting', NULL, NULL),
  ('e4', 'E', 'She is pleased _____ her project results.', NULL, 'She is pleased [BEEP] her project results.', NULL, 'with', NULL, NULL),
  ('e5', 'E', 'She wore a sweater today because it is _____ outside.', NULL, 'She wore a sweater today because it is [BEEP] outside.', NULL, 'cool', NULL, NULL),
  ('e6', 'E', 'Will you call me if you _____ time?', NULL, 'Will you call me if you [BEEP] time?', NULL, 'get', NULL, NULL),
  ('e7', 'E', 'Did the project get _____ because of the heavy rain?', NULL, 'Did the project get [BEEP] because of the heavy rain?', NULL, 'delayed', NULL, NULL),
  ('e8', 'E', 'They arrived home late because of the _____ traffic.', NULL, 'They arrived home late because of the [BEEP] traffic.', NULL, 'heavy', NULL, NULL),

  -- Section F
  ('f1', 'F', '(Correct the error)', NULL, 'They are waiting for you in the entrance.', NULL, 'They are waiting for you at the entrance.', NULL, NULL),
  ('f2', 'F', '(Correct the error)', NULL, 'Between you and she, I think your record is better.', NULL, 'Between you and her, I think your record is better.', NULL, NULL),
  ('f3', 'F', '(Correct the error)', NULL, 'Can you give me an envelope?', NULL, 'Can you give me an envelope?', NULL, NULL),

  -- Section G
  ('g1', 'G', 'Topic: Your Dream Job', NULL, NULL, NULL, NULL, 45, NULL)

ON CONFLICT (id) DO UPDATE SET
  prompt_text = EXCLUDED.prompt_text,
  context_audio_src = EXCLUDED.context_audio_src,
  audio_src = EXCLUDED.audio_src,
  correct_answer = EXCLUDED.correct_answer,
  sub_questions = EXCLUDED.sub_questions;
