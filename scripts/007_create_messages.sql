-- Create messages table for real-time chat between users and therapists
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  
  content text not null,
  
  -- Privacy layer
  encrypted_content text, -- AES-256 encrypted version
  is_encrypted boolean default false,
  
  -- AI-generated initial message
  ai_generated boolean default false,
  
  read_at timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies - Users can only see messages they sent or received
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "messages_update_own"
  on public.messages for update
  using (auth.uid() = recipient_id); -- Only recipient can mark as read

-- Create indexes for efficient querying
create index if not exists messages_sender_idx on public.messages(sender_id, created_at desc);
create index if not exists messages_recipient_idx on public.messages(recipient_id, created_at desc);
create index if not exists messages_conversation_idx on public.messages(sender_id, recipient_id, created_at desc);
