"use client";

type AdminErrorProps = {
  error: Error;
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8">
      <p className="text-lg font-semibold text-rose-700">관리자 페이지 로딩에 실패했습니다.</p>
      <p className="mt-2 text-sm text-rose-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 cursor-pointer rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
      >
        다시 시도
      </button>
    </section>
  );
}
