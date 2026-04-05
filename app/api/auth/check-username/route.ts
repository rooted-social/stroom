import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const usernamePattern = /^[a-z0-9_]{4,20}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = String(searchParams.get("username") ?? "").trim().toLowerCase();

  if (!usernamePattern.test(username)) {
    return NextResponse.json(
      {
        available: false,
        message: "아이디는 4~20자의 영문 소문자, 숫자, 밑줄(_)만 가능합니다.",
      },
      { status: 200 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_email_by_username", {
    p_username: username,
  });

  if (error) {
    return NextResponse.json(
      { available: false, message: "중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    available: !data,
    message: data ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.",
  });
}
