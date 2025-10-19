-- Create onboarding_data table to store 6-step onboarding responses
create table if not exists public.onboarding_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Step 1: Mental health concerns
  concerns text[] default '{}',
  concerns_other text,
  
  -- Step 2: Symptoms
  symptoms text[] default '{}',
  symptoms_other text,
  symptom_duration text,
  symptom_frequency text,
  
  -- Step 3: Treatment history
  previous_treatment boolean,
  current_medications text,
  therapy_history text,
  
  -- Step 4: Goals
  therapy_goals text[] default '{}',
  goals_other text,
  
  -- Step 5: Preferences
  therapist_gender_preference text,
  therapy_type_preference text[] default '{}',
  session_frequency_preference text,
  
  -- Step 6: Additional context
  additional_notes text,
  
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id)
);

-- Enable RLS
alter table public.onboarding_data enable row level security;

-- RLS Policies
create policy "onboarding_select_own"
  on public.onboarding_data for select
  using (auth.uid() = user_id);

create policy "onboarding_insert_own"
  on public.onboarding_data for insert
  with check (auth.uid() = user_id);

create policy "onboarding_update_own"
  on public.onboarding_data for update
  using (auth.uid() = user_id);

create policy "onboarding_delete_own"
  on public.onboarding_data for delete
  using (auth.uid() = user_id);
