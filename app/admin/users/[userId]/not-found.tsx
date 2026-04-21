import Link from "next/link";

export default function AdminUserNotFound() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white px-6 py-10 text-center shadow-sm">
      <p className="text-lg font-semibold text-zinc-900">회원 정보를 찾을 수 없습니다.</p>
      <p className="mt-2 text-sm text-zinc-500">삭제되었거나 잘못된 접근일 수 있습니다.</p>
      <Link
        href="/admin/users"
        className="mt-4 inline-flex cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Users로 이동
      </Link>
    </section>
  );
}
