import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import {
  closePositionFromDetailAction,
  deleteTradeAction,
  updateTradeAction,
} from "@/app/(workspace)/trades/actions";
import { PageHeader } from "@/components/atoms/page-header";
import { TradeImagesField } from "@/components/molecules/trade-images-field";
import { TradeImageGallery } from "@/components/organisms/trade-image-gallery";
import { SubmitButton } from "@/components/atoms/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type TradeImage } from "@/types/trade-image";
import { type TradeRecord } from "@/types/trade";
import {
  calculateReturnRate,
  getReturnRateFromTrade,
  inferPosition,
  parseNumberFromText,
} from "@/utils/trade-metrics";
import { decodeTradeFormMeta } from "@/utils/trade-form";
import { linkButtonClass } from "@/utils/button-styles";

type TradeDetailPageProps = {
  params: Promise<{
    tradeId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
    edit?: string;
    focus?: string;
  }>;
};

function formatPriceDisplay(value: number | null, fallback: string | undefined) {
  if (value !== null && Number.isFinite(value)) {
    return Number(value).toLocaleString("ko-KR");
  }

  return fallback?.trim() ? fallback : "-";
}

function hasMeaningfulValue(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 && normalized !== "-" && normalized !== "미입력";
}

function formatRiskRewardRatio(value: number | null) {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return "-";
  }

  return `${value.toFixed(2)}:1`;
}

