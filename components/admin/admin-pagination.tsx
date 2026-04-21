import Link from "next/link";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function AdminPagination({ page, totalPages, buildHref }: AdminPaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={buildHref(Math.max(page - 1, 1))}
        className="cursor-pointer rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
        aria-disabled={page <= 1}
      >
        이전
      </Link>
      <p className="text-sm text-zinc-600">
        {page} / {totalPages}
      </p>
      <Link
        href={buildHref(Math.min(page + 1, totalPages))}
        className="cursor-pointer rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
        aria-disabled={page >= totalPages}
      >
        다음
      </Link>
    </div>
  );
}
