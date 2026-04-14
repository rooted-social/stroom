import { redirect } from "next/navigation";
import { type User } from "@supabase/supabase-js";

import { getUserPlanAccess } from "@/lib/plan-access/get-user-plan-access";
import { hasPlanCapability } from "@/lib/plan-access/policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type PlanCapability, type UserPlanAccess } from "@/types/plan-access";

type AuthenticatedUserContext = {
  user: User;
  userId: string;
  access: UserPlanAccess;
};

type RequirePlanCapabilityOptions = {
  redirectTo: string;
  deniedMessage?: string;
};

function buildDeniedRedirectPath(path: string, message: string) {
  return `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`;
}

export async function requireDashboardAccess(): Promise<AuthenticatedUserContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getUserPlanAccess(user.id);
  return { user, userId: user.id, access };
}

export async function requirePlanCapability(
  capability: PlanCapability,
  options: RequirePlanCapabilityOptions,
): Promise<AuthenticatedUserContext> {
  const context = await requireDashboardAccess();
  const isAllowed = hasPlanCapability(context.access.planCode, capability);

  if (!isAllowed) {
    redirect(
      buildDeniedRedirectPath(
        options.redirectTo,
        options.deniedMessage ?? "현재 플랜에서는 해당 기능을 사용할 수 없습니다.",
      ),
    );
  }

  return context;
}
