export type TradeRecordMode = "pre" | "post";

export type TradeRecordStatus = "draft" | "open" | "closed";

export type TradeRecord = {
  id: string;
  user_id: string;
  title: string;
  symbol: string;
  mode: TradeRecordMode;
  status: TradeRecordStatus;
  trade_date: string | null;
  holding_time: string | null;
  position: "LONG" | "SHORT" | null;
  leverage: number | null;
  entry_price: number | null;
  exit_price: number | null;
  stop_loss: number | null;
  pnl_rate: number | null;
  scenario: string | null;
  checklist: string | null;
  plan: string | null;
  result: string | null;
  review: string | null;
  created_at: string;
  updated_at: string;
};
