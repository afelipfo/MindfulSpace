-- Fix therapist user_id associations for demo
-- This script creates dummy user accounts for therapists and links them

-- Note: In production, you would create proper auth.users entries through Supabase Auth
-- For demo purposes, we'll update existing therapists with user_id from existing users
-- or you can manually create user accounts through Supabase dashboard first

-- Option 1: Link therapists to existing user accounts (if you have test users)
-- Uncomment and modify the UUIDs below if you have existing user accounts:
/*
UPDATE public.therapists
SET user_id = 'YOUR_USER_UUID_HERE'
WHERE email = 'sarah.mitchell@example.com';

UPDATE public.therapists
SET user_id = 'ANOTHER_USER_UUID_HERE'
WHERE email = 'james.chen@example.com';
*/

-- Option 2: For a quick demo fix, create a single dummy user account through Supabase Auth first,
-- then run this to link all therapists to that account (not ideal but works for demo):
--
-- Steps:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create a test user (e.g., therapist@demo.com / password123)
-- 3. Copy the user's UUID
-- 4. Run this query replacing 'DEMO_USER_UUID' with the actual UUID:
/*
UPDATE public.therapists
SET user_id = 'DEMO_USER_UUID'
WHERE user_id IS NULL;
*/

-- Option 3: If you want to create separate user accounts for each therapist,
-- you need to use the Supabase Auth API or dashboard to create users first,
-- then update each therapist record individually.

-- Temporary workaround for demo:
-- This query will show you which therapists need user_id and any existing users you can link to:

-- Check therapists without user_id
SELECT id, full_name, email, user_id
FROM public.therapists
WHERE user_id IS NULL;

-- Check available users (run in Supabase SQL editor to see auth.users)
-- SELECT id, email FROM auth.users LIMIT 10;
