"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function updateProfileSettingsAction(formData: FormData) {
  const { supabase, user } = await getCurrentUser();

  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!fullName) {
    redirect(`/settings?error=${encodeURIComponent("이름을 입력해주세요.")}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect(`/settings?success=${encodeURIComponent("프로필 설정을 저장했습니다.")}`);
}

export async function updateJournalDefaultsAction(formData: FormData) {
  const { supabase, user } = await getCurrentUser();

  const defaultLeverageRaw = String(formData.get("defaultLeverage") ?? "").trim();
  const majorSymbolsJson = String(formData.get("majorSymbolsJson") ?? "[]");
  const scenarioChecklistsJson = String(formData.get("scenarioChecklistsJson") ?? "[]");

  const defaultLeverage = Number(defaultLeverageRaw);
  if (!Number.isFinite(defaultLeverage) || defaultLeverage < 1 || defaultLeverage > 100) {
    redirect(`/settings?error=${encodeURIComponent("기본 레버리지는 1~100 사이 숫자여야 합니다.")}`);
  }

  let majorSymbols: string[] = [];
  let scenarioChecklists: string[] = [];

  try {
    majorSymbols = (JSON.parse(majorSymbolsJson) as string[])
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0)
      .slice(0, 30);
  } catch {
    redirect(`/settings?error=${encodeURIComponent("주요 매매 종목 데이터 형식이 올바르지 않습니다.")}`);
  }

  try {
    scenarioChecklists = (JSON.parse(scenarioChecklistsJson) as string[])
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 50);
  } catch {
    redirect(`/settings?error=${encodeURIComponent("시나리오 체크리스트 데이터 형식이 올바르지 않습니다.")}`);
  }

  const { error } = await supabase.from("user_journal_settings").upsert(
    {
      user_id: user.id,
      default_leverage: defaultLeverage,
      major_symbols: majorSymbols,
      scenario_checklists: scenarioChecklists,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/trades/new");
  redirect(`/settings?success=${encodeURIComponent("매매일지 기본값을 저장했습니다.")}`);
}
