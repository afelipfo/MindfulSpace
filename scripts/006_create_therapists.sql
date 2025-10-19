-- Create therapists table for mental health professionals
create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  full_name text not null,
  credentials text not null, -- e.g., "PhD, LCSW"
  specializations text[] default '{}',
  
  bio text,
  years_experience integer,
  
  gender text,
  languages text[] default '{}',
  
  therapy_approaches text[] default '{}', -- e.g., CBT, DBT, EMDR
  
  -- Pricing
  session_rate_min integer,
  session_rate_max integer,
  accepts_insurance boolean default false,
  insurance_providers text[] default '{}',
  
  -- Availability
  timezone text default 'UTC',
  
  -- Contact
  email text,
  phone text,
  
  -- Profile
  profile_image_url text,
  video_intro_url text,
  
  -- Status
  is_accepting_clients boolean default true,
  verified boolean default false,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.therapists enable row level security;

-- RLS Policies - Therapists are publicly viewable
create policy "therapists_select_all"
  on public.therapists for select
  using (true);

create policy "therapists_insert_own"
  on public.therapists for insert
  with check (auth.uid() = user_id);

create policy "therapists_update_own"
  on public.therapists for update
  using (auth.uid() = user_id);

create policy "therapists_delete_own"
  on public.therapists for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient searching
create index if not exists therapists_specializations_idx on public.therapists using gin(specializations);
create index if not exists therapists_accepting_idx on public.therapists(is_accepting_clients) where is_accepting_clients = true;
