export type TradeImageVariant = "thumb" | "full";

export function buildTradeImageProxyUrl(imageId: string, variant: TradeImageVariant) {
  return `/api/trades/images/${imageId}/${variant}`;
}
