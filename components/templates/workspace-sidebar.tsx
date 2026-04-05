"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartCandlestick,
  LayoutDashboard,
  Radar,
  Settings2,
} from "lucide-react";

import { workspaceNavigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/trades": ChartCandlestick,
  "/reviews": Radar,
  "/settings": Settings2,
};

export function WorkspaceSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-56 shrink-0 border-r border-zinc-200 bg-[#f1f3f6] px-3 py-3 dark:border-zinc-800 dark:bg-[#0d1012] lg:block">
      <div className="mb-5 px-2 py-1">
        <Link href="/" className="inline-flex">
          <Image
            src="/images/logo_black.png"
            alt="Stroom 로고"
            width={170}
            height={48}
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="/images/logo.png"
            alt="Stroom 로고"
            width={170}
            height={48}
            className="hidden h-8 w-auto dark:block"
            priority
          />
        </Link>
      </div>
      <nav className="space-y-1.5">
        {workspaceNavigationItems.map((item) => {
          const Icon = iconMap[item.href as keyof typeof iconMap] ?? LayoutDashboard;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-200",
                isActive
                  ? "border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                  : "border-transparent hover:translate-x-0.5 hover:border-zinc-300/60 hover:bg-white dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70",
              )}
            >
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-500 transition-colors group-hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:group-hover:text-zinc-100">
                <Icon className="size-3.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.labelKo}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.labelEn}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
