begin;

create table if not exists public.plan_runtime_settings (
  id int primary key default 1 check (id = 1),
  default_signup_plan text not null check (default_signup_plan in ('free', 'active')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.plan_runtime_settings (id, default_signup_plan)
values (1, 'active')
on conflict (id) do nothing;

drop trigger if exists set_plan_runtime_settings_updated_at on public.plan_runtime_settings;
create trigger set_plan_runtime_settings_updated_at
before update on public.plan_runtime_settings
for each row execute function public.set_updated_at();

alter table public.plan_runtime_settings enable row level security;

drop policy if exists "plan_runtime_settings_select_authenticated" on public.plan_runtime_settings;
create policy "plan_runtime_settings_select_authenticated"
on public.plan_runtime_settings
for select
to authenticated
using (true);

create table if not exists public.user_plan_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_code text not null check (plan_code in ('free', 'active')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  source text not null default 'signup_default',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_user_plan_access_updated_at on public.user_plan_access;
create trigger set_user_plan_access_updated_at
before update on public.user_plan_access
for each row execute function public.set_updated_at();

alter table public.user_plan_access enable row level security;

drop policy if exists "user_plan_access_select_own" on public.user_plan_access;
create policy "user_plan_access_select_own"
on public.user_plan_access
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_plan_access_update_own" on public.user_plan_access;
create policy "user_plan_access_update_own"
on public.user_plan_access
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user_plan_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_plan text;
begin
  select default_signup_plan
  into signup_plan
  from public.plan_runtime_settings
  where id = 1;

  insert into public.user_plan_access (user_id, plan_code, status, source)
  values (
    new.id,
    coalesce(signup_plan, 'active'),
    'active',
    'signup_default'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_plan_access on auth.users;
create trigger on_auth_user_created_plan_access
after insert on auth.users
for each row execute function public.handle_new_user_plan_access();

commit;
