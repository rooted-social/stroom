export type TradeMetaPosition = "LONG" | "SHORT" | "";

export type TradeFormMeta = {
  tradeDate: string;
  holdingTime: string;
  position: TradeMetaPosition;
  leverage: string;
  entryPrice: string;
  exitPrice: string;
  stopPrice: string;
};

const META_PREFIX = "STROOM_META::";

export function encodeTradeFormMeta(meta: TradeFormMeta) {
  return `${META_PREFIX}${JSON.stringify(meta)}`;
}

export function decodeTradeFormMeta(value: string | null) {
  if (!value || !value.startsWith(META_PREFIX)) {
    return null;
  }

  try {
    const parsed = JSON.parse(value.slice(META_PREFIX.length)) as TradeFormMeta & {
      riskLeverage?: string;
    };
    return {
      tradeDate: parsed.tradeDate ?? "",
      holdingTime: parsed.holdingTime ?? "",
      position: parsed.position ?? "",
      leverage: parsed.leverage ?? parsed.riskLeverage ?? "",
      entryPrice: parsed.entryPrice ?? "",
      exitPrice: parsed.exitPrice ?? "",
      stopPrice: parsed.stopPrice ?? "",
    };
  } catch {
    return null;
  }
}