export default async function TradeDetailPage({
  params,
  searchParams,
}: TradeDetailPageProps) {
  const { tradeId } = await params;
  const { error, success, edit, focus } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error: tradeError } = await supabase
    .from("trades")
    .select("*")
    .eq("id", tradeId)
    .eq("user_id", user.id)
    .single();

  if (tradeError || !data) {
    notFound();
  }

  const trade = data as TradeRecord;
  const { data: tradeImagesData } = await supabase
    .from("trade_images")
    .select("*")
    .eq("owner_id", trade.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  const tradeImages = (tradeImagesData ?? []) as TradeImage[];
  const tradeMeta = decodeTradeFormMeta(trade.plan);
  const isEditMode = edit === "1";
  const shouldHighlightPostCloseFields = isEditMode && focus === "postClose";
  const calculatedPnl = getReturnRateFromTrade(trade);
  const position = trade.position ?? tradeMeta?.position ?? "";
  const leverageText =
    trade.leverage !== null && Number.isFinite(trade.leverage)
      ? String(trade.leverage)
      : tradeMeta?.leverage?.trim() ?? "";
  const leverageDisplay = leverageText ? `${leverageText}x` : "-";
  const entryPriceDisplay = formatPriceDisplay(trade.entry_price, tradeMeta?.entryPrice);
  const exitPriceDisplay = formatPriceDisplay(trade.exit_price, tradeMeta?.exitPrice);
  const stopPriceDisplay = formatPriceDisplay(trade.stop_loss, tradeMeta?.stopPrice);
  const tradeDateDisplay =
    trade.trade_date ?? tradeMeta?.tradeDate ?? trade.created_at.slice(0, 10);
  const holdingTimeDisplay = trade.holding_time ?? tradeMeta?.holdingTime ?? "미입력";
  const statusDisplay =
    trade.status === "open" ? "진행중" : trade.status === "closed" ? "종료" : "임시저장";
  const modeDisplay = trade.mode === "pre" ? "시나리오" : "매매일지";
  const isScenarioBeforeClose = trade.mode === "pre" && trade.status === "open";
  const positionForCalc = inferPosition(trade);
  const entryPriceForCalc =
    trade.entry_price !== null && Number.isFinite(trade.entry_price)
      ? Number(trade.entry_price)
      : tradeMeta?.entryPrice
        ? parseNumberFromText(tradeMeta.entryPrice)
        : null;
  const targetPriceForCalc =
    trade.exit_price !== null && Number.isFinite(trade.exit_price)
      ? Number(trade.exit_price)
      : tradeMeta?.exitPrice
        ? parseNumberFromText(tradeMeta.exitPrice)
        : null;
  const stopPriceForCalc =
    trade.stop_loss !== null && Number.isFinite(trade.stop_loss)
      ? Number(trade.stop_loss)
      : tradeMeta?.stopPrice
        ? parseNumberFromText(tradeMeta.stopPrice)
        : null;
  const leverageForCalc =
    trade.leverage !== null && Number.isFinite(trade.leverage)
      ? Number(trade.leverage)
      : tradeMeta?.leverage
        ? Number(tradeMeta.leverage)
        : 1;
  const normalizedLeverage =
    Number.isFinite(leverageForCalc) && leverageForCalc > 0 ? leverageForCalc : 1;
  const predictedTargetPnl = calculateReturnRate(
    entryPriceForCalc,
    targetPriceForCalc,
    positionForCalc,
    normalizedLeverage,
  );
  const predictedStopPnl = calculateReturnRate(
    entryPriceForCalc,
    stopPriceForCalc,
    positionForCalc,
    normalizedLeverage,
  );
  const rewardDistance =
    positionForCalc === "LONG"
      ? targetPriceForCalc !== null && entryPriceForCalc !== null
        ? targetPriceForCalc - entryPriceForCalc
        : null
      : entryPriceForCalc !== null && targetPriceForCalc !== null
        ? entryPriceForCalc - targetPriceForCalc
        : null;
  const riskDistance =
    positionForCalc === "LONG"
      ? entryPriceForCalc !== null && stopPriceForCalc !== null
        ? entryPriceForCalc - stopPriceForCalc
        : null
      : stopPriceForCalc !== null && entryPriceForCalc !== null
        ? stopPriceForCalc - entryPriceForCalc
        : null;
  const riskRewardRatio =
    rewardDistance !== null &&
    riskDistance !== null &&
    rewardDistance > 0 &&
    riskDistance > 0
      ? rewardDistance / riskDistance
      : null;
  const riskRewardDisplay = formatRiskRewardRatio(riskRewardRatio);
  const pnlDisplay =
    calculatedPnl === null
      ? trade.result || "-"
      : `${calculatedPnl >= 0 ? "+" : ""}${calculatedPnl.toFixed(2)}%`;
  const modeBadgeClass =
    trade.mode === "pre"
      ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-900/20 dark:text-sky-300"
      : "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-900/20 dark:text-violet-300";
  const checklistSectionTitle =
    trade.mode === "pre" ? "체크리스트" : "진입 전 체크리스트";
  const memoSectionTitle =
    trade.mode === "pre" ? "추가 메모" : "진입 전 메모";
  const symbolText = trade.symbol.trim();
  const scenarioText = (trade.reasons_entry ?? "").trim();
  const exitReasonText = (trade.reasons_exit ?? "").trim();
  const checklistText = (trade.scenario_checklist ?? "").trim();
  const checklistItems = checklistText
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const memoText = (trade.memo_additional ?? "").trim();
  const reviewText = (trade.review ?? "").trim();
  const hasSymbol = symbolText.length > 0;
  const hasPnl = isScenarioBeforeClose
    ? predictedTargetPnl !== null || predictedStopPnl !== null
    : hasMeaningfulValue(pnlDisplay);
  const hasHoldingTime = hasMeaningfulValue(holdingTimeDisplay);
  const hasEntryPrice = hasMeaningfulValue(entryPriceDisplay);
  const hasExitPrice = hasMeaningfulValue(exitPriceDisplay);
  const hasStopPrice = hasMeaningfulValue(stopPriceDisplay);
  const hasLeverage = hasMeaningfulValue(leverageDisplay);
  const hasScenario = scenarioText.length > 0;
  const hasExitReason = Boolean(exitReasonText);
  const hasChecklist = checklistItems.length > 0;
  const hasMemo = memoText.length > 0;
  const hasReview = reviewText.length > 0;
  const hasRiskReward = hasMeaningfulValue(riskRewardDisplay);

  return (
    <section>
      <PageHeader
        title={`Trade History`}
        description={
          isEditMode
            ? "필드 수정 후 저장하면 기록이 업데이트됩니다."
            : "나만의 매매일지를 보고서 형태로 확인할 수 있습니다."
        }
        action={
          <div className="flex items-center gap-2">
            <Link href="/trades" className={linkButtonClass("outline")}>
              목록으로 돌아가기
            </Link>
            {!isEditMode && trade.mode === "pre" && trade.status === "open" ? (
              <form action={closePositionFromDetailAction}>
                <input type="hidden" name="tradeId" value={trade.id} />
                <SubmitButton
                  label="포지션 종료"
                  pendingLabel="종료 처리 중..."
                  variant="default"
                />
              </form>
            ) : null}
            {!isEditMode ? (
              <details className="relative">
                <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 [&::-webkit-details-marker]:hidden">
                  메뉴
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <Link
                    href={`/trades/${tradeId}?edit=1`}
                    className={linkButtonClass("ghost", "default", "w-full justify-start")}
                  >
                    수정
                  </Link>
                  <form action={deleteTradeAction} className="mt-1">
                    <input type="hidden" name="tradeId" value={trade.id} />
                    <SubmitButton
                      label="삭제"
                      pendingLabel="삭제 중..."
                      variant="destructive"
                      className="w-full justify-start"
                    />
                  </form>
                </div>
              </details>
            ) : (
              <Link href={`/trades/${tradeId}`} className={linkButtonClass("ghost")}>
                보고서 보기
              </Link>
            )}
          </div>
        }
      />
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
      <TradeImageGallery images={tradeImages} />
      {isEditMode ? (
        <form
          action={updateTradeAction}
          className="form-placeholder-polish space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-[#101317] dark:text-zinc-100"
        >
          <input type="hidden" name="tradeId" value={trade.id} />
          <TradeImagesField existingImages={tradeImages} />
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">기본 정보</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">매매 날짜</span>
                  <input
                    name="tradeDate"
                    type="date"
                    required
                    defaultValue={trade.trade_date ?? tradeMeta?.tradeDate ?? trade.created_at.slice(0, 10)}
                    className="date-input-polish h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">종목명</span>
                  <input
                    name="symbol"
                    required
                    defaultValue={trade.symbol}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm uppercase outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 홀딩 시간</span>
                  <input
                    name="holdingTime"
                    defaultValue={trade.holding_time ?? tradeMeta?.holdingTime ?? ""}
                    className={`h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 ${
                      shouldHighlightPostCloseFields
                        ? "border-sky-400 ring-2 ring-sky-300/50 dark:border-sky-500 dark:ring-sky-500/30"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">포지션 및 손익</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <label className="space-y-1">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션</span>
                  <select
                    name="position"
                    required
                    defaultValue={trade.position ?? tradeMeta?.position ?? "LONG"}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="LONG">Long</option>
                    <option value="SHORT">Short</option>
                  </select>
                </label>
                <label className="space-y-0.5">
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">레버리지 (Leverage)</span>
                  <input
                    name="leverage"
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    required
                    defaultValue={
                      trade.leverage !== null && Number.isFinite(trade.leverage)
                        ? String(trade.leverage)
                        : tradeMeta?.leverage ?? ""
                    }
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">진입 가격 (Entry Price)</span>
                  <input
                    name="entryPrice"
                    required
                    defaultValue={
                      trade.entry_price !== null && Number.isFinite(trade.entry_price)
                        ? String(trade.entry_price)
                        : tradeMeta?.entryPrice ?? ""
                    }
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                    {trade.mode === "pre" ? "목표 가격 (Target Price)" : "탈출 가격 (Exit Price)"}
                  </span>
                  <input
                    name="exitPrice"
                    required
                    defaultValue={
                      trade.exit_price !== null && Number.isFinite(trade.exit_price)
                        ? String(trade.exit_price)
                        : tradeMeta?.exitPrice ?? ""
                    }
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">손절 가격 (Stop Loss)</span>
                  <input
                    name="stopPrice"
                    required
                    defaultValue={
                      trade.stop_loss !== null && Number.isFinite(trade.stop_loss)
                        ? String(trade.stop_loss)
                        : tradeMeta?.stopPrice ?? ""
                    }
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 grid gap-4 md:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900/40">
              <label className="space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">기록 타입</span>
                <select
                  name="mode"
                  defaultValue={trade.mode}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="pre">사전 기록</option>
                  <option value="post">사후 기록</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">상태</span>
                <select
                  name="status"
                  defaultValue={trade.status}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="draft">임시저장</option>
                  <option value="open">진행중</option>
                  <option value="closed">종료</option>
                </select>
              </label>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">진입 및 탈출 근거</h2>
              <label className="space-y-1 block">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 진입 근거</span>
                <textarea
                  name="entryReason"
                  rows={4}
                  required
                  defaultValue={scenarioText}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 탈출 근거</span>
                <textarea
                  name="exitReason"
                  rows={3}
                  required
                  defaultValue={exitReasonText}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <input type="hidden" name="scenarioChecklist" value={checklistText} />
              <input type="hidden" name="memoAdditional" value={memoText} />
            </div>

            {trade.mode === "post" || trade.status === "closed" ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <label className="space-y-1 block">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">복기</span>
                  <textarea
                    name="review"
                    rows={4}
                    defaultValue={trade.review ?? ""}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 ${
                      shouldHighlightPostCloseFields
                        ? "border-sky-400 ring-2 ring-sky-300/50 dark:border-sky-500 dark:ring-sky-500/30"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                </label>
              </div>
            ) : (
              <input type="hidden" name="review" value={trade.review ?? ""} />
            )}
          <div className="flex justify-end">
            <SubmitButton label="저장" pendingLabel="저장 중..." />
          </div>
        </form>
      ) : (
        <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#101317]">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${modeBadgeClass}`}>
                {modeDisplay}
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                {statusDisplay}
              </span>
              {position ? (
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    position === "LONG"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : position === "SHORT"
                        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {position}
                </span>
              ) : null}
            </div>
            <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400">{tradeDateDisplay}</p>
          </div>

          <section className="mt-2">
            <h2 className="mb-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">기본 정보</h2>
            <div className="grid gap-2 sm:grid-cols-4">
              {hasSymbol ? (
                <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">종목명(Symbol)</p>
                  <p className="mt-0.5 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {symbolText}
                  </p>
                </article>
              ) : null}
              {hasPnl ? (
                <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {isScenarioBeforeClose ? "예상 손익률 (Predicted P&L)" : "손익률 (P&L)"}
                  </p>
                  {isScenarioBeforeClose ? (
                    <p className="mt-0.5 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {predictedTargetPnl === null
                          ? "+00.00%"
                          : `${predictedTargetPnl >= 0 ? "+" : ""}${predictedTargetPnl.toFixed(2)}%`}{" "}
                        (예정)
                      </span>{" "}
                      /{" "}
                      <span className="text-rose-600 dark:text-rose-400">
                        {predictedStopPnl === null
                          ? "-00.00%"
                          : `${predictedStopPnl >= 0 ? "+" : ""}${predictedStopPnl.toFixed(2)}%`}{" "}
                        (예정)
                      </span>
                    </p>
                  ) : (
                    <p
                      className={`mt-0.5 text-base font-semibold tracking-tight ${
                        calculatedPnl === null
                          ? "text-zinc-900 dark:text-zinc-100"
                          : calculatedPnl >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {pnlDisplay}
                    </p>
                  )}
                </article>
              ) : null}
              {hasRiskReward ? (
                <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">손익비</p>
                  <p className="mt-0.5 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {riskRewardDisplay}
                  </p>
                </article>
              ) : null}
              <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">포지션 홀딩 시간</p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {hasHoldingTime ? holdingTimeDisplay : "-"}
                </p>
              </article>
            </div>
          </section>

          {hasEntryPrice || hasExitPrice || hasStopPrice || hasLeverage || hasChecklist ? (
            <section className="mt-5">
              <h2 className="mb-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                포지션 상세 정보
              </h2>
              {hasEntryPrice || hasExitPrice || hasStopPrice || hasLeverage ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {hasEntryPrice ? (
                    <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">진입 가격(Entry)</p>
                      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {entryPriceDisplay}
                      </p>
                    </article>
                  ) : null}
                  {hasExitPrice ? (
                    <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {trade.mode === "pre" ? "목표 가격(Target)" : "탈출 가격(Exit)"}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {exitPriceDisplay}
                      </p>
                    </article>
                  ) : null}
                  {hasStopPrice ? (
                    <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">손절 가격(Stop Loss)</p>
                      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {stopPriceDisplay}
                      </p>
                    </article>
                  ) : null}
                  {hasLeverage ? (
                    <article className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">레버리지(Leverage)</p>
                      <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {leverageDisplay}
                      </p>
                    </article>
                  ) : null}
                </div>
              ) : null}

              {hasChecklist ? (
                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {checklistSectionTitle}
                  </p>
                  <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                    {checklistItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {hasScenario || hasExitReason ? (
            <section className="mt-5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">진입 및 탈출 근거</h2>
              <div className="mt-1.5 space-y-2">
                {hasScenario ? (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">포지션 진입 근거</p>
                    <p className="mt-0.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{scenarioText}</p>
                  </div>
                ) : null}
                {hasExitReason ? (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">포지션 탈출 근거</p>
                    <p className="mt-0.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {exitReasonText}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasMemo || hasReview ? (
            <section className="mt-5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">메모 및 복기</h2>
              <div className="mt-1.5 space-y-2">
                {hasMemo ? (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{memoSectionTitle}</p>
                    <p className="mt-0.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{memoText}</p>
                  </div>
                ) : null}
                {hasReview ? (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">포지션 복기</p>
                    <p className="mt-0.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{reviewText}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </article>
      )}
    </section>
  );
}
