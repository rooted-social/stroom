import {
  type AdminDashboardSummary,
  type AdminInquiry,
  type AdminInquiryFilters,
  type AdminPlan,
  type AdminPlanFilters,
  type AdminUser,
  type AdminUserFilters,
  type PaginationMeta,
} from "@/types/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mockAdminInquiries, mockAdminPlans, mockAdminUsers } from "@/lib/admin/mock-data";

type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

function toPaginationMeta(page: number, pageSize: number, totalCount: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return { page, pageSize, totalCount, totalPages };
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const currentPage = Math.max(1, page);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    meta: toPaginationMeta(currentPage, pageSize, items.length),
  };
}

function includesQuery(target: string, query: string) {
  return target.toLowerCase().includes(query.toLowerCase());
}

function sortByCreatedAt<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function toAdminUser(row: {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  account_status: string | null;
  created_at: string;
  last_login_at: string | null;
}): AdminUser {
  return {
    id: row.id,
    email: row.email ?? "",
    name: row.full_name ?? row.username ?? "이름 없음",
    username: row.username ?? null,
    role: row.role === "admin" ? "admin" : "member",
    status:
      row.account_status === "inactive" || row.account_status === "suspended"
        ? row.account_status
        : "active",
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function toAdminPlan(row: {
  user_id: string;
  plan_code: string;
  plan_tier: string | null;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  updated_at: string;
}): AdminPlan {
  const planType =
    row.plan_tier === "enterprise" || row.plan_tier === "pro"
      ? row.plan_tier
      : row.plan_code === "active"
        ? "pro"
        : "starter";
  const now = Date.now();
  const expiresTime = row.expires_at ? new Date(row.expires_at).getTime() : null;
  const in7Days = now + 1000 * 60 * 60 * 24 * 7;
  let planStatus: AdminPlan["status"] = "active";
  if (row.status === "inactive" || (expiresTime !== null && expiresTime < now)) {
    planStatus = "expired";
  } else if (expiresTime !== null && expiresTime <= in7Days) {
    planStatus = "expiring";
  }

  return {
    id: row.user_id,
    userId: row.user_id,
    userName: "이름 없음",
    userUsername: null,
    userEmail: "",
    type: planType,
    status: planStatus,
    startedAt: row.started_at ?? row.updated_at,
    expiresAt: row.expires_at ?? row.updated_at,
    updatedAt: row.updated_at,
  };
}

function mapInquiryRow(row: {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string;
  title: string | null;
  message: string;
  status: string;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
}): AdminInquiry {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.name ?? "알 수 없음",
    email: row.email,
    title: row.title ?? "일반 문의",
    body: row.message,
    status: row.status === "done" || row.status === "in_progress" ? row.status : "pending",
    adminMemo: row.admin_memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminUsers(filters: AdminUserFilters): Promise<PaginatedResult<AdminUser>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const query = (filters.query ?? "").trim();

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, email, role, account_status, created_at, last_login_at");

    if (error || !data) {
      throw new Error(error?.message ?? "profiles 조회 실패");
    }

    let items = data.map(toAdminUser);
    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }
    if (query) {
      items = items.filter(
        (item) => includesQuery(item.name, query) || includesQuery(item.email, query),
      );
    }

    return paginate(sortByCreatedAt(items), page, pageSize);
  } catch {
    let items = sortByCreatedAt(mockAdminUsers);
    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }
    if (query) {
      items = items.filter(
        (item) => includesQuery(item.name, query) || includesQuery(item.email, query),
      );
    }
    return paginate(items, page, pageSize);
  }
}

export async function getAdminUserById(userId: string) {
  const users = await getAdminUsers({ page: 1, pageSize: 1000 });
  return users.items.find((item) => item.id === userId) ?? null;
}

