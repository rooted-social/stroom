import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountDisabledPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function AccountDisabledPage({ searchParams }: AccountDisabledPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.account_status !== "inactive") {
    redirect("/dashboard");
  }

  const message =
    params.reason === "inactive"
      ? "현재 비활성화된 계정입니다. 문의 페이지 이동 후 문의를 남겨주세요."
      : "현재 계정 상태로는 이용이 불가합니다.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">ACCOUNT STATUS</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">대시보드 접근이 제한되었습니다</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/contact"
            className="cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            문의 페이지 이동
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              로그아웃
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
