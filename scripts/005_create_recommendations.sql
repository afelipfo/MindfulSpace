-- Create recommendations table for AI-generated personalized recommendations
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  type text not null check (type in ('music', 'book', 'place', 'activity', 'resource')),
  
  title text not null,
  description text,
  
  -- External API data
  external_id text, -- Spotify track ID, Amazon ASIN, Google Place ID, etc.
  external_url text,
  image_url text,
  metadata jsonb, -- Additional data from external APIs
  
  ai_reasoning text,
  relevance_score integer check (relevance_score >= 1 and relevance_score <= 10),
  
  user_feedback text check (user_feedback in ('helpful', 'not_helpful', 'saved')),
  
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.recommendations enable row level security;

-- RLS Policies
create policy "recommendations_select_own"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "recommendations_insert_own"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

create policy "recommendations_update_own"
  on public.recommendations for update
  using (auth.uid() = user_id);

create policy "recommendations_delete_own"
  on public.recommendations for delete
  using (auth.uid() = user_id);

-- Create index for efficient type-based queries
create index if not exists recommendations_user_type_idx on public.recommendations(user_id, type, created_at desc);
