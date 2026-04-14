import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlanCapabilities } from "@/lib/plan-access/policy";
import { type PlanAccessStatus, type PlanCode, type UserPlanAccess } from "@/types/plan-access";

type UserPlanAccessRow = {
  plan_code: PlanCode;
  status: PlanAccessStatus;
};

const DEFAULT_BETA_PLAN: PlanCode = "active";

function toUserPlanAccess(planCode: PlanCode, status: PlanAccessStatus): UserPlanAccess {
  return {
    planCode,
    status,
    capabilities: getPlanCapabilities(planCode),
  };
}

export async function getUserPlanAccess(userId: string): Promise<UserPlanAccess> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_plan_access")
    .select("plan_code, status")
    .eq("user_id", userId)
    .maybeSingle();

  const row = (data ?? null) as UserPlanAccessRow | null;

  if (error || !row) {
    // 베타 기간에는 누락 사용자도 active로 처리해 서비스 중단을 방지한다.
    return toUserPlanAccess(DEFAULT_BETA_PLAN, "active");
  }

  const effectivePlanCode: PlanCode = row.status === "active" ? row.plan_code : "free";
  return toUserPlanAccess(effectivePlanCode, row.status);
}
