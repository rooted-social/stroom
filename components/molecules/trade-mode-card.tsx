import { type TradeRecordMode } from "@/types/trade";

type TradeModeCardProps = {
  mode: TradeRecordMode;
  title: string;
  description: string;
};

export function TradeModeCard({ mode, title, description }: TradeModeCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#101317]">
      <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {mode === "pre" ? "사전 기록 시작" : "사후 기록 작성"}
      </p>
      <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
    </article>
  );
}
