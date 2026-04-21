import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin/auth";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApiAccess();
  if ("error" in auth) {
    return auth.error;
  }

  const { userId } = await params;
  const { status } = (await request.json()) as { status?: string };
  const validStatus = status === "active" || status === "inactive" || status === "suspended";

  if (!validStatus) {
    return NextResponse.json({ message: "유효하지 않은 상태값입니다." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({ account_status: status, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
