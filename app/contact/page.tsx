import Link from "next/link"

import { LandingNavbar } from "@/components/templates/landing-navbar"

const contactItems = [
  {
    title: "도입 상담",
    description: "팀 온보딩, 워크플로우 구성, 권한 정책까지 함께 설계합니다.",
  },
  {
    title: "요금 문의",
    description: "사용자 수, 기능 범위, 데이터 보관 정책 기준으로 안내드립니다.",
  },
  {
    title: "기능 제안",
    description: "실제 매매 루틴에 필요한 기능 요청을 받고 로드맵에 반영합니다.",
  },
]

export default async function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="blue-spotlight-bg" />
      <LandingNavbar currentPath="/contact" />

      <section className="px-4 pb-14 pt-30 sm:px-8 sm:pb-18 sm:pt-36">
        <div className="mx-auto w-full max-w-5xl">
          <header className="text-center">
            <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Contact</p>
            <h1 className="mt-3 font-heading text-3xl tracking-tight text-hero-heading sm:text-4xl">
              도입과 운영을 함께 설계해 드립니다
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              빠르게 검토 후 답변드릴 수 있도록 문의 목적과 현재 운영 방식을 간단히 알려주세요.
            </p>
          </header>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {contactItems.map((item) => (
              <article key={item.title} className="liquid-glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-foreground/75">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-[#6EA9DD]/50 bg-[#3A7BBF]/12 p-6 text-center sm:p-8">
            <p className="text-sm text-foreground/75">빠른 문의</p>
            <p className="mt-2 text-xl font-semibold text-hero-heading sm:text-2xl">hello@stroom.app</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                회원가입 후 시작하기
              </Link>
              <Link href="/pricing" className="liquid-glass rounded-full px-5 py-3 text-sm text-foreground hover:bg-white/5">
                요금제 확인하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
