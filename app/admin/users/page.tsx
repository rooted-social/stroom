import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { updateUserStatusAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/admin/format";
import { getAdminUsers } from "@/lib/admin/service";
import { type AdminUserStatus } from "@/types/admin";

type UsersPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: AdminUserStatus | "all";
    page?: string;
  }>;
};

function formatUserLabel(name: string, username: string | null) {
  return username ? `${name} (${username})` : name;
}

function buildUsersPageHref(query: string, status: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status && status !== "all") params.set("status", status);
  params.set("page", String(page));
  return `/admin/users?${params.toString()}`;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const status = params.status ?? "all";
  const page = Number(params.page ?? "1");

  const result = await getAdminUsers({ query, status, page, pageSize: 10 });

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">회원 상태를 조회하고 즉시 변경할 수 있습니다.</p>
      </header>

      <form className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input
          name="query"
          defaultValue={query}
          placeholder="이름 또는 이메일 검색"
          className="h-10 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none [color-scheme:light] focus:border-zinc-400"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none [color-scheme:light] focus:border-zinc-400"
        >
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="suspended">정지</option>
        </select>
        <button
          type="submit"
          className="h-10 cursor-pointer rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          검색
        </button>
      </form>

      {result.items.length === 0 ? (
        <AdminEmptyState title="검색 결과가 없습니다." description="다른 조건으로 조회해보세요." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-3 py-2">회원</th>
                <th className="px-3 py-2">역할</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">가입일</th>
                <th className="px-3 py-2">최근 로그인</th>
                <th className="px-3 py-2">상태 변경</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((user) => (
                <tr key={user.id} className="border-t border-zinc-100">
                  <td className="px-3 py-3">
                    <Link href={`/admin/users/${user.id}`} className="cursor-pointer hover:underline">
                      <p className="font-medium text-zinc-900">
                        {formatUserLabel(user.name, user.username)}
                      </p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </Link>
                  </td>
                  <td className="px-3 py-3 capitalize text-zinc-700">{user.role}</td>
                  <td className="px-3 py-3">
                    <AdminStatusBadge status={user.status} />
                  </td>
                  <td className="px-3 py-3 text-zinc-600">{formatDateTime(user.createdAt)}</td>
                  <td className="px-3 py-3 text-zinc-600">{formatDateTime(user.lastLoginAt)}</td>
                  <td className="px-3 py-3">
                    <form action={updateUserStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="status"
                        defaultValue={user.status}
                        className="h-8 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-900 [color-scheme:light]"
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                        <option value="suspended">정지</option>
                      </select>
                      <button
                        type="submit"
                        className="h-8 cursor-pointer rounded-md border border-zinc-200 px-3 text-xs text-zinc-700 hover:bg-zinc-50"
                      >
                        저장
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPagination
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        buildHref={(targetPage) => buildUsersPageHref(query, status, targetPage)}
      />
    </section>
  );
}
