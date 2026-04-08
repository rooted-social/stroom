import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TradeRecord } from "@/types/trade";
import { getReturnRateFromTrade } from "@/utils/trade-metrics";

const TRADE_DASHBOARD_SELECT_FIELDS = [
  "id",
  "symbol",
  "mode",
  "status",
  "trade_date",
  "position",
  "leverage",
  "entry_price",
  "exit_price",
  "pnl_rate",
  "plan",
  "result",
  "review",
  "created_at",
  "updated_at",
].join(", ");

type OverrideRow = {
  profit_amount: number | null;
  loss_amount: number | null;
  currency: string | null;
};

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatMoney(value: number, currency: "KRW" | "USD") {
  const symbol = currency === "KRW" ? "₩" : "$";
  const locale = currency === "KRW" ? "ko-KR" : "en-US";
  const digits = currency === "KRW" ? 0 : 2;
  return `${symbol}${Math.abs(value).toLocaleString(locale, { maximumFractionDigits: digits })}`;
}

function formatDateLabel(isoText: string) {
  return new Date(isoText).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

function getMonthKey(dateText: string) {
  return dateText.slice(0, 7);
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [tradesResponse, overridesResponse] = await Promise.all([
    supabase
      .from("trades")
      .select(TRADE_DASHBOARD_SELECT_FIELDS)
      .order("updated_at", { ascending: false }),
    supabase
      .from("review_daily_overrides")
      .select("profit_amount, loss_amount, currency"),
  ]);

  const trades = (tradesResponse.data ?? []) as unknown as TradeRecord[];
  const overrides = (overridesResponse.data ?? []) as OverrideRow[];

  const totalTradeCount = trades.length;
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyTradeCount = trades.filter((trade) => {
    const baseDate = trade.trade_date ?? trade.created_at.slice(0, 10);
    return getMonthKey(baseDate) === currentMonthKey;
  }).length;
  const closedTrades = trades.filter((trade) => trade.status === "closed");
  const closedRates = closedTrades
    .map((trade) => ({ trade, rate: getReturnRateFromTrade(trade) }))
    .filter((item): item is { trade: TradeRecord; rate: number } => item.rate !== null);

  const winCount = closedRates.filter((item) => item.rate > 0).length;
  const lossCount = closedRates.filter((item) => item.rate < 0).length;
  const winRate = closedRates.length === 0 ? 0 : (winCount / closedRates.length) * 100;
  const averagePnl =
    closedRates.length === 0
      ? 0
      : closedRates.reduce((acc, current) => acc + current.rate, 0) / closedRates.length;
  const longClosedRates = closedRates.filter((item) => item.trade.position === "LONG");
  const shortClosedRates = closedRates.filter((item) => item.trade.position === "SHORT");
  const longWinCount = longClosedRates.filter((item) => item.rate > 0).length;
  const shortWinCount = shortClosedRates.filter((item) => item.rate > 0).length;
  const longWinRate = longClosedRates.length === 0 ? 0 : (longWinCount / longClosedRates.length) * 100;
  const shortWinRate = shortClosedRates.length === 0 ? 0 : (shortWinCount / shortClosedRates.length) * 100;
  const insightUserName = "회원";
  const preferredPosition =
    longClosedRates.length === 0 && shortClosedRates.length === 0
      ? null
      : longWinRate === shortWinRate
        ? longClosedRates.length >= shortClosedRates.length
          ? "LONG"
          : "SHORT"
        : longWinRate > shortWinRate
          ? "LONG"
          : "SHORT";
  const insightMessage =
    preferredPosition === null
      ? `${insightUserName}님은 아직 LONG/SHORT 비교를 위한 종료 포지션 데이터가 부족합니다.`
      : `${insightUserName}님은 ${preferredPosition} 포지션의 매매 승률이 높은 것으로 분석됩니다. (LONG ${longWinRate.toFixed(
          1,
        )}% · SHORT ${shortWinRate.toFixed(1)}%)`;
  const insightToneClass =
    "border-zinc-200/90 bg-gradient-to-r from-zinc-100 to-zinc-100/70 text-zinc-800 dark:border-slate-700/70 dark:bg-slate-900/85 dark:text-slate-700";

  const recentRates = closedRates.slice(0, 8).reverse();
  const maxAbsRate = Math.max(...recentRates.map((item) => Math.abs(item.rate)), 1);

  const currencyNet = overrides.reduce(
    (acc, row) => {
      const currency = row.currency === "USD" ? "USD" : "KRW";
      const profit = Number(row.profit_amount ?? 0);
      const loss = Number(row.loss_amount ?? 0);
      acc[currency] += profit - loss;
      return acc;
    },
    { KRW: 0, USD: 0 } as Record<"KRW" | "USD", number>,
  );

  const symbolMap = new Map<
    string,
    { tradeCount: number; longCount: number; shortCount: number }
  >();

  trades.forEach((trade) => {
    const symbol = trade.symbol?.trim().toUpperCase() || "N/A";
    const current = symbolMap.get(symbol) ?? {
      tradeCount: 0,
      longCount: 0,
      shortCount: 0,
    };
    current.tradeCount += 1;
    if (trade.position === "LONG") {
      current.longCount += 1;
    }
    if (trade.position === "SHORT") {
      current.shortCount += 1;
    }
    symbolMap.set(symbol, current);
  });

  const topSymbols = Array.from(symbolMap.entries())
    .map(([symbol, value]) => ({
      symbol,
      tradeCount: value.tradeCount,
      longCount: value.longCount,
      shortCount: value.shortCount,
    }))
    .sort((a, b) => b.tradeCount - a.tradeCount)
    .slice(0, 4);

  const recentTrades = [...trades]
    .sort((a, b) => {
      const aBaseDate = a.trade_date ?? a.created_at.slice(0, 10);
      const bBaseDate = b.trade_date ?? b.created_at.slice(0, 10);
      if (aBaseDate !== bBaseDate) {
        return bBaseDate.localeCompare(aBaseDate);
      }
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 8)
    .map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      mode: trade.mode,
      status: trade.status,
      position: trade.position ?? "-",
      date: trade.trade_date ?? trade.created_at,
      rate: getReturnRateFromTrade(trade),
    }));

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">DASHBOARD</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              트레이딩 인사이트
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              핵심 성과와 매매 흐름을 한 눈에 확인하세요.
            </p>
          </div>
        </div>
      </header>

      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_58%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.16),transparent_62%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-zinc-500 dark:text-zinc-300">
            <span className="relative inline-flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400/70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-sky-500 dark:bg-sky-400" />
            </span>
            LIVE POSITION INSIGHT
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-300">
            종료 포지션 분석 · LONG {longClosedRates.length}건 / SHORT {shortClosedRates.length}건
          </p>
        </div>
        <div className={`relative mt-2 overflow-hidden rounded-xl border px-3 py-2 ${insightToneClass}`}>
          <p className="text-sm font-semibold tracking-tight sm:text-base">
            {insightMessage}
          </p>
        </div>
      </article>

      <div className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-[#0d1014]">
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">TOTAL PROFIT / LOSS</p>
          <div className="mt-3 grid gap-2">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">KRW</p>
              <p
                className={`flex items-center gap-1 text-lg font-semibold tracking-tight tabular-nums ${
                  currencyNet.KRW >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <span className="inline-block w-4 text-center">{currencyNet.KRW >= 0 ? "+" : "-"}</span>
                <span>{formatMoney(currencyNet.KRW, "KRW")}</span>
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500">USD</p>
              <p
                className={`flex items-center gap-1 text-lg font-semibold tracking-tight tabular-nums ${
                  currencyNet.USD >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <span className="inline-block w-4 text-center">{currencyNet.USD >= 0 ? "+" : "-"}</span>
                <span>{formatMoney(currencyNet.USD, "USD")}</span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid h-16 grid-cols-8 items-end gap-1">
            {recentRates.map((item) => (
              <div
                key={item.trade.id}
                className={`group relative rounded-sm transition-all duration-500 ${
                  item.rate >= 0
                    ? "bg-emerald-400/60 dark:bg-emerald-500/50"
                    : "bg-rose-400/60 dark:bg-rose-500/50"
                }`}
                title={`${formatDateLabel(item.trade.trade_date ?? item.trade.created_at)} · ${item.trade.symbol} ${item.trade.position ?? ""} · ${formatPercent(item.rate)}`}
                style={{ height: `${20 + (Math.abs(item.rate) / maxAbsRate) * 40}%` }}
              >
                <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 hidden w-max -translate-x-1/2 rounded-md border border-zinc-200 bg-white/95 px-2 py-1 text-[10px] font-medium text-zinc-700 shadow-md backdrop-blur-sm group-hover:block dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-200">
                  {formatDateLabel(item.trade.trade_date ?? item.trade.created_at)} · {item.trade.symbol}{" "}
                  {item.trade.position ?? "-"} · {formatPercent(item.rate)}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-[#0d1014]">
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">WIN RATE & P&L</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div
              className="grid size-24 place-items-center rounded-full"
              style={{
                background: `conic-gradient(rgb(16 185 129) ${winRate * 3.6}deg, rgb(113 113 122 / 0.25) ${winRate * 3.6}deg)`,
              }}
            >
              <div className="grid size-[86px] place-items-center rounded-full bg-white text-zinc-900 dark:bg-[#0d1014] dark:text-zinc-100">
                <span className="text-xl font-semibold">{winRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">평균 P&L</p>
              <p
                className={`text-xl font-semibold ${
                  averagePnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatPercent(averagePnl)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                익절 {winCount} / 손절 {lossCount}
              </p>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2.5 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-[10px] text-zinc-500">WIN</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{winCount}회</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2.5 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-[10px] text-zinc-500">LOSS</p>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{lossCount}회</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-[#0d1014]">
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">TRADE FREQUENCY</p>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">총 매매 횟수</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalTradeCount}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#8FA9C4] to-[#6F8EAF] transition-all duration-700"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">전체 기준선</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">이번 달 매매 횟수</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{monthlyTradeCount}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#A5B4C7] to-[#7C91AB] transition-all duration-700"
                  style={{
                    width: `${totalTradeCount === 0 ? 0 : (monthlyTradeCount / totalTradeCount) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-[11px] text-zinc-500">
                전체 대비 이번 달 활동 비중{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {totalTradeCount === 0 ? "0.0" : ((monthlyTradeCount / totalTradeCount) * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">최근 매매 흐름</h2>
            <Link href="/trades" className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              View
            </Link>
          </div>
          <div className="space-y-2">
            {recentTrades.length === 0 ? (
              <p className="text-sm text-zinc-500">아직 기록된 매매가 없습니다.</p>
            ) : (
              recentTrades.map((trade) => (
                (() => {
                  const isOngoingScenario = trade.mode === "pre" && trade.status === "open";
                  return (
                <div
                  key={trade.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {trade.symbol} {trade.position}
                      </p>
                      <p className="text-[11px] text-zinc-500">{formatDateLabel(trade.date)}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        isOngoingScenario
                          ? "text-sky-600 dark:text-sky-400"
                          : (trade.rate ?? 0) >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isOngoingScenario
                        ? "시나리오 진행 중"
                        : trade.rate === null
                          ? "-"
                          : formatPercent(trade.rate)}
                    </p>
                  </div>
                </div>
                  );
                })()
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">주요 종목 및 포지션</h2>
            <p className="text-[11px] text-zinc-500">TOP {topSymbols.length || 0}</p>
          </div>
          <div className="space-y-2">
            {topSymbols.length === 0 ? (
              <p className="text-sm text-zinc-500">표시할 종목 데이터가 없습니다.</p>
            ) : (
              topSymbols.map((item, index) => (
                <div
                  key={item.symbol}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                      >
                        {index + 1}
                      </span>
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-[1.1fr_1fr] gap-2">
                    <div className="grid place-items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center dark:border-zinc-700 dark:bg-zinc-950/70">
                      <p className="text-[10px] text-zinc-500">총 진입 횟수</p>
                      <p className="mt-0.5 text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-100">{item.tradeCount}회</p>
                    </div>
                    <div className="grid grid-rows-2 gap-1.5">
                      <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-950/70">
                        <p className="text-[10px] text-zinc-500">Long</p>
                        <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.longCount}회</p>
                      </div>
                      <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-950/70">
                        <p className="text-[10px] text-zinc-500">Short</p>
                        <p className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.shortCount}회</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

    </section>
  );
}
