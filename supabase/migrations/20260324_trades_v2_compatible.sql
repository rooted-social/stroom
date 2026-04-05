-- Trades V2 compatible migration
-- Goal:
-- 1) Keep existing prototype data
-- 2) Add explicit columns for current form fields
-- 3) Auto-sync new columns from legacy `plan` meta payload
-- 4) Store leverage-applied pnl_rate for reporting/queries

begin;

-- 1) New explicit columns (non-breaking)
alter table public.trades
  add column if not exists trade_date date,
  add column if not exists holding_time text,
  add column if not exists position text check (position in ('LONG', 'SHORT')),
  add column if not exists leverage numeric(6,2) check (leverage >= 1 and leverage <= 100),
  add column if not exists entry_price numeric(18,6),
  add column if not exists exit_price numeric(18,6),
  add column if not exists stop_loss numeric(18,6),
  add column if not exists pnl_rate numeric(12,6);

-- 2) Helper: robust numeric parser (handles commas, %, x, spaces)
create or replace function public.to_numeric_safe(p_text text)
returns numeric
language plpgsql
immutable
as $$
declare
  normalized text;
begin
  normalized := regexp_replace(coalesce(p_text, ''), '[^0-9\.\-]', '', 'g');

  if normalized is null or normalized = '' or normalized = '-' or normalized = '.' then
    return null;
  end if;

  begin
    return normalized::numeric;
  exception
    when others then
      return null;
  end;
end;
$$;

-- 3) Trigger function: sync v2 columns from legacy `plan` payload
-- Legacy format example:
-- STROOM_META::{"tradeDate":"2026-03-24","holdingTime":"2시간","position":"LONG","leverage":"5","entryPrice":"5000","exitPrice":"5500","stopPrice":"4900"}
create or replace function public.sync_trade_columns_from_plan()
returns trigger
language plpgsql
as $$
declare
  meta jsonb;
  leverage_text text;
  effective_leverage numeric;
  base_return numeric;
begin
  -- Default fallback for date
  if new.trade_date is null and new.created_at is not null then
    new.trade_date := (new.created_at at time zone 'utc')::date;
  end if;

  if new.plan is not null and new.plan like 'STROOM_META::%' then
    begin
      meta := regexp_replace(new.plan, '^STROOM_META::', '')::jsonb;
    exception
      when others then
        meta := null;
    end;

    if meta is not null then
      if (meta ? 'tradeDate') and coalesce(meta->>'tradeDate', '') <> '' then
        begin
          new.trade_date := (meta->>'tradeDate')::date;
        exception
          when others then
            null;
        end;
      end if;

      if (meta ? 'holdingTime') and coalesce(meta->>'holdingTime', '') <> '' then
        new.holding_time := meta->>'holdingTime';
      end if;

      if (meta ? 'position') then
        if upper(meta->>'position') in ('LONG', 'SHORT') then
          new.position := upper(meta->>'position');
        end if;
      end if;

      leverage_text := coalesce(meta->>'leverage', meta->>'riskLeverage', '');
      if leverage_text <> '' then
        new.leverage := public.to_numeric_safe(leverage_text);
      end if;

      if (meta ? 'entryPrice') then
        new.entry_price := public.to_numeric_safe(meta->>'entryPrice');
      end if;

      if (meta ? 'exitPrice') then
        new.exit_price := public.to_numeric_safe(meta->>'exitPrice');
      end if;

      if (meta ? 'stopPrice') then
        new.stop_loss := public.to_numeric_safe(meta->>'stopPrice');
      end if;
    end if;
  end if;

  -- Compute leverage-applied pnl_rate when possible
  effective_leverage := coalesce(new.leverage, 1);

  if new.position in ('LONG', 'SHORT')
     and new.entry_price is not null
     and new.exit_price is not null
     and new.entry_price <> 0
  then
    if new.position = 'LONG' then
      base_return := ((new.exit_price - new.entry_price) / new.entry_price) * 100;
    else
      base_return := ((new.entry_price - new.exit_price) / new.entry_price) * 100;
    end if;

    new.pnl_rate := round(base_return * effective_leverage, 6);
  elsif new.result is not null then
    -- Fallback from old result text (e.g. "+12.34%")
    new.pnl_rate := public.to_numeric_safe(new.result);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_trade_columns_from_plan_trigger on public.trades;
create trigger sync_trade_columns_from_plan_trigger
before insert or update on public.trades
for each row execute function public.sync_trade_columns_from_plan();

-- 4) Backfill existing rows once
update public.trades
set
  trade_date = coalesce(trade_date, (created_at at time zone 'utc')::date),
  updated_at = updated_at
where true;

-- Force trigger execution for existing records
update public.trades
set
  plan = plan,
  updated_at = updated_at
where plan like 'STROOM_META::%';

-- 5) Helpful indexes for upcoming filtering/sorting
create index if not exists idx_trades_user_trade_date on public.trades(user_id, trade_date desc);
create index if not exists idx_trades_user_status on public.trades(user_id, status);
create index if not exists idx_trades_user_mode on public.trades(user_id, mode);

commit;

