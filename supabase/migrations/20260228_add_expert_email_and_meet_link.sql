-- Add email to experts so we can notify them when a session is booked
ALTER TABLE experts ADD COLUMN IF NOT EXISTS email text;

-- Add meet_link to bookings so both parties can access the Google Meet URL
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meet_link text;
