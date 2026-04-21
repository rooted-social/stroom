import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { updateUserStatusAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/admin/format";
import { getAdminUserById } from "@/lib/admin/service";

type UserDetailPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const user = await getAdminUserById(userId);

  if (!user) {
    notFound();
  }

  const displayName = user.username ? `${user.name} (${user.username})` : user.name;

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <Link href="/admin/users" className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-700">
          ← Users로 돌아가기
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">회원 상세</h1>
      </header>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-zinc-500">이름</p>
            <p className="text-sm text-zinc-900">{displayName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500">이메일</p>
            <p className="text-sm text-zinc-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500">가입일</p>
            <p className="text-sm text-zinc-900">{formatDateTime(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500">최근 로그인</p>
            <p className="text-sm text-zinc-900">{formatDateTime(user.lastLoginAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500">권한</p>
            <p className="text-sm capitalize text-zinc-900">{user.role}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500">현재 상태</p>
            <AdminStatusBadge status={user.status} />
          </div>
        </div>
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">회원 상태 변경</h2>
        <form action={updateUserStatusAction} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <select
            name="status"
            defaultValue={user.status}
            className="h-10 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 [color-scheme:light]"
          >
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="suspended">정지</option>
          </select>
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            상태 저장
          </button>
        </form>
      </article>
    </section>
  );
}
