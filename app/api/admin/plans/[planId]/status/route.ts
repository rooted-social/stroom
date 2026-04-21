import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin/auth";

type RouteContext = {
  params: Promise<{ planId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApiAccess();
  if ("error" in auth) {
    return auth.error;
  }

  const { planId } = await params;
  const { status } = (await request.json()) as { status?: string };
  const validStatus = status === "active" || status === "expiring" || status === "expired";

  if (!validStatus) {
    return NextResponse.json({ message: "유효하지 않은 상태값입니다." }, { status: 400 });
  }

  const now = Date.now();
  const in3Days = new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString();
  const in30Days = new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString();
  const yesterday = new Date(now - 1000 * 60 * 60 * 24).toISOString();
  const updatePayload =
    status === "expired"
      ? { status: "inactive", expires_at: yesterday, updated_at: new Date().toISOString() }
      : status === "expiring"
        ? { status: "active", expires_at: in3Days, updated_at: new Date().toISOString() }
        : { status: "active", expires_at: in30Days, updated_at: new Date().toISOString() };

  const { error } = await auth.supabase
    .from("user_plan_access")
    .update(updatePayload)
    .eq("user_id", planId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
