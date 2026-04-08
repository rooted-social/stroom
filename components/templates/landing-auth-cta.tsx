"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type AuthCtaState = "loading" | "authenticated" | "anonymous"

type LandingAuthCtaProps = {
  secondaryButtonClass: string
  primaryButtonClass: string
}

const AUTH_HINT_KEY = "stroom:landing-auth-state"

function readInitialAuthState(): AuthCtaState {
  if (typeof window === "undefined") {
    return "loading"
  }

  const cached = window.sessionStorage.getItem(AUTH_HINT_KEY)
  if (cached === "authenticated" || cached === "anonymous") {
    return cached
  }

  return "loading"
}

export function LandingAuthCta({
  secondaryButtonClass,
  primaryButtonClass,
}: LandingAuthCtaProps) {
  const [authState, setAuthState] = useState<AuthCtaState>(readInitialAuthState)

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
          className="inline-flex h-8 w-16 animate-pulse rounded-full border border-white/10 bg-white/10 sm:h-9 sm:w-20"
        />
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-20 animate-pulse rounded-full border border-white/10 bg-white/10 sm:h-9 sm:w-24"
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
          <Link href="/login" className={secondaryButtonClass}>
            로그인
          </Link>
          <Link href="/signup" className={primaryButtonClass}>
            회원가입
          </Link>
        </>
      )}
    </div>
  )
}
