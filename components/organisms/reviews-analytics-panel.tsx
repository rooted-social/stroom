"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  type ReviewCurrency,
  type ReviewDailyOverride,
  type ReviewSymbolStat,
} from "@/types/review";
import { type TradeRecord } from "@/types/trade";
import { getReturnRateFromTrade } from "@/utils/trade-metrics";

type ReviewsAnalyticsPanelProps = {
  trades: TradeRecord[];
  dailyOverrides: ReviewDailyOverride[];
  initialMonth: string;
};

type CalendarMetric = {
  tradeCount: number;
  averageReturn: number | null;
  ongoingScenarioCount: number;
};

type DailyOverrideMap = Record<string, ReviewDailyOverride>;

type MonthOption = {
  value: string;
  label: string;
};

type PerformanceSummary = {
  entryCount: number;
  evaluatedCount: number;
  winRate: number | null;
  averageReturn: number | null;
};

const currencyMeta: Record<ReviewCurrency, { symbol: string; locale: string }> = {
  KRW: { symbol: "₩", locale: "ko-KR" },
  USD: { symbol: "$", locale: "en-US" },
};

function toDateKey(dateInput: string | null, fallbackIso: string) {
  if (dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  return fallbackIso.slice(0, 10);
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}년 ${month}월`;
}

function formatMonthBadge(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}.${String(month).padStart(2, "0")}`;
}

