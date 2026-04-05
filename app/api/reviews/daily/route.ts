import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ReviewCurrency } from "@/types/review";

type DailyOverridePayload = {
  date?: string;
  profitAmount?: number;
  lossAmount?: number;
  currency?: ReviewCurrency;
};

function getCurrency(value: unknown): ReviewCurrency {
  if (value === "USD") {
    return "USD";
  }

  return "KRW";
}

function toSafeAmount(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as DailyOverridePayload;
  const date = String(body.date ?? "").trim();
  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date);

  if (!isDateValid) {
    return NextResponse.json({ message: "유효한 날짜를 입력해주세요." }, { status: 400 });
  }

  const profitAmount = toSafeAmount(body.profitAmount);
  const lossAmount = toSafeAmount(body.lossAmount);
  const currency = getCurrency(body.currency);

  const { data, error } = await supabase
    .from("review_daily_overrides")
    .upsert(
      {
        user_id: user.id,
        review_date: date,
        profit_amount: profitAmount,
        loss_amount: lossAmount,
        currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,review_date" },
    )
    .select("review_date, profit_amount, loss_amount, currency")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? "저장에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    review_date: data.review_date,
    profit_amount: Number(data.profit_amount ?? 0),
    loss_amount: Number(data.loss_amount ?? 0),
    currency: getCurrency(data.currency),
  });
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as { date?: string };
  const date = String(body.date ?? "").trim();
  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date);

  if (!isDateValid) {
    return NextResponse.json({ message: "유효한 날짜를 입력해주세요." }, { status: 400 });
  }

  const { error } = await supabase
    .from("review_daily_overrides")
    .delete()
    .eq("user_id", user.id)
    .eq("review_date", date);

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "삭제에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ review_date: date });
}
