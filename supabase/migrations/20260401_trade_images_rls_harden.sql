begin;

alter table public.trade_images enable row level security;

drop policy if exists "trade_images_select_own" on public.trade_images;
drop policy if exists "trade_images_insert_own" on public.trade_images;
drop policy if exists "trade_images_update_own" on public.trade_images;
drop policy if exists "trade_images_delete_own" on public.trade_images;

create policy "trade_images_select_own"
on public.trade_images
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.trades t
    where t.id = owner_id
      and t.user_id = auth.uid()
  )
);

create policy "trade_images_insert_own"
on public.trade_images
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.trades t
    where t.id = owner_id
      and t.user_id = auth.uid()
  )
);

create policy "trade_images_update_own"
on public.trade_images
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.trades t
    where t.id = owner_id
      and t.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.trades t
    where t.id = owner_id
      and t.user_id = auth.uid()
  )
);

create policy "trade_images_delete_own"
on public.trade_images
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.trades t
    where t.id = owner_id
      and t.user_id = auth.uid()
  )
);

commit;
