import { ReviewsAnalyticsPanel } from "@/components/organisms/reviews-analytics-panel";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ReviewCurrency, type ReviewDailyOverride } from "@/types/review";
import { type TradeRecord } from "@/types/trade";

function getInitialMonth(trades: TradeRecord[]) {
  const latestTrade = trades
    .map((trade) => trade.trade_date ?? trade.created_at.slice(0, 10))
    .sort((a, b) => b.localeCompare(a))[0];

  if (latestTrade) {
    return latestTrade.slice(0, 7);
  }

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tradesData, error: tradesError } = await supabase
    .from("trades")
    .select("*")
    .order("trade_date", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: overridesData, error: overridesError } = await supabase
    .from("review_daily_overrides")
    .select("review_date, profit_amount, loss_amount, currency")
    .order("review_date", { ascending: false });

  if (tradesError) {
    return (
      <section className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        거래 데이터를 불러오지 못했습니다: {tradesError.message}
      </section>
    );
  }

  if (overridesError) {
    return (
      <section className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        리뷰 입력 데이터를 불러오지 못했습니다: {overridesError.message}
      </section>
    );
  }

  const trades = (tradesData ?? []) as TradeRecord[];
  const dailyOverrides = (
    (overridesData ?? []) as Array<{
      review_date: string;
      profit_amount: number | null;
      loss_amount: number | null;
      currency: string | null;
    }>
  ).map((entry): ReviewDailyOverride => {
    const currency: ReviewCurrency = entry.currency === "USD" ? "USD" : "KRW";
    return {
      review_date: entry.review_date,
      profit_amount: Number(entry.profit_amount ?? 0),
      loss_amount: Number(entry.loss_amount ?? 0),
      currency,
    };
  });

  const initialMonth = getInitialMonth(trades);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-[#0d1014] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
          REVIEWS
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          수익 및 매매 분석
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          매매일지 수익률 기반으로 월간 흐름을 확인하고, 날짜별 수익/손실 금액을
          기록하세요.
        </p>
      </header>

      <ReviewsAnalyticsPanel
        trades={trades}
        dailyOverrides={dailyOverrides}
        initialMonth={initialMonth}
      />
    </section>
  );
}
