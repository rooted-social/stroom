begin;

alter table public.review_daily_overrides
  add column if not exists currency text not null default 'KRW';

alter table public.review_daily_overrides
  drop constraint if exists review_daily_overrides_currency_check;

alter table public.review_daily_overrides
  add constraint review_daily_overrides_currency_check
  check (currency in ('KRW', 'USD'));

update public.review_daily_overrides
set currency = 'KRW'
where currency is null or currency not in ('KRW', 'USD');

commit;
