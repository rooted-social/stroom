export type TradeImageOwnerType = "scenario" | "tradeJournal";

export type TradeImage = {
  id: string;
  user_id: string;
  owner_type: TradeImageOwnerType;
  owner_id: string;
  object_key_full: string;
  object_key_thumb: string;
  url_full: string;
  url_thumb: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  sort_order: number;
  created_at: string;
  deleted_at: string | null;
};
