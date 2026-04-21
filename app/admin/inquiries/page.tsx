import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { updateInquiryAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/admin/format";
import { getAdminInquiries } from "@/lib/admin/service";
import { type AdminInquiryStatus } from "@/types/admin";

type InquiriesPageProps = {
  searchParams: Promise<{
    status?: AdminInquiryStatus | "all";
    page?: string;
  }>;
};

function buildInquiriesHref(status: string, page: number) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  params.set("page", String(page));
  return `/admin/inquiries?${params.toString()}`;
}

export default async function AdminInquiriesPage({ searchParams }: InquiriesPageProps) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const page = Number(params.page ?? "1");
  const result = await getAdminInquiries({ status, page, pageSize: 10 });

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Inquiries</h1>
        <p className="mt-1 text-sm text-zinc-500">최신 문의를 확인하고 내부 메모/상태를 관리합니다.</p>
      </header>

      <form className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        <select
          name="status"
          defaultValue={status}
          className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
        >
          <option value="all">상태 전체</option>
          <option value="pending">대기</option>
          <option value="in_progress">처리중</option>
          <option value="done">완료</option>
        </select>
        <button type="submit" className="h-10 cursor-pointer rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
          적용
        </button>
      </form>

      {result.items.length === 0 ? (
        <AdminEmptyState title="문의가 없습니다." description="현재 조건에 해당하는 문의가 없습니다." />
      ) : (
        <div className="space-y-3">
          {result.items.map((inquiry) => (
            <article key={inquiry.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-zinc-900">{inquiry.title}</p>
                  <p className="text-xs text-zinc-500">
                    {inquiry.userName} · {inquiry.email} · {formatDateTime(inquiry.createdAt)}
                  </p>
                </div>
                <AdminStatusBadge status={inquiry.status} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{inquiry.body}</p>

              <form action={updateInquiryAction} className="mt-4 grid gap-2">
                <input type="hidden" name="inquiryId" value={inquiry.id} />
                <div className="grid gap-2 md:grid-cols-[180px_1fr]">
                  <select
                    name="status"
                    defaultValue={inquiry.status}
                    className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
                  >
                    <option value="pending">대기</option>
                    <option value="in_progress">처리중</option>
                    <option value="done">완료</option>
                  </select>
                  <input
                    name="adminMemo"
                    defaultValue={inquiry.adminMemo ?? ""}
                    placeholder="내부 메모 또는 답변 기록"
                    className="h-10 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none [color-scheme:light] focus:border-zinc-400"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-9 cursor-pointer rounded-md border border-zinc-200 px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    상태/메모 저장
                  </button>
                </div>
              </form>
            </article>
          ))}
        </div>
      )}

      <AdminPagination
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        buildHref={(targetPage) => buildInquiriesHref(status, targetPage)}
      />
    </section>
  );
}
