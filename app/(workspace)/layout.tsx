import type { Metadata } from "next";
import { type ReactNode } from "react";

import { logoutAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/atoms/submit-button";
import { MobileWorkspaceMenu } from "@/components/templates/mobile-workspace-menu";
import { WorkspaceSidebar } from "@/components/templates/workspace-sidebar";
import { ThemeToggle } from "@/components/templates/theme-toggle";
import { requireDashboardAccess } from "@/lib/plan-access/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { user } = await requireDashboardAccess();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user.id)
    .maybeSingle();

  const workspaceName =
    profile?.full_name?.trim() ||
    profile?.username?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "member";

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#090b0d]">
      <div className="mx-auto flex max-w-[1400px]">
        <WorkspaceSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 dark:border-zinc-800 dark:bg-[#0b0d10]/90">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <MobileWorkspaceMenu workspaceName={workspaceName} />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold tracking-tight text-zinc-900 sm:text-lg dark:text-zinc-100">
                    Hi, {workspaceName}
                  </p>
                  <p className="truncate text-[11px] text-zinc-500 sm:text-xs dark:text-zinc-400">
                    My Trading Workspace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <form action={logoutAction} className="hidden sm:block">
                  <SubmitButton
                    label="로그아웃"
                    pendingLabel="로그아웃 중..."
                    variant="outline"
                    className="h-8 border-zinc-300 bg-zinc-50 px-2 text-zinc-800 hover:bg-zinc-100 sm:px-2.5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  />
                </form>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