function formatRate(rate: number | null) {
  if (rate === null) {
    return "-";
  }

  return `${rate >= 0 ? "+" : ""}${rate.toFixed(1)}%`;
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(1)}%`;
}

function formatAmount(value: number, currency: ReviewCurrency) {
  const meta = currencyMeta[currency];
  const fractionDigits = currency === "KRW" ? 0 : 2;
  return `${meta.symbol}${value.toLocaleString(meta.locale, {
    maximumFractionDigits: fractionDigits,
  })}`;
}

function getCellToneClass(rate: number | null) {
  if (rate === null) {
    return "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400";
  }

  if (rate >= 0) {
    return "border-emerald-300 bg-emerald-100/80 text-zinc-800 dark:border-emerald-500/60 dark:bg-emerald-500/20 dark:text-zinc-100";
  }

  return "border-rose-300 bg-rose-100/80 text-zinc-800 dark:border-rose-500/60 dark:bg-rose-500/20 dark:text-zinc-100";
}

function formatNetAmount(override: ReviewDailyOverride | undefined) {
  if (!override) {
    return "-";
  }

  const net = override.profit_amount - override.loss_amount;
  if (net === 0) {
    return formatAmount(0, override.currency);
  }
  return `${net > 0 ? "+" : "-"}${formatAmount(Math.abs(net), override.currency)}`;
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function calculatePerformanceSummary(
  trades: TradeRecord[],
  predicate: (trade: TradeRecord, dateKey: string) => boolean,
): PerformanceSummary {
  let entryCount = 0;
  let evaluatedCount = 0;
  let winCount = 0;
  let totalReturn = 0;

  trades.forEach((trade) => {
    const dateKey = toDateKey(trade.trade_date, trade.created_at);
    if (!predicate(trade, dateKey)) {
      return;
    }

    entryCount += 1;
    const rate = getReturnRateFromTrade(trade);
    if (rate === null) {
      return;
    }

    evaluatedCount += 1;
    if (rate > 0) {
      winCount += 1;
    }
    totalReturn += rate;
  });

  return {
    entryCount,
    evaluatedCount,
    winRate: evaluatedCount > 0 ? (winCount / evaluatedCount) * 100 : null,
    averageReturn: evaluatedCount > 0 ? totalReturn / evaluatedCount : null,
  };
}

async function saveDailyOverride(input: {
  date: string;
  profitAmount: number;
  lossAmount: number;
  currency: ReviewCurrency;
}) {
  const response = await fetch("/api/reviews/daily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ReviewDailyOverride & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "저장 실패");
  }

  return payload;
}

async function removeDailyOverride(date: string) {
  const response = await fetch("/api/reviews/daily", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });

  const payload = (await response.json()) as { review_date?: string; message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "삭제 실패");
  }

  return payload.review_date ?? date;
}

export function ReviewsAnalyticsPanel({
  trades,
  dailyOverrides,
  initialMonth,
}: ReviewsAnalyticsPanelProps) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [activeDate, setActiveDate] = useState<string>("");
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profitAmount, setProfitAmount] = useState("0");
  const [lossAmount, setLossAmount] = useState("0");
  const [currency, setCurrency] = useState<ReviewCurrency>("KRW");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalNotice, setModalNotice] = useState("");
  const [overrideMap, setOverrideMap] = useState<DailyOverrideMap>(() =>
    Object.fromEntries(dailyOverrides.map((entry) => [entry.review_date, entry])),
  );

  const monthOptions = useMemo<MonthOption[]>(() => {
    const monthSet = new Set<string>();
    monthSet.add(initialMonth);

    trades.forEach((trade) => {
      const key = toDateKey(trade.trade_date, trade.created_at).slice(0, 7);
      monthSet.add(key);
    });

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((value) => ({
        value,
        label: formatMonthLabel(value),
      }));
  }, [initialMonth, trades]);

  const monthMetrics = useMemo(() => {
    const map = new Map<
      string,
      { returns: number[]; tradeCount: number; ongoingScenarioCount: number }
    >();

    trades.forEach((trade) => {
      const dateKey = toDateKey(trade.trade_date, trade.created_at);
      const monthKey = dateKey.slice(0, 7);
      if (monthKey !== selectedMonth) {
        return;
      }

      const current = map.get(dateKey) ?? {
        returns: [],
        tradeCount: 0,
        ongoingScenarioCount: 0,
      };
      current.tradeCount += 1;

      const isOngoingScenario = trade.mode === "pre" && trade.status === "open";
      if (isOngoingScenario) {
        current.ongoingScenarioCount += 1;
        map.set(dateKey, current);
        return;
      }

      const rate = getReturnRateFromTrade(trade);
      if (rate !== null) {
        current.returns.push(rate);
      }

      map.set(dateKey, current);
    });

    const result = new Map<string, CalendarMetric>();
    map.forEach((value, key) => {
      if (value.returns.length === 0) {
        result.set(key, {
          tradeCount: value.tradeCount,
          averageReturn: null,
          ongoingScenarioCount: value.ongoingScenarioCount,
        });
        return;
      }

      const average =
        value.returns.reduce((acc, current) => acc + current, 0) / value.returns.length;
      result.set(key, {
        tradeCount: value.tradeCount,
        averageReturn: average,
        ongoingScenarioCount: value.ongoingScenarioCount,
      });
    });

    return result;
  }, [selectedMonth, trades]);

  const symbolStats = useMemo<ReviewSymbolStat[]>(() => {
    const grouped = new Map<string, number[]>();

    trades.forEach((trade) => {
      const rate = getReturnRateFromTrade(trade);
      if (rate === null) {
        return;
      }

      const symbol = trade.symbol?.trim().toUpperCase() || "N/A";
      const current = grouped.get(symbol) ?? [];
      current.push(rate);
      grouped.set(symbol, current);
    });

    return Array.from(grouped.entries())
      .map(([symbol, rates]) => {
        const winCount = rates.filter((rate) => rate > 0).length;
        return {
          symbol,
          tradeCount: rates.length,
          winRate: rates.length === 0 ? 0 : (winCount / rates.length) * 100,
          averageReturn: rates.reduce((acc, current) => acc + current, 0) / rates.length,
        };
      })
      .sort((a, b) => {
        if (a.tradeCount !== b.tradeCount) {
          return b.tradeCount - a.tradeCount;
        }

        return Math.abs(b.averageReturn) - Math.abs(a.averageReturn);
      })
      .slice(0, 5);
  }, [trades]);

  const focusedStats = useMemo(() => {
    const totalCount = symbolStats.reduce((acc, current) => acc + current.tradeCount, 0);
    if (totalCount === 0) {
      return [];
    }

    return symbolStats.slice(0, 3).map((item) => ({
      ...item,
      participation: (item.tradeCount / totalCount) * 100,
    }));
  }, [symbolStats]);

  const selectedMonthSummary = useMemo(() => {
    const summaryMap = new Map<ReviewCurrency, number>();
    Object.values(overrideMap).forEach((entry) => {
      if (!entry.review_date.startsWith(selectedMonth)) {
        return;
      }
      const current = summaryMap.get(entry.currency) ?? 0;
      summaryMap.set(entry.currency, current + (entry.profit_amount - entry.loss_amount));
    });

    return (["KRW", "USD"] as const)
      .map((currencyType) => ({
        currency: currencyType,
        amount: summaryMap.get(currencyType) ?? 0,
      }))
      .filter((entry) => entry.amount !== 0 || summaryMap.has(entry.currency));
  }, [overrideMap, selectedMonth]);

  const recent7DaysSummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    const startKey = toLocalDateKey(startDate);
    const endKey = toLocalDateKey(today);

    const summaryMap = new Map<ReviewCurrency, number>();
    Object.values(overrideMap).forEach((entry) => {
      if (entry.review_date < startKey || entry.review_date > endKey) {
        return;
      }
      const current = summaryMap.get(entry.currency) ?? 0;
      summaryMap.set(entry.currency, current + (entry.profit_amount - entry.loss_amount));
    });

    return (["KRW", "USD"] as const)
      .map((currencyType) => ({
        currency: currencyType,
        amount: summaryMap.get(currencyType) ?? 0,
      }))
      .filter((entry) => entry.amount !== 0 || summaryMap.has(entry.currency));
  }, [overrideMap]);

  const selectedMonthPerformance = useMemo(
    () =>
      calculatePerformanceSummary(
        trades,
        (_trade, dateKey) => dateKey.slice(0, 7) === selectedMonth,
      ),
    [selectedMonth, trades],
  );

  const recent7DaysPerformance = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);

    const startKey = toLocalDateKey(startDate);
    const endKey = toLocalDateKey(today);
    const summary = calculatePerformanceSummary(
      trades,
      (_trade, dateKey) => dateKey >= startKey && dateKey <= endKey,
    );

    return {
      startKey,
      endKey,
      summary,
    };
  }, [trades]);

  const selectedMonthIndex = useMemo(
    () => monthOptions.findIndex((option) => option.value === selectedMonth),
    [monthOptions, selectedMonth],
  );
  const prevMonthOption = selectedMonthIndex >= 0 ? monthOptions[selectedMonthIndex + 1] : undefined;
  const nextMonthOption = selectedMonthIndex > 0 ? monthOptions[selectedMonthIndex - 1] : undefined;

  const calendarCells = useMemo(() => {
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
    const firstDayOfMonth = new Date(yearValue, monthValue - 1, 1);
    const lastDay = new Date(yearValue, monthValue, 0).getDate();
    const leadingBlankCount = firstDayOfMonth.getDay();

    const cells: Array<{ type: "blank" } | { type: "day"; dateKey: string }> = [];
    for (let index = 0; index < leadingBlankCount; index += 1) {
      cells.push({ type: "blank" });
    }

    for (let day = 1; day <= lastDay; day += 1) {
      const date = new Date(yearValue, monthValue - 1, day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;
      cells.push({ type: "day", dateKey });
    }

    return cells;
  }, [selectedMonth]);

  const modalTrades = useMemo(() => {
    if (!modalDate) {
      return [];
    }

    return trades
      .filter((trade) => toDateKey(trade.trade_date, trade.created_at) === modalDate)
      .map((trade) => ({
        id: trade.id,
        symbol: trade.symbol,
        position: trade.position ?? "-",
        status: trade.status,
        rate: getReturnRateFromTrade(trade),
      }));
  }, [modalDate, trades]);
  const modalOverride = modalDate ? overrideMap[modalDate] : undefined;
  const modalNetAmount = modalOverride ? modalOverride.profit_amount - modalOverride.loss_amount : null;

  useEffect(() => {
    const firstDay = calendarCells.find((cell) => cell.type === "day");
    if (!firstDay || firstDay.type !== "day") {
      setActiveDate("");
      return;
    }

    setActiveDate((prev) => (prev && prev.startsWith(selectedMonth) ? prev : firstDay.dateKey));
  }, [calendarCells, selectedMonth]);

  useEffect(() => {
    if (!modalDate) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalDate(null);
        setModalNotice("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalDate]);

  function openModal(dateKey: string) {
    const current = overrideMap[dateKey];
    setActiveDate(dateKey);
    setModalDate(dateKey);
    setProfitAmount(String(current?.profit_amount ?? 0));
    setLossAmount(String(current?.loss_amount ?? 0));
    setCurrency(current?.currency ?? "KRW");
    setIsEditMode(false);
    setModalNotice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modalDate) {
      return;
    }

    setIsSaving(true);
    setModalNotice("");

    try {
      const saved = await saveDailyOverride({
        date: modalDate,
        profitAmount: Number(profitAmount),
        lossAmount: Number(lossAmount),
        currency,
      });

      setOverrideMap((prev) => ({ ...prev, [saved.review_date]: saved }));
      setModalNotice("저장되었습니다.");
    } catch (error) {
      setModalNotice(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!modalDate) {
      return;
    }

    setIsDeleting(true);
    setModalNotice("");
    try {
      const removedDate = await removeDailyOverride(modalDate);
      setOverrideMap((prev) => {
        const next = { ...prev };
        delete next[removedDate];
        return next;
      });
      setProfitAmount("0");
      setLossAmount("0");
      setCurrency("KRW");
      setModalNotice("삭제되었습니다.");
    } catch (error) {
      setModalNotice(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
                MONTHLY ACTIVITY HEATMAP
              </p>
              <h2 className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
                성과 캘린더
              </h2>
            </div>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-8 rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-800 outline-none transition focus:border-zinc-500 sm:h-9 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold tracking-wide text-zinc-500 sm:gap-2 sm:text-[11px] dark:text-zinc-500">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell, index) => {
              if (cell.type === "blank") {
                return (
                  <div
                    key={`blank-${index}`}
                    className="h-[60px] rounded-lg border border-transparent sm:h-[88px] sm:rounded-xl"
                  />
                );
              }

              const metrics = monthMetrics.get(cell.dateKey);
              const override = overrideMap[cell.dateKey];
              const isActive = activeDate === cell.dateKey;
              const netAmount = override
                ? override.profit_amount - override.loss_amount
                : null;
              const toneClass = getCellToneClass(netAmount);
              const amountText = formatNetAmount(override);
              const rateText = formatRate(metrics?.averageReturn ?? null);
              const shouldShowOngoingText =
                (metrics?.ongoingScenarioCount ?? 0) > 0 && metrics?.averageReturn === null;
              const isNegativeRate = (metrics?.averageReturn ?? 0) < 0;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => openModal(cell.dateKey)}
                  className={[
                  "group relative h-[60px] cursor-pointer rounded-lg border p-1.5 text-left transition-all duration-200 sm:h-[88px] sm:rounded-xl sm:p-2",
                    "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.6)]",
                    "animate-in fade-in zoom-in-95",
                    toneClass,
                  isActive ? "ring-2 ring-emerald-300/70 dark:ring-emerald-300/60" : "",
                  ].join(" ")}
                >
                  <span className="absolute left-1/2 top-1.5 -translate-x-1/2 text-[11px] font-semibold text-zinc-900 sm:hidden dark:text-zinc-100">
                    {Number(cell.dateKey.slice(-2))}
                  </span>
                  <div className="hidden items-start justify-between sm:flex">
                    <span className="text-[11px] font-semibold text-zinc-900 sm:text-xs dark:text-zinc-100">
                      {Number(cell.dateKey.slice(-2))}
                    </span>
                    <span className="hidden rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] text-zinc-600 sm:inline-block sm:text-[10px] dark:bg-white/10 dark:text-zinc-300/90">
                      {metrics?.tradeCount ?? 0}건
                    </span>
                  </div>
                  <p className="mt-1 hidden truncate text-[12px] font-semibold sm:block sm:text-sm">{amountText}</p>
                  <p
                    className={`mt-0.5 hidden truncate sm:block ${
                      shouldShowOngoingText
                        ? "text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                        : isNegativeRate
                          ? "text-[10px] font-semibold text-rose-600 sm:text-[11px] dark:text-rose-400"
                          : "text-[10px] opacity-90 sm:text-[11px]"
                    }`}
                  >
                    {shouldShowOngoingText ? "진행 중" : rateText}
                  </p>
                  <p
                    className={`absolute inset-x-1 top-1/2 -translate-y-1/2 text-center sm:hidden ${
                      shouldShowOngoingText
                        ? "text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                        : isNegativeRate
                          ? "text-[12px] font-semibold text-rose-600 dark:text-rose-400"
                          : "text-[12px] font-semibold"
                    }`}
                  >
                    {shouldShowOngoingText ? "진행 중" : rateText}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
              지난 7일 성과
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
              {recent7DaysPerformance.startKey} ~ {recent7DaysPerformance.endKey}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">포지션 진입 횟수</p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {recent7DaysPerformance.summary.entryCount}회
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">승률</p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPercent(recent7DaysPerformance.summary.winRate)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">평균 P&amp;L</p>
                <p
                  className={`mt-1 text-base font-semibold ${
                    (recent7DaysPerformance.summary.averageReturn ?? 0) >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatRate(recent7DaysPerformance.summary.averageReturn)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
              {recent7DaysPerformance.summary.evaluatedCount}건의 P&amp;L 기록 기준
            </p>
            <div className="mt-3 space-y-2 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0 xl:block xl:space-y-2">
              {recent7DaysSummary.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">입력된 손익 데이터가 없습니다.</p>
              ) : (
                recent7DaysSummary.map((entry) => (
                  <div
                    key={entry.currency}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{entry.currency}</p>
                    <p
                      className={`text-lg font-semibold ${
                        entry.amount >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {entry.amount >= 0 ? "+" : "-"}
                      {formatAmount(Math.abs(entry.amount), entry.currency)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
                {formatMonthLabel(selectedMonth)} 성과
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => prevMonthOption && setSelectedMonth(prevMonthOption.value)}
                  disabled={!prevMonthOption}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  aria-label="지난 달"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="inline-flex h-8 min-w-[68px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {formatMonthBadge(selectedMonth)}
                </span>
                <button
                  type="button"
                  onClick={() => nextMonthOption && setSelectedMonth(nextMonthOption.value)}
                  disabled={!nextMonthOption}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  aria-label="다음 달"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">포지션 진입 횟수</p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedMonthPerformance.entryCount}회
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">승률</p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPercent(selectedMonthPerformance.winRate)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">평균 P&amp;L</p>
                <p
                  className={`mt-1 text-base font-semibold ${
                    (selectedMonthPerformance.averageReturn ?? 0) >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatRate(selectedMonthPerformance.averageReturn)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
              {selectedMonthPerformance.evaluatedCount}건의 P&amp;L 기록 기준
            </p>
            <div className="mt-3 space-y-2 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0 xl:block xl:space-y-2">
              {selectedMonthSummary.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">입력된 손익 데이터가 없습니다.</p>
              ) : (
                selectedMonthSummary.map((entry) => (
                  <div
                    key={entry.currency}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{entry.currency}</p>
                    <p
                      className={`text-lg font-semibold ${
                        entry.amount >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {entry.amount >= 0 ? "+" : "-"}
                      {formatAmount(Math.abs(entry.amount), entry.currency)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
              주요 매매 종목
            </h3>
            <div className="mt-3 space-y-3">
              {focusedStats.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  아직 분석 가능한 종료 거래가 없습니다.
                </p>
              ) : (
                focusedStats.map((item) => (
                  <div key={item.symbol} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.symbol}</span>
                      <span className="text-zinc-500 dark:text-zinc-500">{item.participation.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
                        style={{ width: `${Math.max(6, item.participation)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014]">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
              주요 종목 P&L
            </h3>
            <div className="mt-3 space-y-2">
              {symbolStats.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">종목 통계가 아직 없습니다.</p>
              ) : (
                symbolStats.map((item) => (
                  <div
                    key={item.symbol}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition-all duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.symbol}</p>
                      <p
                        className={`text-xs font-semibold ${
                          item.averageReturn >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatRate(item.averageReturn)}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                      {item.tradeCount}회 | 승률 {item.winRate.toFixed(1)}%
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>

      {modalDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-[#0d1014]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-zinc-500 dark:text-zinc-500">날짜 상세</p>
                <h4 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {modalDate}
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  P&L {formatRate(monthMetrics.get(modalDate)?.averageReturn ?? null)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(true);
                      setModalNotice("");
                    }}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    수정
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setModalDate(null);
                    setIsEditMode(false);
                    setModalNotice("");
                  }}
                  className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  닫기
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">P&L</p>
                <p
                  className={`mt-0.5 text-sm font-semibold ${
                    monthMetrics.get(modalDate)?.averageReturn === null ||
                    monthMetrics.get(modalDate)?.averageReturn === undefined
                      ? "text-zinc-900 dark:text-zinc-100"
                      : (monthMetrics.get(modalDate)?.averageReturn ?? 0) >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatRate(monthMetrics.get(modalDate)?.averageReturn ?? null)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">수익 / 손실</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {modalOverride
                    ? `${formatAmount(modalOverride.profit_amount, modalOverride.currency)} / ${formatAmount(
                        modalOverride.loss_amount,
                        modalOverride.currency,
                      )}`
                    : "-"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">순손익</p>
                <p
                  className={`mt-0.5 text-sm font-semibold ${
                    modalNetAmount === null
                      ? "text-zinc-900 dark:text-zinc-100"
                      : modalNetAmount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {modalNetAmount === null
                    ? "-"
                    : `${modalNetAmount >= 0 ? "+" : "-"}${formatAmount(
                        Math.abs(modalNetAmount),
                        modalOverride?.currency ?? "KRW",
                      )}`}
                </p>
              </div>
            </div>

            {isEditMode ? (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency("KRW")}
                    className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
                      currency === "KRW"
                        ? "border-zinc-400 bg-zinc-900 text-white dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    ₩ 원화
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
                      currency === "USD"
                        ? "border-zinc-400 bg-zinc-900 text-white dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    $ 달러
                  </button>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">수익금액</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={profitAmount}
                    onChange={(event) => setProfitAmount(event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-400"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">손실금액</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={lossAmount}
                    onChange={(event) => setLossAmount(event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-rose-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-rose-400"
                  />
                </label>
                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || !overrideMap[modalDate]}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-rose-400/60 bg-rose-100 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                  >
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setModalNotice("");
                    }}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    보기 모드
                  </button>
                </div>
              </form>
            ) : null}

            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300">해당 일자 종목 상세</p>
              <div className="mt-2 space-y-2">
                {modalTrades.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    해당 일자에 기록된 매매일지가 없습니다.
                  </p>
                ) : (
                  modalTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {trade.symbol}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                          {trade.position} | {trade.status}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          (trade.rate ?? 0) >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatRate(trade.rate)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            {modalNotice ? (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{modalNotice}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
