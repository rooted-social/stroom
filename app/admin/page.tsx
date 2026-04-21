import Link from "next/link";

import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminDashboardSummary } from "@/lib/admin/service";
import { formatDateTime } from "@/lib/admin/format";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">ADMIN DASHBOARD</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">운영 현황</h1>
        <p className="mt-1 text-sm text-zinc-500">회원, 플랜, 문의를 한 화면에서 빠르게 확인합니다.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="총 회원 수" value={summary.totalUsers.toLocaleString("ko-KR")} />
        <AdminMetricCard label="활성 플랜 수" value={summary.activePlans.toLocaleString("ko-KR")} />
        <AdminMetricCard label="만료 예정 플랜 수" value={summary.expiringPlans.toLocaleString("ko-KR")} />
        <AdminMetricCard label="미처리 문의 수" value={summary.pendingInquiries.toLocaleString("ko-KR")} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">최근 가입 회원</h2>
            <Link href="/admin/users" className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-700">
              전체 보기
            </Link>
          </div>
          <div className="space-y-2">
            {summary.recentUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">최근 가입 데이터가 없습니다.</p>
            ) : (
              summary.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <AdminStatusBadge status={user.status} />
                    <p className="mt-1 text-xs text-zinc-500">{formatDateTime(user.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">최근 문의</h2>
            <Link href="/admin/inquiries" className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-700">
              전체 보기
            </Link>
          </div>
          <div className="space-y-2">
            {summary.recentInquiries.length === 0 ? (
              <p className="text-sm text-zinc-500">최근 문의 데이터가 없습니다.</p>
            ) : (
              summary.recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium text-zinc-900">{inquiry.title}</p>
                    <AdminStatusBadge status={inquiry.status} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {inquiry.userName} · {formatDateTime(inquiry.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
