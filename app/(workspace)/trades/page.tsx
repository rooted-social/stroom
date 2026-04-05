import Link from "next/link";
import { ClipboardList, PenSquare } from "lucide-react";

import { TradesListSkeleton } from "@/components/organisms/trades-list-skeleton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TradeRecord } from "@/types/trade";
import { linkButtonClass } from "@/utils/button-styles";
import {
  getReturnRateFromTrade,
} from "@/utils/trade-metrics";

type TradesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    page?: string;
  }>;
};

const TRADES_PER_PAGE = 20;

export default async function TradesPage({ searchParams }: TradesPageProps) {
  const { success, error, page } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const parsedPage = Number(page ?? "1");
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  const { count: totalTradesCount } = await supabase
    .from("trades")
    .select("id", { head: true, count: "exact" });

  const totalCount = totalTradesCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / TRADES_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * TRADES_PER_PAGE;
  const endIndex = startIndex + TRADES_PER_PAGE - 1;

  const { data: tradesData, error: tradesError } = await supabase
    .from("trades")
    .select("*")
    .order("trade_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(startIndex, endIndex);

  const { data: statsTradesData } = await supabase
    .from("trades")
    .select("*");

  const trades = (tradesData ?? []) as TradeRecord[];
  const statsTrades = (statsTradesData ?? tradesData ?? []) as TradeRecord[];
  const closedTrades = statsTrades.filter((trade) => trade.status === "closed");

  const closedResults = closedTrades
    .map((trade) => getReturnRateFromTrade(trade))
    .filter((value): value is number => value !== null);

  const winCount = closedResults.filter((rate) => rate > 0).length;
  const lossCount = closedResults.filter((rate) => rate < 0).length;
  const closedCount = closedResults.length;
  const winRate =
    closedResults.length === 0 ? 0 : (winCount / closedResults.length) * 100;

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (success) params.set("success", success);
    if (error) params.set("error", error);
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }
    const query = params.toString();
    return query ? `/trades?${query}` : "/trades";
  }

  return (
    <section>
      <div className="mb-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">
              TRADES
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              매매일지
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              매매 기록을 구조적으로 관리하고 성과를 선명하게 복기하세요.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[360px]">
            <article className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                승률
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {winRate.toFixed(1)}%
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                종료 거래 {closedCount}건 기준
              </p>
            </article>

            <article className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                익절/손절
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {winCount} / {lossCount}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                익절 {winCount}회 · 손절 {lossCount}회
              </p>
            </article>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/trades/new?mode=pre"
            className={linkButtonClass(
              "outline",
              "default",
              "w-full sm:w-auto gap-1.5 border-zinc-300 bg-zinc-50/70 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-zinc-800",
            )}
          >
            <ClipboardList className="size-4" />
            시나리오 작성 (진입 전)
          </Link>
          <Link
            href="/trades/new?mode=post"
            className={linkButtonClass(
              "default",
              "default",
              "w-full sm:w-auto gap-1.5 shadow-sm shadow-zinc-900/20 dark:shadow-zinc-100/10",
            )}
          >
            <PenSquare className="size-4" />
            매매일지 작성 (진입 후)
          </Link>
        </div>
      </div>
      {success ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {tradesError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {tradesError.message}
        </p>
      ) : (
        <>
          <TradesListSkeleton trades={trades} />
          {totalCount > 0 ? (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-[#101317] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-zinc-600 dark:text-zinc-400">
                총 {totalCount}건 중 {startIndex + 1}-{Math.min(endIndex + 1, totalCount)}건
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={buildPageHref(Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage <= 1}
                  className={[
                    "inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition",
                    currentPage <= 1
                      ? "pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  이전
                </Link>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {currentPage} / {totalPages}
                </span>
                <Link
                  href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage >= totalPages}
                  className={[
                    "inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition",
                    currentPage >= totalPages
                      ? "pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  다음
                </Link>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
