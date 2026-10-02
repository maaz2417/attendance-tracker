create extension if not exists pgcrypto;

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  room text,
  credit_hours integer check (credit_hours between 1 and 12),
  semester_classes integer check (semester_classes > 0),
  weekly_classes integer not null default 1 check (weekly_classes > 0),
  created_at timestamptz not null default now()
);

alter table public.teachers add column if not exists credit_hours integer check (credit_hours between 1 and 12);
alter table public.teachers add column if not exists semester_classes integer check (semester_classes > 0);

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
  created_at timestamptz not null default now(),
  unique (teacher_id, class_date)
);

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
