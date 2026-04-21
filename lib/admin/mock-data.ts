import {
  type AdminInquiry,
  type AdminPlan,
  type AdminUser,
  type AdminPlanStatus,
} from "@/types/admin";

const now = new Date();
const day = 1000 * 60 * 60 * 24;

function toIso(daysOffset: number) {
  return new Date(now.getTime() + daysOffset * day).toISOString();
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: "u-admin-01",
    email: "admin@stroom.kr",
    name: "운영자",
    username: "admin",
    role: "admin",
    status: "active",
    createdAt: toIso(-90),
    lastLoginAt: toIso(-1),
  },
  {
    id: "u-1001",
    email: "minji@example.com",
    name: "김민지",
    username: "minji",
    role: "member",
    status: "active",
    createdAt: toIso(-5),
    lastLoginAt: toIso(-1),
  },
  {
    id: "u-1002",
    email: "jiyoon@example.com",
    name: "박지윤",
    username: "jiyoon",
    role: "member",
    status: "inactive",
    createdAt: toIso(-12),
    lastLoginAt: toIso(-8),
  },
  {
    id: "u-1003",
    email: "seho@example.com",
    name: "이세호",
    username: "seho",
    role: "member",
    status: "suspended",
    createdAt: toIso(-24),
    lastLoginAt: toIso(-20),
  },
  {
    id: "u-1004",
    email: "haneul@example.com",
    name: "정하늘",
    username: "haneul",
    role: "member",
    status: "active",
    createdAt: toIso(-2),
    lastLoginAt: toIso(-1),
  },
];

function getPlanStatus(expiresAt: string): AdminPlanStatus {
  const expiresDate = new Date(expiresAt);
  if (expiresDate.getTime() < now.getTime()) {
    return "expired";
  }
  if (expiresDate.getTime() - now.getTime() <= 1000 * 60 * 60 * 24 * 7) {
    return "expiring";
  }
  return "active";
}

const rawPlans: Omit<AdminPlan, "status">[] = [
  {
    id: "p-2001",
    userId: "u-1001",
    userName: "김민지",
    userUsername: "minji",
    userEmail: "minji@example.com",
    type: "pro",
    startedAt: toIso(-20),
    expiresAt: toIso(10),
    updatedAt: toIso(-1),
  },
  {
    id: "p-2002",
    userId: "u-1002",
    userName: "박지윤",
    userUsername: "jiyoon",
    userEmail: "jiyoon@example.com",
    type: "starter",
    startedAt: toIso(-45),
    expiresAt: toIso(-3),
    updatedAt: toIso(-4),
  },
  {
    id: "p-2003",
    userId: "u-1004",
    userName: "정하늘",
    userUsername: "haneul",
    userEmail: "haneul@example.com",
    type: "enterprise",
    startedAt: toIso(-6),
    expiresAt: toIso(4),
    updatedAt: toIso(-1),
  },
];

export const mockAdminPlans: AdminPlan[] = rawPlans.map((item) => ({
  ...item,
  status: getPlanStatus(item.expiresAt),
}));

export const mockAdminInquiries: AdminInquiry[] = [
  {
    id: "q-3001",
    userId: "u-1001",
    userName: "김민지",
    email: "minji@example.com",
    title: "결제 취소 후 환불 일정 문의",
    body: "프로 플랜 취소했는데 환불 예정일을 알고 싶습니다.",
    status: "pending",
    adminMemo: null,
    createdAt: toIso(-1),
    updatedAt: toIso(-1),
  },
  {
    id: "q-3002",
    userId: "u-1004",
    userName: "정하늘",
    email: "haneul@example.com",
    title: "이메일 알림 수신 안됨",
    body: "알림 설정을 켰는데 메일이 오지 않습니다.",
    status: "in_progress",
    adminMemo: "SMTP 로그 확인 중",
    createdAt: toIso(-3),
    updatedAt: toIso(-2),
  },
  {
    id: "q-3003",
    userId: null,
    userName: "비회원",
    email: "guest@example.com",
    title: "도입 문의",
    body: "팀 단위 이용 시 엔터프라이즈 요금 문의드립니다.",
    status: "done",
    adminMemo: "가격표 전달 완료",
    createdAt: toIso(-6),
    updatedAt: toIso(-5),
  },
];
