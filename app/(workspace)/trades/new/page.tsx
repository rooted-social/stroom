import Link from "next/link";

import { createTradeAction } from "@/app/(workspace)/trades/actions";
import { PageHeader } from "@/components/atoms/page-header";
import { TradeImagesField } from "@/components/molecules/trade-images-field";
import { ScenarioChecklistField } from "@/components/molecules/scenario-checklist-field";
import { SubmitButton } from "@/components/atoms/submit-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decodeTradeFormMeta } from "@/utils/trade-form";
import { linkButtonClass } from "@/utils/button-styles";

type NewTradePageProps = {
  searchParams: Promise<{
    mode?: "pre" | "post";
    error?: string;
  }>;
};

export default async function NewTradePage({ searchParams }: NewTradePageProps) {
  const { mode, error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: journalDefaults } =
    user
      ? await supabase
          .from("user_journal_settings")
          .select("default_leverage, major_symbols, scenario_checklists")
          .eq("user_id", user.id)
          .single()
      : { data: null };

  const normalizedMode = mode === "post" || mode === "pre" ? mode : "pre";
  const modeTitle = normalizedMode === "pre" ? "시나리오 작성" : "매매일지 작성";
  const modeDescription =
    normalizedMode === "pre"
      ? "진입 전 시나리오를 기록해 계획 기반 매매를 준비합니다."
      : "진입 후 결과를 정리하고 복기를 기록합니다.";
  const initialMeta = decodeTradeFormMeta(null);
  const defaultPosition =
    initialMeta?.position || "LONG";
  const defaultLeverage =
    journalDefaults?.default_leverage !== null && journalDefaults?.default_leverage !== undefined
      ? String(journalDefaults.default_leverage)
      : initialMeta?.leverage || "1";
  const symbolOptions: string[] =
    journalDefaults?.major_symbols && journalDefaults.major_symbols.length > 0
      ? journalDefaults.major_symbols
      : ["BTC", "ETH", "XRP", "NQ", "ES"];
  const checklistOptions = journalDefaults?.scenario_checklists ?? [];

  return (
    <section>
      <PageHeader
        title={modeTitle}
        titleEn={normalizedMode === "pre" ? "Scenario Entry" : "Journal Entry"}
        description={modeDescription}
        action={
          <Link href="/trades" className={linkButtonClass("outline")}>
            목록으로
          </Link>
        }
      />
      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <form
        action={createTradeAction}
        className="form-placeholder-polish space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-[#101317] dark:text-zinc-100"
      >
        <TradeImagesField />
        <input type="hidden" name="mode" value={normalizedMode} />
        <input
          type="hidden"
          name="status"
          value={normalizedMode === "pre" ? "open" : "closed"}
        />

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            기본 정보
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">매매 날짜</span>
              <input
                name="tradeDate"
                type="date"
                required
                className="date-input-polish h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">종목명</span>
              <select
                name="symbol"
                required
                defaultValue={symbolOptions[0]}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm uppercase outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {symbolOptions.map((symbol) => (
                  <option key={symbol} value={symbol.toUpperCase()}>
                    {symbol.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            {normalizedMode === "post" ? (
              <label className="space-y-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 홀딩 시간</span>
                <input
                  name="holdingTime"
                  required
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="예: 2시간 30분"
                />
              </label>
            ) : null}
          </div>
          {normalizedMode === "pre" ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              포지션 홀딩 시간은 거래 종료 후 매매일지/상세 수정에서 입력할 수 있습니다.
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            포지션 및 손익
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <label className="space-y-1">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 (Position)</span>
              <select
                name="position"
                required
                defaultValue={defaultPosition}
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
                defaultValue={defaultLeverage}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="1~100"
              />
            </label>
            <label className="space-y-0.5">
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">진입 가격 (Entry Price)</span>
              <input
                name="entryPrice"
                required
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="예: 67,500"
              />
            </label>
            <label className="space-y-0.5">
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                {normalizedMode === "pre" ? "목표 가격 (Target Price)" : "탈출 가격 (Exit Price)"}
              </span>
              <input
                name="exitPrice"
                required
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="예: 69,200"
              />
            </label>
            <label className="space-y-0.5">
              <span className="text-[13px] text-zinc-700 dark:text-zinc-300">손절 가격 (Stop Loss)</span>
              <input
                name="stopPrice"
                required
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="예: 66,000"
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            진입 및 탈출 근거
          </h2>
          <label className="space-y-1 block">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 진입 근거</span>
            <textarea
              name="entryReason"
              rows={4}
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="진입을 결정한 핵심 근거를 기록하세요."
            />
          </label>
          {normalizedMode === "pre" ? (
            <div className="space-y-3">
              <label className="space-y-1 block">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 탈출 근거</span>
                <textarea
                  name="exitReason"
                  rows={2}
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="탈출 타이밍과 이유를 기록하세요."
                />
              </label>
              <ScenarioChecklistField items={checklistOptions} />
            </div>
          ) : (
            <label className="space-y-1 block">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">포지션 탈출 근거</span>
              <input
                name="exitReason"
                required
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="탈출 타이밍과 이유를 기록하세요."
              />
            </label>
          )}
        </div>

        {normalizedMode === "post" ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <label className="space-y-1 block">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">복기</span>
              <textarea
                name="review"
                rows={4}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="포지션 복기"
              />
            </label>
          </div>
        ) : (
          <input type="hidden" name="review" value="" />
        )}

        <div className="flex justify-end">
          <SubmitButton label="저장하고 상세로 이동" pendingLabel="저장 중..." />
        </div>
      </form>
    </section>
  );
}
