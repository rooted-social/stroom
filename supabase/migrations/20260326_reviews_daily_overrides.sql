begin;

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

commit;
