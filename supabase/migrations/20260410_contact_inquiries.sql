begin;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (position('@' in email) > 1),
  phone text check (phone is null or char_length(phone) <= 30),
  inquiry_topics text[] not null check (
    array_length(inquiry_topics, 1) >= 1
    and inquiry_topics <@ array['feature', 'pricing', 'partnership']::text[]
  ),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_contact_inquiries_created_at
  on public.contact_inquiries (created_at desc);

create index if not exists idx_contact_inquiries_email
  on public.contact_inquiries (email);

alter table public.contact_inquiries enable row level security;

drop policy if exists "contact_inquiries_insert_public" on public.contact_inquiries;
create policy "contact_inquiries_insert_public"
on public.contact_inquiries
for insert
to anon, authenticated
with check (
  (user_id is null and auth.uid() is null)
  or auth.uid() = user_id
);

commit;
