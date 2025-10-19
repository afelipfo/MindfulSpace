-- Create audit_logs table for security and compliance tracking
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid references auth.users(id) on delete set null,
  
  action text not null, -- e.g., "login", "profile_update", "data_export", "privacy_change"
  resource_type text, -- e.g., "profile", "mood_log", "message"
  resource_id uuid,
  
  ip_address inet,
  user_agent text,
  
  metadata jsonb,
  
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- RLS Policies - Users can only see their own audit logs
create policy "audit_logs_select_own"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- Only system can insert audit logs (via service role)
create policy "audit_logs_insert_system"
  on public.audit_logs for insert
  with check (false); -- Prevent direct inserts from users

-- Create index for efficient querying
create index if not exists audit_logs_user_date_idx on public.audit_logs(user_id, created_at desc);
