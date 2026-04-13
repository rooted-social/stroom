begin;

create table if not exists public.waiting_list (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  phone text not null check (char_length(phone) between 1 and 30),
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

commit;
