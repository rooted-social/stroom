export type ReviewCurrency = "KRW" | "USD";

export type ReviewDailyOverride = {
  review_date: string;
  profit_amount: number;
  loss_amount: number;
  currency: ReviewCurrency;
};

export type ReviewSymbolStat = {
  symbol: string;
  tradeCount: number;
  winRate: number;
  averageReturn: number;
};
