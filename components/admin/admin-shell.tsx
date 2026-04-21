"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const adminMenus = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

type AdminShellProps = {
  children: ReactNode;
  adminEmail: string;
};

function isMenuActive(currentPath: string, targetPath: string) {
  if (targetPath === "/admin") {
    return currentPath === targetPath;
  }
  return currentPath.startsWith(targetPath);
}

export function AdminShell({ children, adminEmail }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-200 bg-white px-4 py-6 lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-zinc-400">STROOM ADMIN</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900">운영자 콘솔</p>
          </div>
          <nav className="space-y-1">
            {adminMenus.map((menu) => {
              const active = isMenuActive(pathname, menu.href);
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={cn(
                    "flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
                  )}
                >
                  {menu.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Admin Console</p>
                <p className="text-xs text-zinc-500">회원/플랜/문의 통합 관리</p>
              </div>
              <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                {adminEmail}
              </div>
            </div>
            <nav className="mt-3 flex gap-1 overflow-x-auto lg:hidden">
              {adminMenus.map((menu) => {
                const active = isMenuActive(pathname, menu.href);
                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    className={cn(
                      "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                      active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700",
                    )}
                  >
                    {menu.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="flex-1 px-4 py-4 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
