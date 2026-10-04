create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,30}$'),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.get_email_for_username(requested_username text)
returns text
language sql
security definer set search_path = public
as $$
  select auth_users.email
  from auth.users as auth_users
  join public.profiles on public.profiles.id = auth_users.id
  where lower(public.profiles.username) = lower(trim(requested_username))
  limit 1;
$$;

revoke all on function public.get_email_for_username(text) from public;
grant execute on function public.get_email_for_username(text) to anon, authenticated;

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  room text,
  semester_classes integer check (semester_classes > 0),
  weekly_classes integer not null default 1 check (weekly_classes > 0),
  created_at timestamptz not null default now()
);

alter table public.teachers add column if not exists semester_classes integer check (semester_classes > 0);
alter table public.teachers drop column if exists credit_hours;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete cascade,
  title text not null,
  due date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_date date not null,
  status text not null check (status in ('present', 'absent')),
  created_at timestamptz not null default now()
);

alter table public.attendance drop constraint if exists attendance_teacher_id_class_date_key;

alter table public.teachers enable row level security;
alter table public.tasks enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "Users manage their own teachers" on public.teachers;
drop policy if exists "Users manage their own tasks" on public.tasks;
drop policy if exists "Users manage their own attendance" on public.attendance;

create policy "Users manage their own teachers"
on public.teachers for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage their own tasks"
on public.tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage their own attendance"
on public.attendance for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);