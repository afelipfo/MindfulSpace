-- Ensure new profile settings columns exist for notification and privacy features
alter table if exists public.profiles
  add column if not exists timezone text default 'UTC',
  add column if not exists email_notifications boolean default true,
  add column if not exists sms_notifications boolean default false,
  add column if not exists product_updates boolean default true,
  add column if not exists ai_recommendations boolean default true,
  add column if not exists share_anonymized_data boolean default false;
