import Link from "next/link"

import { LandingNavbar } from "@/components/templates/landing-navbar"

const contactItems = [
  {
    title: "기능 제안",
    description: "실제 트레이딩 루틴에 필요한 기능 아이디어를 보내주시면 우선순위를 검토해 반영합니다.",
  },
  {
    title: "요금 문의",
    description: "플랜 구성, 할인 적용, 결제 방식 등 요금 관련 질문을 빠르게 안내해드립니다.",
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
              고객 문의
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              문의 내용을 메일로 남겨주시면 확인 후 빠르게 답변드리겠습니다.
            </p>
          </header>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {contactItems.map((item) => (
              <article key={item.title} className="liquid-glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-foreground/75">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-[#6EA9DD]/50 bg-[#3A7BBF]/12 p-6 text-center sm:p-8">
            <p className="text-sm text-foreground/75">빠른 문의</p>
            <p className="mt-2 text-xl font-semibold text-hero-heading sm:text-2xl">hello@stroom.app</p>
            <p className="mt-2 text-xs text-foreground/65">기능 제안 / 요금 문의를 메일로 보내주세요.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:hello@stroom.app"
                className="rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                메일로 문의하기
              </a>
              <Link
                href="/pricing"
                className="liquid-glass rounded-full px-5 py-3 text-sm text-foreground hover:bg-white/5"
              >
                요금제 확인하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
