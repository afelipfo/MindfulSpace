-- Add location metadata to therapists for proximity search
alter table if exists public.therapists
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create index if not exists therapists_location_idx on public.therapists(latitude, longitude);
