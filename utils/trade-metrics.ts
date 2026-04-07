import { type TradeRecord } from "@/types/trade";
import { decodeTradeFormMeta } from "@/utils/trade-form";

export type PositionType = "LONG" | "SHORT";

export function inferPosition(trade: TradeRecord): PositionType {
  if (trade.position === "LONG" || trade.position === "SHORT") {
    return trade.position;
  }

  const meta = decodeTradeFormMeta(trade.plan);
  if (meta?.position === "LONG" || meta?.position === "SHORT") {
    return meta.position;
  }

  const content = `${trade.plan ?? ""} ${trade.result ?? ""} ${trade.review ?? ""}`.toLowerCase();

  if (content.includes("short") || content.includes("숏")) {
    return "SHORT";
  }

  if (content.includes("long") || content.includes("롱")) {
    return "LONG";
  }

  return trade.mode === "post" ? "SHORT" : "LONG";
}

export function parseNumberFromText(text: string | null): number | null {
  if (!text) {
    return null;
  }

  const match = text.replaceAll(",", "").match(/-?\d+(\.\d+)?/);
  if (!match) {
    return null;
  }

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

export function formatPrice(value: number | null) {
  if (value === null) {
    return "미입력";
  }

  if (value < 10) {
    return value.toFixed(4);
  }

  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
  });
}

export function calculateReturnRate(
  entryPrice: number | null,
  exitPrice: number | null,
  position: PositionType,
  leverage = 1,
) {
  if (entryPrice === null || exitPrice === null || entryPrice === 0) {
    return null;
  }

  const raw =
    position === "LONG"
      ? ((exitPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - exitPrice) / entryPrice) * 100;

  const leveraged = raw * leverage;
  return Number.isFinite(leveraged) ? leveraged : null;
}

export function getReturnRateFromTrade(trade: TradeRecord) {
  if (trade.pnl_rate !== null && Number.isFinite(trade.pnl_rate)) {
    return Number(trade.pnl_rate);
  }

  const meta = decodeTradeFormMeta(trade.plan);
  const leverageText =
    trade.leverage !== null && Number.isFinite(trade.leverage)
      ? String(trade.leverage)
      : meta?.leverage ?? "";
  const leverageValue = Number(leverageText);
  const leverage =
    Number.isFinite(leverageValue) && leverageValue >= 1 && leverageValue <= 100
      ? leverageValue
      : 1;
  const position = inferPosition(trade);
  const entryPrice =
    trade.entry_price !== null && Number.isFinite(trade.entry_price)
      ? Number(trade.entry_price)
      : meta?.entryPrice
        ? parseNumberFromText(meta.entryPrice)
        : parseNumberFromText(trade.plan);
  const exitPrice =
    trade.exit_price !== null && Number.isFinite(trade.exit_price)
      ? Number(trade.exit_price)
      : meta?.exitPrice
        ? parseNumberFromText(meta.exitPrice)
        : trade.status === "open"
          ? null
          : parseNumberFromText(trade.result);

  const calculated = calculateReturnRate(entryPrice, exitPrice, position, leverage);
  if (calculated !== null) {
    return calculated;
  }

  const fromResult = parseNumberFromText(trade.result);
  if (fromResult !== null) {
    return fromResult;
  }

  return null;
}

export function calculateProfitAmount(
  entryPrice: number | null,
  exitPrice: number | null,
  position: PositionType,
) {
  if (entryPrice === null || exitPrice === null) {
    return null;
  }

  const raw = position === "LONG" ? exitPrice - entryPrice : entryPrice - exitPrice;
  return Number.isFinite(raw) ? raw : null;
}