export async function getAdminPlans(filters: AdminPlanFilters): Promise<PaginatedResult<AdminPlan>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const query = (filters.query ?? "").trim();
  const sortBy = filters.sortBy ?? "expiresAt";
  const sortOrder = filters.sortOrder ?? "asc";

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data, error }, profilesResponse] = await Promise.all([
      supabase
        .from("user_plan_access")
        .select("user_id, plan_code, plan_tier, status, started_at, expires_at, updated_at"),
      supabase.from("profiles").select("id, full_name, username, email"),
    ]);

    if (error || !data) {
      throw new Error(error?.message ?? "user_plan_access 조회 실패");
    }

    const profileMap = new Map(
      (profilesResponse.data ?? []).map((profile) => [
        profile.id,
        {
          fullName: profile.full_name ?? "이름 없음",
          username: profile.username ?? null,
          email: profile.email ?? "",
        },
      ]),
    );

    let items = data.map((row) => {
      const mapped = toAdminPlan(row);
      const profile = profileMap.get(row.user_id);
      return {
        ...mapped,
        userName: profile?.fullName ?? "이름 없음",
        userUsername: profile?.username ?? null,
        userEmail: profile?.email ?? "",
      };
    });
    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.type && filters.type !== "all") {
      items = items.filter((item) => item.type === filters.type);
    }
    if (query) {
      items = items.filter(
        (item) =>
          includesQuery(item.userName, query) ||
          includesQuery(item.userEmail, query) ||
          includesQuery(item.type, query),
      );
    }

    items.sort((a, b) => {
      const keyMap = { expiresAt: "expiresAt", startedAt: "startedAt", updatedAt: "updatedAt" } as const;
      const key = keyMap[sortBy];
      const compare = a[key].localeCompare(b[key]);
      return sortOrder === "asc" ? compare : compare * -1;
    });

    return paginate(items, page, pageSize);
  } catch {
    let items = [...mockAdminPlans];
    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.type && filters.type !== "all") {
      items = items.filter((item) => item.type === filters.type);
    }
    if (query) {
      items = items.filter(
        (item) =>
          includesQuery(item.userName, query) ||
          includesQuery(item.userEmail, query) ||
          includesQuery(item.type, query),
      );
    }

    items.sort((a, b) => {
      const keyMap = { expiresAt: "expiresAt", startedAt: "startedAt", updatedAt: "updatedAt" } as const;
      const key = keyMap[sortBy];
      const compare = a[key].localeCompare(b[key]);
      return sortOrder === "asc" ? compare : compare * -1;
    });

    return paginate(items, page, pageSize);
  }
}

export async function getAdminInquiries(
  filters: AdminInquiryFilters,
): Promise<PaginatedResult<AdminInquiry>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("id, user_id, name, email, title, message, status, admin_memo, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new Error(error?.message ?? "contact_inquiries 조회 실패");
    }

    let items = data.map(mapInquiryRow);
    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }

    return paginate(items, page, pageSize);
  } catch {
    let items = [...mockAdminInquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filters.status && filters.status !== "all") {
      items = items.filter((item) => item.status === filters.status);
    }
    return paginate(items, page, pageSize);
  }
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [users, plans, inquiries] = await Promise.all([
    getAdminUsers({ page: 1, pageSize: 1000 }),
    getAdminPlans({ page: 1, pageSize: 1000, sortBy: "expiresAt", sortOrder: "asc" }),
    getAdminInquiries({ page: 1, pageSize: 1000 }),
  ]);

  return {
    totalUsers: users.meta.totalCount,
    activePlans: plans.items.filter((item) => item.status === "active").length,
    expiringPlans: plans.items.filter((item) => item.status === "expiring").length,
    pendingInquiries: inquiries.items.filter((item) => item.status === "pending").length,
    recentUsers: users.items.slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      createdAt: item.createdAt,
      status: item.status,
    })),
    recentInquiries: inquiries.items.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.title,
      userName: item.userName,
      status: item.status,
      createdAt: item.createdAt,
    })),
  };
}
