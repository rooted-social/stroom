import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/admin/auth";

type RouteContext = {
  params: Promise<{ inquiryId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApiAccess();
  if ("error" in auth) {
    return auth.error;
  }

  const { inquiryId } = await params;
  const { status } = (await request.json()) as { status?: string };
  const validStatus = status === "pending" || status === "in_progress" || status === "done";

  if (!validStatus) {
    return NextResponse.json({ message: "유효하지 않은 상태값입니다." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("contact_inquiries")
    .update({
      status,
      handled_by: auth.user.id,
      handled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
