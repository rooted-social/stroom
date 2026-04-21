export type AdminUserStatus = "active" | "inactive" | "suspended";

export type AdminPlanType = "starter" | "pro" | "enterprise";
export type AdminPlanStatus = "active" | "expiring" | "expired";

export type AdminInquiryStatus = "pending" | "in_progress" | "done";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: "admin" | "member";
  status: AdminUserStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminPlan = {
  id: string;
  userId: string;
  userName: string;
  userUsername: string | null;
  userEmail: string;
  type: AdminPlanType;
  status: AdminPlanStatus;
  startedAt: string;
  expiresAt: string;
  updatedAt: string;
};

export type AdminInquiry = {
  id: string;
  userId: string | null;
  userName: string;
  email: string;
  title: string;
  body: string;
  status: AdminInquiryStatus;
  adminMemo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AdminUserFilters = {
  query?: string;
  status?: AdminUserStatus | "all";
  page?: number;
  pageSize?: number;
};

export type AdminPlanFilters = {
  query?: string;
  status?: AdminPlanStatus | "all";
  type?: AdminPlanType | "all";
  sortBy?: "expiresAt" | "startedAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type AdminInquiryFilters = {
  status?: AdminInquiryStatus | "all";
  page?: number;
  pageSize?: number;
};

export type AdminDashboardSummary = {
  totalUsers: number;
  activePlans: number;
  expiringPlans: number;
  pendingInquiries: number;
  recentUsers: Pick<AdminUser, "id" | "name" | "email" | "createdAt" | "status">[];
  recentInquiries: Pick<AdminInquiry, "id" | "title" | "userName" | "status" | "createdAt">[];
};
