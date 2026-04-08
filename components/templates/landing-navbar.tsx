import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"

import { LandingAuthCta } from "@/components/templates/landing-auth-cta"
import { cn } from "@/lib/utils"

type LandingNavbarProps = {
  currentPath?: string
}

const navItems = [
  { label: "서비스", href: "/#service" },
  { label: "가격", href: "/pricing" },
  { label: "문의", href: "/contact" },
]

const heroSecondaryButtonClass =
  "liquid-glass inline-flex h-auto items-center justify-center rounded-full px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-white/5 sm:px-4 sm:py-2 sm:text-[0.8rem]"

const heroPrimaryButtonClass =
  "inline-flex h-auto items-center justify-center rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:py-2 sm:text-[0.8rem]"

export function LandingNavbar({ currentPath = "/" }: LandingNavbarProps) {
  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/10 bg-background/30 backdrop-blur-md">
          <div className="px-2 sm:px-3">
            <div className="relative flex items-center justify-between gap-2 py-2 sm:py-3">
              <div className="md:hidden">
                <details className="group relative">
                  <summary className="list-none cursor-pointer rounded-full border border-white/10 bg-background/40 p-2 text-foreground/85">
                    <Menu className="size-4" />
                  </summary>
                  <div className="absolute left-0 top-11 w-56 rounded-xl border border-white/10 bg-background/85 p-3 backdrop-blur-md">
                    <div className="space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={`${item.href}-dropdown`}
                          href={item.href}
                          className="block rounded-lg px-2 py-1.5 text-sm text-foreground/85 hover:bg-white/8 hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              </div>

              <Link href="/" className="absolute left-1/2 -translate-x-1/2 shrink-0 md:static md:translate-x-0">
                <Image
                  src="/images/logo_black.png"
                  alt="Stroom 로고"
                  width={180}
                  height={52}
                  className="h-7 w-auto dark:hidden sm:h-8"
                  priority
                />
                <Image
                  src="/images/logo.png"
                  alt="Stroom 로고"
                  width={180}
                  height={52}
                  className="hidden h-7 w-auto dark:block sm:h-8"
                  priority
                />
              </Link>

              <div className="hidden items-center gap-6 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-base text-foreground/90 transition-colors hover:text-foreground",
                      currentPath === item.href || (item.href === "/#service" && currentPath === "/")
                        ? "text-foreground"
                        : "text-foreground/75",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <LandingAuthCta
                secondaryButtonClass={heroSecondaryButtonClass}
                primaryButtonClass={heroPrimaryButtonClass}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
