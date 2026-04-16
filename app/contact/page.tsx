import Link from "next/link"

import { submitContactInquiryAction } from "@/app/contact/actions"
import { LandingNavbar } from "@/components/templates/landing-navbar"
import { ScrollReveal } from "@/components/templates/scroll-reveal"

type ContactPageProps = {
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { success, error } = await searchParams

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="blue-spotlight-bg" />
      <LandingNavbar currentPath="/contact" />

      <section className="px-4 pb-14 pt-30 sm:px-8 sm:pb-18 sm:pt-36">
        <div className="mx-auto w-full max-w-5xl">
          <ScrollReveal>
            <header className="text-center">
              <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Contact</p>
              <h1 className="mt-3 font-heading text-3xl tracking-tight text-hero-heading sm:text-4xl">
                고객 문의
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
                문의 내용을 남겨주시면 확인 후 빠르게 답변드리겠습니다.
              </p>
            </header>
          </ScrollReveal>

          <ScrollReveal delayMs={130}>
            <section className="relative mx-auto mt-10 w-full max-w-3xl liquid-glass rounded-3xl p-6 sm:p-8">
              <div className="pointer-events-none absolute -left-10 -top-14 -z-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(110,169,221,0.28),transparent_72%)] blur-2xl" />
              <div className="pointer-events-none absolute -right-8 -bottom-16 -z-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(58,123,191,0.22),transparent_72%)] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-10 top-0 -z-10 h-28 bg-[radial-gradient(circle_at_top,rgba(122,186,240,0.2),transparent_75%)] blur-2xl" />

              <div className="mb-5 text-center">
                <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Inquiry Form</p>
                <h2 className="mt-2 text-2xl font-semibold text-hero-heading">문의사항</h2>
              </div>

            {error ? (
              <p className="mb-4 rounded-xl border border-red-300/60 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}

              <form action={submitContactInquiryAction} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm text-foreground/85">이름</span>
                  <input
                    name="name"
                    required
                    className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
                    placeholder="홍길동"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm text-foreground/85">이메일</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
                    placeholder="name@email.com"
                  />
                </label>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-sm text-foreground/85">연락처</span>
                <input
                  name="phone"
                  className="h-11 w-full rounded-xl border border-white/20 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
                  placeholder="010-1234-5678"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm text-foreground/85">문의 항목</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="group relative cursor-pointer rounded-xl">
                    <input type="checkbox" name="topics" value="feature" className="peer sr-only" />
                    <span className="flex h-11 items-center justify-center rounded-xl border border-white/20 bg-black/15 px-3 text-center text-sm text-foreground/90 transition peer-checked:border-[#6EA9DD] peer-checked:bg-[#3A7BBF]/35 peer-checked:text-white group-hover:border-[#6EA9DD]/70">
                      기능 제안
                    </span>
                  </label>
                  <label className="group relative cursor-pointer rounded-xl">
                    <input type="checkbox" name="topics" value="pricing" className="peer sr-only" />
                    <span className="flex h-11 items-center justify-center rounded-xl border border-white/20 bg-black/15 px-3 text-center text-sm text-foreground/90 transition peer-checked:border-[#6EA9DD] peer-checked:bg-[#3A7BBF]/35 peer-checked:text-white group-hover:border-[#6EA9DD]/70">
                      요금 문의
                    </span>
                  </label>
                  <label className="group relative cursor-pointer rounded-xl">
                    <input type="checkbox" name="topics" value="partnership" className="peer sr-only" />
                    <span className="flex h-11 items-center justify-center rounded-xl border border-white/20 bg-black/15 px-3 text-center text-sm text-foreground/90 transition peer-checked:border-[#6EA9DD] peer-checked:bg-[#3A7BBF]/35 peer-checked:text-white group-hover:border-[#6EA9DD]/70">
                      협업 제안
                    </span>
                  </label>
                </div>
              </fieldset>

              <label className="space-y-1.5 block">
                <span className="text-sm text-foreground/85">문의 내용</span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white outline-none ring-0 transition placeholder:text-foreground/45 focus:border-[#6EA9DD]/60"
                  placeholder="문의하실 내용을 남겨주세요."
                />
              </label>

              <div className="pt-1 text-center">
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  제출하기
                </button>
              </div>
              </form>

            </section>
          </ScrollReveal>
        </div>
      </section>

      {success ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[#6EA9DD]/45 bg-[#0f1b2c] p-5 text-center shadow-[0_24px_50px_-26px_rgba(58,123,191,0.65)]">
            <h3 className="text-xl font-semibold text-white">제출이 완료되었습니다</h3>
            <p className="mt-2 text-sm text-foreground/75">
              문의 주셔서 감사합니다. 확인 후 빠르게 답변드리겠습니다.
            </p>
            <div className="mt-5 flex items-center justify-center">
              <Link
                href="/contact"
                className="cursor-pointer rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                확인
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
