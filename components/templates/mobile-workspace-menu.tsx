"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChartCandlestick,
  LayoutDashboard,
  Menu,
  Radar,
  Settings2,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/atoms/submit-button";
import { workspaceNavigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/trades": ChartCandlestick,
  "/reviews": Radar,
  "/settings": Settings2,
};

type MobileWorkspaceMenuProps = {
  workspaceName: string;
};

export function MobileWorkspaceMenu({ workspaceName }: MobileWorkspaceMenuProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  function openMenu() {
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  }

  function closeMenu() {
    setVisible(false);
  }

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!visible) {
      const timer = window.setTimeout(() => {
        setMounted(false);
      }, 220);
      return () => window.clearTimeout(timer);
    }
  }, [mounted, visible]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted]);

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 lg:hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        aria-label="메뉴 열기"
      >
        <Menu className="size-4" />
      </button>

      {mounted ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            onClick={closeMenu}
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200",
              visible ? "opacity-100" : "opacity-0",
            )}
            aria-label="메뉴 닫기"
          />
          <aside
            className={cn(
              "absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-zinc-200 bg-zinc-100 p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] transition-transform duration-200 dark:border-zinc-800 dark:bg-[#0d1012]",
              visible ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Hi, {workspaceName}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  My Trading Workspace
                </p>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex size-7 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-1.5">
              {workspaceNavigationItems.map((item) => {
                const Icon = iconMap[item.href as keyof typeof iconMap] ?? LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-200",
                      isActive
                        ? "border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                        : "border-zinc-100 bg-white hover:border-zinc-300/60 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-950",
                    )}
                  >
                    <div className="rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                      <Icon className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.labelKo}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {item.labelEn}
                      </p>
                    </div>
                  </Link>
                );
              })}
              </div>
            </nav>

            <div className="mt-auto pt-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
                <form action={logoutAction}>
                  <SubmitButton
                    label="로그아웃"
                    pendingLabel="로그아웃 중..."
                    variant="outline"
                    className="h-9 w-full border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  />
                </form>
                <div className="mt-2 flex justify-center rounded-lg border border-zinc-200 bg-white py-2 dark:border-zinc-700 dark:bg-zinc-950">
                  <Link href="/" onClick={closeMenu} className="inline-flex">
                    <Image
                      src="/images/logo_black.png"
                      alt="Stroom 로고"
                      width={150}
                      height={42}
                      className="h-7 w-auto dark:hidden"
                      priority
                    />
                    <Image
                      src="/images/logo.png"
                      alt="Stroom 로고"
                      width={150}
                      height={42}
                      className="hidden h-7 w-auto dark:block"
                      priority
                    />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
