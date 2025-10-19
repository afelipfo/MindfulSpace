-- Create appointments table for scheduling sessions
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users(id) on delete cascade,
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  
  scheduled_at timestamp with time zone not null,
  duration_minutes integer not null default 50,
  
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  -- Meeting details
  meeting_type text check (meeting_type in ('video', 'phone', 'in_person')),
  meeting_link text,
  meeting_notes text,
  
  -- Calendar integration
  google_calendar_event_id text,
  
  -- Cancellation
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.appointments enable row level security;

-- RLS Policies
create policy "appointments_select_own"
  on public.appointments for select
  using (auth.uid() = user_id);

create policy "appointments_insert_own"
  on public.appointments for insert
  with check (auth.uid() = user_id);

create policy "appointments_update_own"
  on public.appointments for update
  using (auth.uid() = user_id);

create policy "appointments_delete_own"
  on public.appointments for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient querying
create index if not exists appointments_user_date_idx on public.appointments(user_id, scheduled_at desc);
create index if not exists appointments_therapist_date_idx on public.appointments(therapist_id, scheduled_at desc);
