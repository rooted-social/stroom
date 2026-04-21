"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAccess } from "@/lib/admin/auth";
import {
  type AdminInquiryStatus,
  type AdminPlanStatus,
  type AdminUserStatus,
} from "@/types/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isUserStatus(value: string): value is AdminUserStatus {
  return value === "active" || value === "inactive" || value === "suspended";
}

function isPlanStatus(value: string): value is AdminPlanStatus {
  return value === "active" || value === "expiring" || value === "expired";
}

function isInquiryStatus(value: string): value is AdminInquiryStatus {
  return value === "pending" || value === "in_progress" || value === "done";
}

export async function updateUserStatusAction(formData: FormData) {
  await requireAdminAccess();
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!userId || !isUserStatus(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ account_status: status, updated_at: new Date().toISOString() })
    .eq("id", userId);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updatePlanStatusAction(formData: FormData) {
  await requireAdminAccess();
  const planUserId = String(formData.get("planUserId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!planUserId || !isPlanStatus(status)) {
    return;
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

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("user_plan_access")
    .update(updatePayload)
    .eq("user_id", planUserId);

  revalidatePath("/admin");
  revalidatePath("/admin/plans");
}

export async function updateInquiryAction(formData: FormData) {
  const admin = await requireAdminAccess();
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminMemo = String(formData.get("adminMemo") ?? "").trim();
  if (!inquiryId || !isInquiryStatus(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("contact_inquiries")
    .update({
      status,
      admin_memo: adminMemo.length > 0 ? adminMemo : null,
      handled_by: admin.userId,
      handled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}
