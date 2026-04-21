import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { updatePlanStatusAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/admin/format";
import { getAdminPlans } from "@/lib/admin/service";
import { type AdminPlanStatus, type AdminPlanType } from "@/types/admin";

type PlansPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: AdminPlanStatus | "all";
    type?: AdminPlanType | "all";
    sortBy?: "expiresAt" | "startedAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    page?: string;
  }>;
};

function formatUserLabel(name: string, username: string | null) {
  return username ? `${name} (${username})` : name;
}

function buildPlansPageHref(params: {
  query: string;
  status: string;
  type: string;
  sortBy: string;
  sortOrder: string;
  page: number;
}) {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status !== "all") search.set("status", params.status);
  if (params.type !== "all") search.set("type", params.type);
  search.set("sortBy", params.sortBy);
  search.set("sortOrder", params.sortOrder);
  search.set("page", String(params.page));
  return `/admin/plans?${search.toString()}`;
}

export default async function AdminPlansPage({ searchParams }: PlansPageProps) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const status = params.status ?? "all";
  const type = params.type ?? "all";
  const sortBy = params.sortBy ?? "expiresAt";
  const sortOrder = params.sortOrder ?? "asc";
  const page = Number(params.page ?? "1");

  const result = await getAdminPlans({
    query,
    status,
    type,
    sortBy,
    sortOrder,
    page,
    pageSize: 10,
  });

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Plans</h1>
        <p className="mt-1 text-sm text-zinc-500">회원별 플랜 상태를 조회/수정합니다.</p>
      </header>

      <form className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_150px_150px_170px_150px_auto]">
        <input
          name="query"
          defaultValue={query}
          placeholder="회원 이름 / 이메일 / 플랜 검색"
          className="h-10 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none [color-scheme:light] focus:border-zinc-400"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
        >
          <option value="all">상태 전체</option>
          <option value="active">활성</option>
          <option value="expiring">만료예정</option>
          <option value="expired">만료</option>
        </select>
        <select
          name="type"
          defaultValue={type}
          className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
        >
          <option value="all">플랜 전체</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          name="sortBy"
          defaultValue={sortBy}
          className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
        >
          <option value="expiresAt">만료일</option>
          <option value="startedAt">시작일</option>
          <option value="updatedAt">수정일</option>
        </select>
        <select
          name="sortOrder"
          defaultValue={sortOrder}
          className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
        >
          <option value="asc">오름차순</option>
          <option value="desc">내림차순</option>
        </select>
        <button type="submit" className="h-10 cursor-pointer rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
          적용
        </button>
      </form>

      {result.items.length === 0 ? (
        <AdminEmptyState title="플랜 데이터가 없습니다." description="검색/필터 조건을 확인해주세요." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-3 py-2">회원</th>
                <th className="px-3 py-2">플랜</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">시작일</th>
                <th className="px-3 py-2">만료일</th>
                <th className="px-3 py-2">상태 수정</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((plan) => (
                <tr key={plan.id} className="border-t border-zinc-100">
                  <td className="px-3 py-3">
                    <p className="font-medium text-zinc-900">
                      {formatUserLabel(plan.userName, plan.userUsername)}
                    </p>
                    <p className="text-xs text-zinc-500">{plan.userEmail}</p>
                  </td>
                  <td className="px-3 py-3 capitalize text-zinc-700">{plan.type}</td>
                  <td className="px-3 py-3">
                    <AdminStatusBadge status={plan.status} />
                  </td>
                  <td className="px-3 py-3 text-zinc-600">{formatDateTime(plan.startedAt)}</td>
                  <td className="px-3 py-3 text-zinc-600">{formatDateTime(plan.expiresAt)}</td>
                  <td className="px-3 py-3">
                    <form action={updatePlanStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="planUserId" value={plan.userId} />
                      <select
                        name="status"
                        defaultValue={plan.status}
                        className="h-8 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-2 text-xs text-zinc-900 [color-scheme:light]"
                      >
                        <option value="active">활성</option>
                        <option value="expiring">만료예정</option>
                        <option value="expired">만료</option>
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
        buildHref={(targetPage) =>
          buildPlansPageHref({
            query,
            status,
            type,
            sortBy,
            sortOrder,
            page: targetPage,
          })
        }
      />
    </section>
  );
}
