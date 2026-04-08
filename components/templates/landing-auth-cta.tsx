"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LogIn } from "lucide-react"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type AuthCtaState = "loading" | "authenticated" | "anonymous"

type LandingAuthCtaProps = {
  secondaryButtonClass: string
  primaryButtonClass: string
}

const AUTH_HINT_KEY = "stroom:landing-auth-state"

export function LandingAuthCta({
  secondaryButtonClass,
  primaryButtonClass,
}: LandingAuthCtaProps) {
  const [authState, setAuthState] = useState<AuthCtaState>("loading")

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    function applySessionState(session: { user: unknown } | null) {
      const nextState: AuthCtaState = session?.user ? "authenticated" : "anonymous"
      setAuthState((prev) => (prev === nextState ? prev : nextState))
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(AUTH_HINT_KEY, nextState)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      applySessionState(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionState(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (authState === "loading") {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-8 animate-pulse rounded-full border border-[#6EA9DD]/35 bg-[#6EA9DD]/15 md:h-9 md:w-20 md:rounded-full md:border-white/10 md:bg-white/10"
        />
        <span
          aria-hidden="true"
          className="hidden h-9 w-24 animate-pulse rounded-full border border-white/10 bg-white/10 md:inline-flex"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 transition-opacity duration-200 sm:gap-2">
      {authState === "authenticated" ? (
        <Link href="/dashboard" className={secondaryButtonClass}>
          내 대시보드
        </Link>
      ) : (
        <>
          <div className="md:hidden">
            <Link
              href="/login"
              aria-label="로그인"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6EA9DD]/45 bg-gradient-to-r from-[#6EA9DD]/95 to-[#3A7BBF]/95 text-white shadow-[0_8px_20px_-12px_rgba(58,123,191,0.9)] transition hover:opacity-90"
            >
              <LogIn className="size-4" />
            </Link>
          </div>
          <div className="hidden items-center gap-1.5 md:flex md:gap-2">
            <Link href="/login" className={secondaryButtonClass}>
              로그인
            </Link>
            <Link href="/signup" className={primaryButtonClass}>
              회원가입
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
