import {
  type AdminInquiryStatus,
  type AdminPlanStatus,
  type AdminUserStatus,
} from "@/types/admin";
import { cn } from "@/lib/utils";

type StatusType = AdminUserStatus | AdminPlanStatus | AdminInquiryStatus;

const styleMap: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: "활성",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  inactive: {
    label: "비활성",
    className: "border-zinc-200 bg-zinc-100 text-zinc-700",
  },
  suspended: {
    label: "정지",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  expiring: {
    label: "만료예정",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  expired: {
    label: "만료",
    className: "border-zinc-200 bg-zinc-100 text-zinc-700",
  },
  pending: {
    label: "대기",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  in_progress: {
    label: "처리중",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  done: {
    label: "완료",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

type AdminStatusBadgeProps = {
  status: StatusType;
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const current = styleMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        current.className,
      )}
    >
      {current.label}
    </span>
  );
}
