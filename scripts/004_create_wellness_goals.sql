-- Create wellness_goals table for AI-generated personalized goals
create table if not exists public.wellness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  title text not null,
  description text not null,
  category text not null check (category in ('mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'therapy', 'medication', 'other')),
  
  target_frequency text, -- e.g., "daily", "3x per week"
  progress integer default 0 check (progress >= 0 and progress <= 100),
  
  status text default 'active' check (status in ('active', 'completed', 'paused', 'archived')),
  
  ai_generated boolean default true,
  ai_reasoning text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.wellness_goals enable row level security;

-- RLS Policies
create policy "wellness_goals_select_own"
  on public.wellness_goals for select
  using (auth.uid() = user_id);

create policy "wellness_goals_insert_own"
  on public.wellness_goals for insert
  with check (auth.uid() = user_id);

create policy "wellness_goals_update_own"
  on public.wellness_goals for update
  using (auth.uid() = user_id);

create policy "wellness_goals_delete_own"
  on public.wellness_goals for delete
  using (auth.uid() = user_id);
