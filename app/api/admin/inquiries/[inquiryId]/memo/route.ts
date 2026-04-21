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
  const { memo } = (await request.json()) as { memo?: string };
  const normalizedMemo = String(memo ?? "").trim();

  const { error } = await auth.supabase
    .from("contact_inquiries")
    .update({
      admin_memo: normalizedMemo.length > 0 ? normalizedMemo : null,
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
