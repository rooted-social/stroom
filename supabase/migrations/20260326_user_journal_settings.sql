begin;

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

commit;
