import { NextResponse } from "next/server";

import type { WaitingListPayload } from "@/types/waiting-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  normalizeWaitingListPayload,
  validateWaitingListPayload,
} from "@/utils/waiting-list";

export async function POST(request: Request) {
  let payload: Partial<WaitingListPayload>;

  try {
    payload = (await request.json()) as Partial<WaitingListPayload>;
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const normalizedPayload = normalizeWaitingListPayload(payload);
  const validationResult = validateWaitingListPayload(normalizedPayload);

  if (validationResult.hasError) {
    return NextResponse.json(
      {
        message: "입력값을 확인해주세요.",
        fieldErrors: validationResult.fieldErrors,
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("waiting_list").insert(normalizedPayload);

  if (error) {
    return NextResponse.json(
      { message: "웨이팅리스트 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
