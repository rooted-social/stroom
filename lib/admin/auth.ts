import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminContext = {
  userId: string;
  email: string;
  role: string;
};

function getRoleFromProfileOrMetadata(
  profileRole: string | null | undefined,
  metadataRole: unknown,
): string {
  if (typeof profileRole === "string" && profileRole.length > 0) {
    const normalized = profileRole.trim().toLowerCase();
    if (normalized === "admin" || normalized === "member") {
      return normalized;
    }
  }
  if (typeof metadataRole === "string" && metadataRole.length > 0) {
    const normalized = metadataRole.trim().toLowerCase();
    if (normalized === "admin" || normalized === "member") {
      return normalized;
    }
  }
  return "member";
}

function parseRpcAdminResult(value: unknown): boolean {
  if (value === true || value === "true" || value === "t") {
    return true;
  }
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0] as unknown;
    if (first === true) {
      return true;
    }
    if (typeof first === "object" && first !== null && "is_admin_user" in first) {
      return (first as { is_admin_user?: unknown }).is_admin_user === true;
    }
  }
  if (typeof value === "object" && value !== null && "is_admin_user" in value) {
    return (value as { is_admin_user?: unknown }).is_admin_user === true;
  }
  return false;
}

async function resolveAdminRole(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  metadataRole: unknown,
) {
  const rpcResult = await supabase.rpc("is_admin_user", { p_user_id: userId });
  if (!rpcResult.error && parseRpcAdminResult(rpcResult.data)) {
    return "admin";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return getRoleFromProfileOrMetadata(profile?.role, metadataRole);
}

export async function requireAdminAccess(): Promise<AdminContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await resolveAdminRole(supabase, user.id, user.user_metadata?.role);
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role,
  };
}

export async function requireAdminApiAccess() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 }) };
  }

  const role = await resolveAdminRole(supabase, user.id, user.user_metadata?.role);

  if (role !== "admin") {
    return { error: NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 }) };
  }

  return { supabase, user };
}
