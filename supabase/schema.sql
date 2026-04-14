create extension if not exists pgcrypto;

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('pre', 'post')),
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  title text not null,
  symbol text not null,
  reasons_entry text,
  reasons_exit text,
  scenario_checklist text,
  memo_additional text,
  plan text,
  result text,
  review text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_trades_updated_at on public.trades;
create trigger set_trades_updated_at
before update on public.trades
for each row execute function public.set_updated_at();

alter table public.trades enable row level security;

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
on public.trades
for select
using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
on public.trades
for insert
with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
on public.trades
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
on public.trades
for delete
using (auth.uid() = user_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (username ~ '^[a-z0-9_]{4,20}$')
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_username text;
begin
  resolved_username := coalesce(
    lower(new.raw_user_meta_data ->> 'username'),
    'user_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, username, full_name, email)
  values (
    new.id,
    resolved_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', '사용자'),
    new.email
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where username = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;

create table if not exists public.review_daily_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_date date not null,
  profit_amount numeric(18,2) not null default 0 check (profit_amount >= 0),
  loss_amount numeric(18,2) not null default 0 check (loss_amount >= 0),
  currency text not null default 'KRW' check (currency in ('KRW', 'USD')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, review_date)
);

drop trigger if exists set_review_daily_overrides_updated_at on public.review_daily_overrides;
create trigger set_review_daily_overrides_updated_at
before update on public.review_daily_overrides
for each row execute function public.set_updated_at();

alter table public.review_daily_overrides enable row level security;

drop policy if exists "review_daily_overrides_select_own" on public.review_daily_overrides;
create policy "review_daily_overrides_select_own"
on public.review_daily_overrides
for select
using (auth.uid() = user_id);

drop policy if exists "review_daily_overrides_insert_own" on public.review_daily_overrides;
create policy "review_daily_overrides_insert_own"
on public.review_daily_overrides
for insert
with check (auth.uid() = user_id);

drop policy if exists "review_daily_overrides_update_own" on public.review_daily_overrides;
create policy "review_daily_overrides_update_own"
on public.review_daily_overrides
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "review_daily_overrides_delete_own" on public.review_daily_overrides;
create policy "review_daily_overrides_delete_own"
on public.review_daily_overrides
for delete
using (auth.uid() = user_id);

create index if not exists idx_review_daily_overrides_user_date
  on public.review_daily_overrides(user_id, review_date desc);

create table if not exists public.user_journal_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_mode text not null default 'pre' check (default_mode in ('pre', 'post')),
  default_position text not null default 'LONG' check (default_position in ('LONG', 'SHORT')),
  default_leverage numeric(6,2) not null default 1 check (default_leverage >= 1 and default_leverage <= 100),
  default_holding_time text,
  major_symbols text[] not null default '{}',
  scenario_checklists text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_user_journal_settings_updated_at on public.user_journal_settings;
create trigger set_user_journal_settings_updated_at
before update on public.user_journal_settings
for each row execute function public.set_updated_at();

alter table public.user_journal_settings enable row level security;

drop policy if exists "user_journal_settings_select_own" on public.user_journal_settings;
create policy "user_journal_settings_select_own"
on public.user_journal_settings
for select
using (auth.uid() = user_id);

drop policy if exists "user_journal_settings_insert_own" on public.user_journal_settings;
create policy "user_journal_settings_insert_own"
on public.user_journal_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_journal_settings_update_own" on public.user_journal_settings;
create policy "user_journal_settings_update_own"
on public.user_journal_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_user_journal_settings_user_id
  on public.user_journal_settings(user_id);

create table if not exists public.waiting_list (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  phone text check (phone is null or char_length(phone) <= 30),
  email text not null check (position('@' in email) > 1),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_waiting_list_created_at
  on public.waiting_list (created_at desc);

create index if not exists idx_waiting_list_email
  on public.waiting_list (email);

alter table public.waiting_list enable row level security;

drop policy if exists "waiting_list_insert_public" on public.waiting_list;
create policy "waiting_list_insert_public"
on public.waiting_list
for insert
to anon, authenticated
with check (true);
