import Link from "next/link";
import { Clock3 } from "lucide-react";

import { formatDateLabel } from "@/utils/date";
import {
  getReturnRateFromTrade,
  formatPrice,
  inferPosition,
  parseNumberFromText,
} from "@/utils/trade-metrics";
import { decodeTradeFormMeta } from "@/utils/trade-form";
import { type TradeRecord } from "@/types/trade";

type TradesListSkeletonProps = {
  trades: TradeRecord[];
};

export function TradesListSkeleton({ trades }: TradesListSkeletonProps) {
  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-[#101317] dark:text-zinc-400">
        아직 생성된 매매일지가 없습니다. 상단 버튼으로 첫 기록을 만들어보세요.
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <div className="hidden grid-cols-[2.2fr_0.9fr_1fr_1fr_1fr] gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-[#101317] dark:text-zinc-400 md:grid">
        <span>종목명</span>
        <span>포지션</span>
        <span>진입가격</span>
        <span>탈출가격</span>
        <span>손익률</span>
      </div>
      {trades.map((trade) => (
        (() => {
          const position = inferPosition(trade);
          const meta = decodeTradeFormMeta(trade.plan);
          const entryPrice =
            trade.entry_price !== null && Number.isFinite(trade.entry_price)
              ? Number(trade.entry_price)
              : meta?.entryPrice
                ? parseNumberFromText(meta.entryPrice)
                : parseNumberFromText(trade.plan) ?? parseNumberFromText(trade.scenario);
          const exitPrice =
            trade.exit_price !== null && Number.isFinite(trade.exit_price)
              ? Number(trade.exit_price)
              : meta?.exitPrice
                ? parseNumberFromText(meta.exitPrice)
                : trade.status === "open"
                  ? null
                  : parseNumberFromText(trade.result);
          const returnRate = getReturnRateFromTrade(trade);
          const isOngoingScenario = trade.mode === "pre" && trade.status === "open";
          const tradeDateText = trade.trade_date
            ? formatDateLabel(trade.trade_date)
            : meta?.tradeDate
              ? formatDateLabel(meta.tradeDate)
              : formatDateLabel(trade.updated_at);
          const holdingTimeText = trade.holding_time ?? meta?.holdingTime ?? "";

          return (
            <Link
              key={trade.id}
              href={`/trades/${trade.id}`}
              aria-label={`${trade.symbol} 상세 페이지 이동`}
              className={[
                "block cursor-pointer rounded-xl border bg-white px-4 py-2.5 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50/70 dark:bg-[#101317] dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60",
                isOngoingScenario
                  ? "border-sky-300 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] dark:border-sky-700"
                  : "border-zinc-200 dark:border-zinc-800",
              ].join(" ")}
            >
              <div className="grid gap-3 md:grid-cols-[2.2fr_0.9fr_1fr_1fr_1fr] md:items-center">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-sm md:font-semibold md:tracking-normal">
                      {trade.symbol}
                    </p>
                    <div className="inline-flex shrink-0 items-center gap-1 text-xs text-zinc-500 md:hidden dark:text-zinc-400">
                      <span>{tradeDateText}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3" />
                        {holdingTimeText || "홀딩 미입력"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 hidden flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 md:flex">
                    <span>{tradeDateText}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {holdingTimeText || "홀딩 미입력"}
                    </span>
                    {!holdingTimeText && trade.mode === "pre" ? (
                      <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                        진행중 시나리오
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="hidden md:block">
                  <span
                    className={[
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                      position === "LONG"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                    ].join(" ")}
                  >
                    {position}
                  </span>
                </div>

                <p className="hidden text-sm font-medium text-zinc-900 dark:text-zinc-100 md:block md:text-base">
                  {formatPrice(entryPrice)}
                </p>
                <p className="hidden text-sm font-medium text-zinc-900 dark:text-zinc-100 md:block md:text-base">
                  {isOngoingScenario
                    ? `${formatPrice(exitPrice)} (Target)`
                    : formatPrice(exitPrice)}
                </p>
                <p
                  className={[
                    "hidden text-sm font-semibold md:block",
                    isOngoingScenario
                      ? "text-sky-600 dark:text-sky-400"
                      : returnRate === null
                      ? "text-zinc-500 dark:text-zinc-400"
                      : returnRate >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400",
                  ].join(" ")}
                >
                  {isOngoingScenario
                    ? "진행 중"
                    : returnRate === null
                      ? "-"
                      : `${returnRate > 0 ? "+" : ""}${returnRate.toFixed(2)}%`}
                </p>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 p-2 text-xs md:hidden dark:bg-zinc-900/50">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">진입가격</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(entryPrice)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {isOngoingScenario ? "목표 가격" : "탈출가격"}
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {isOngoingScenario
                      ? `${formatPrice(exitPrice)} (Target)`
                      : formatPrice(exitPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">포지션</p>
                  <p
                    className={[
                      "font-semibold",
                      position === "LONG"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400",
                    ].join(" ")}
                  >
                    {position}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">손익률</p>
                  <p
                    className={[
                      "font-semibold",
                      isOngoingScenario
                        ? "text-sky-600 dark:text-sky-400"
                        : returnRate === null
                        ? "text-zinc-500 dark:text-zinc-400"
                        : returnRate >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                    ].join(" ")}
                  >
                    {isOngoingScenario
                      ? "진행 중"
                      : returnRate === null
                        ? "-"
                        : `${returnRate > 0 ? "+" : ""}${returnRate.toFixed(2)}%`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })()
      ))}
    </section>
  );
}
