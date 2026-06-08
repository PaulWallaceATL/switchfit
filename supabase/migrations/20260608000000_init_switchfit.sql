-- SwitchFit initial schema: user profiles + body scans.
-- Run in the Supabase SQL Editor, or via `supabase db push` after linking.
-- Auth is bypassed in the app for now; user_id is nullable so trusted
-- (service-role) writes work during testing, and RLS is ready for when auth is on.

-- =====================================================================
-- profiles: one row per auth user (populated once real auth is enabled)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- =====================================================================
-- body_scans: each saved scan/estimate, all measurements in inches
-- =====================================================================
create table if not exists public.body_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  method text not null check (method in ('lidar', 'photo')),
  height_in numeric(5, 1) not null,
  chest_in numeric(5, 1) not null,
  waist_in numeric(5, 1) not null,
  hips_in numeric(5, 1) not null,
  weight_lb numeric(5, 1),
  created_at timestamptz not null default now()
);

create index if not exists body_scans_user_created_idx
  on public.body_scans (user_id, created_at desc);

alter table public.body_scans enable row level security;

create policy "Users can view their own scans"
  on public.body_scans for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own scans"
  on public.body_scans for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own scans"
  on public.body_scans for delete
  using ((select auth.uid()) = user_id);

-- =====================================================================
-- Auto-create a profile row when a new auth user signs up.
-- Enable this when you turn real auth on. security definer + empty
-- search_path follows Supabase's recommended hardening.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
