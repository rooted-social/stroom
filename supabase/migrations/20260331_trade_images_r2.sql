begin;

create table if not exists public.trade_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  owner_type text not null check (owner_type in ('scenario', 'tradeJournal')),
  owner_id uuid not null references public.trades(id) on delete cascade,
  object_key_full text not null,
  object_key_thumb text not null,
  url_full text not null,
  url_thumb text not null,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists idx_trade_images_owner_sort
  on public.trade_images(owner_id, owner_type, sort_order);

create index if not exists idx_trade_images_user_created
  on public.trade_images(user_id, created_at desc);

alter table public.trade_images enable row level security;

drop policy if exists "trade_images_select_own" on public.trade_images;
create policy "trade_images_select_own"
on public.trade_images
for select
using (auth.uid() = user_id);

drop policy if exists "trade_images_insert_own" on public.trade_images;
create policy "trade_images_insert_own"
on public.trade_images
for insert
with check (auth.uid() = user_id);

drop policy if exists "trade_images_update_own" on public.trade_images;
create policy "trade_images_update_own"
on public.trade_images
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "trade_images_delete_own" on public.trade_images;
create policy "trade_images_delete_own"
on public.trade_images
for delete
using (auth.uid() = user_id);

commit;
