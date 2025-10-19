-- Create mood_logs table for tracking user moods
create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  mood_score integer not null check (mood_score >= 1 and mood_score <= 10),
  energy_level integer not null check (energy_level >= 1 and energy_level <= 10),
  stress_level integer not null check (stress_level >= 1 and stress_level <= 10),
  
  emotions text[] default '{}',
  triggers text[] default '{}',
  notes text,
  
  -- AI-generated insights
  ai_analysis jsonb,
  ai_message text,
  ai_prompt text,
  ai_quote text,
  
  created_at timestamp with time zone default now(),
  
  -- Index for efficient querying
  constraint mood_logs_user_created_idx unique (user_id, created_at)
);

-- Enable RLS
alter table public.mood_logs enable row level security;

-- RLS Policies
create policy "mood_logs_select_own"
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "mood_logs_insert_own"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

create policy "mood_logs_update_own"
  on public.mood_logs for update
  using (auth.uid() = user_id);

create policy "mood_logs_delete_own"
  on public.mood_logs for delete
  using (auth.uid() = user_id);

-- Create index for efficient date-based queries
create index if not exists mood_logs_user_date_idx on public.mood_logs(user_id, created_at desc);
