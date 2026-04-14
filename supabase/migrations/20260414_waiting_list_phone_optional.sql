begin;

alter table public.waiting_list
  alter column phone drop not null;

alter table public.waiting_list
  drop constraint if exists waiting_list_phone_check;

alter table public.waiting_list
  add constraint waiting_list_phone_check
  check (phone is null or char_length(phone) <= 30);

commit;
