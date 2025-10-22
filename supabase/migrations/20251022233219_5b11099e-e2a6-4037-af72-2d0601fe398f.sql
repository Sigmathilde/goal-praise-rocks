-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles are viewable by everyone
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

-- Users can update their own profile
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- Create trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create goals table
create table public.goals (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.goals enable row level security;

-- Function to count active goals for a user
create or replace function public.count_active_goals(user_uuid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.goals
  where user_id = user_uuid and is_completed = false
$$;

-- Goals are viewable by everyone
create policy "Goals are viewable by everyone"
on public.goals for select
using (true);

-- Users can insert their own goals (max 3 active)
create policy "Users can insert their own goals"
on public.goals for insert
with check (
  auth.uid() = user_id 
  and public.count_active_goals(auth.uid()) < 3
);

-- Users can update their own goals
create policy "Users can update their own goals"
on public.goals for update
using (auth.uid() = user_id);

-- Users can delete their own goals
create policy "Users can delete their own goals"
on public.goals for delete
using (auth.uid() = user_id);

-- Create likes table
create table public.goal_likes (
  id uuid not null default gen_random_uuid() primary key,
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique(goal_id, user_id)
);

-- Enable RLS
alter table public.goal_likes enable row level security;

-- Likes are viewable by everyone
create policy "Likes are viewable by everyone"
on public.goal_likes for select
using (true);

-- Users can insert their own likes
create policy "Users can insert their own likes"
on public.goal_likes for insert
with check (auth.uid() = user_id);

-- Users can delete their own likes
create policy "Users can delete their own likes"
on public.goal_likes for delete
using (auth.uid() = user_id);

-- Create comments table
create table public.goal_comments (
  id uuid not null default gen_random_uuid() primary key,
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.goal_comments enable row level security;

-- Comments are viewable by everyone
create policy "Comments are viewable by everyone"
on public.goal_comments for select
using (true);

-- Users can insert their own comments
create policy "Users can insert their own comments"
on public.goal_comments for insert
with check (auth.uid() = user_id);

-- Users can delete their own comments
create policy "Users can delete their own comments"
on public.goal_comments for delete
using (auth.uid() = user_id);

-- Create updated_at trigger for goals
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_goals_updated_at
before update on public.goals
for each row
execute function public.update_updated_at_column();

-- Enable realtime for all tables
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.goal_likes;
alter publication supabase_realtime add table public.goal_comments;