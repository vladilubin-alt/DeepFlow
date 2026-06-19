-- Supabase Schema & RLS Policies Setup for DeepFlow
-- Copy and run this script in the Supabase SQL Editor

-- 0. Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text,
    streak_count integer not null default 0 constraint streak_count_nonnegative check (streak_count >= 0),
    grace_tokens integer not null default 3 constraint grace_tokens_nonnegative check (grace_tokens >= 0),
    last_active_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- 2. Writing Sessions Table
create table if not exists public.writing_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    duration_seconds integer not null constraint duration_seconds_nonnegative check (duration_seconds >= 0),
    target_words integer not null constraint target_words_nonnegative check (target_words >= 0),
    words_written integer not null constraint words_written_nonnegative check (words_written >= 0),
    guillotine_triggered boolean not null default false,
    grace_token_used boolean not null default false,
    status text not null constraint valid_status check (status in ('active', 'completed', 'guillotined', 'saved_by_grace')),
    created_at timestamptz not null default now()
);

-- Enable RLS for writing_sessions
alter table public.writing_sessions enable row level security;

-- Policies for writing_sessions
create policy "Users can view their own sessions"
    on public.writing_sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
    on public.writing_sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
    on public.writing_sessions for update
    using (auth.uid() = user_id);

-- 3. Drafts Table
create table if not exists public.drafts (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references public.writing_sessions(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null default '',
    word_count integer not null default 0 constraint word_count_nonnegative check (word_count >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for drafts
alter table public.drafts enable row level security;

-- Policies for drafts
create policy "Users can view their own drafts"
    on public.drafts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own drafts"
    on public.drafts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own drafts"
    on public.drafts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own drafts"
    on public.drafts for delete
    using (auth.uid() = user_id);

-- 4. Automatically Sync auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, streak_count, grace_tokens)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', new.email),
        0,
        3
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for public.handle_new_user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 5. Automatically update updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_drafts_updated_at on public.drafts;
create trigger update_drafts_updated_at
    before update on public.drafts
    for each row execute procedure public.update_updated_at_column();
