import Link from "next/link"

import { LandingNavbar } from "@/components/templates/landing-navbar"
import { ScrollReveal } from "@/components/templates/scroll-reveal"

const plans = [
  {
    name: "Pro",
    originalPrice: "₩33,000",
    price: "₩14,900",
    unit: "/월",
    description: "실전 트레이더를 위한 분석 중심 단일 플랜",
    features: ["무제한 매매 기록", "시나리오 매매", "성과 및 수익 분석", "사용자 설정 체크리스트"],
    recommended: true,
  },
]

export default async function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="blue-spotlight-bg" />
      <LandingNavbar currentPath="/pricing" />

      <section className="px-4 pb-14 pt-30 sm:px-8 sm:pb-18 sm:pt-36">
        <div className="mx-auto w-full max-w-6xl">
          <ScrollReveal>
            <header className="text-center">
              <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Pricing</p>
              <h1 className="mt-3 font-heading text-3xl tracking-tight text-hero-heading sm:text-4xl">
                단 하나의 실전형 요금제
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
                복잡한 플랜 비교 없이, 핵심 기능을 합리적인 가격으로!
              </p>
            </header>
          </ScrollReveal>

          <ScrollReveal delayMs={120}>
            <div className="relative mx-auto mt-10 max-w-xl">
              <div className="pointer-events-none absolute inset-x-8 -top-12 -z-10 h-56 rounded-full bg-[radial-gradient(circle,rgba(58,123,191,0.34),transparent_68%)] blur-3xl" />
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative overflow-hidden rounded-3xl p-7 ${
                    plan.recommended ? "border border-[#6EA9DD]/60 bg-[#3A7BBF]/12" : "liquid-glass"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,169,221,0.2),transparent_58%)]" />
                  <div className="mb-3 flex items-center justify-between">
                    {plan.recommended ? (
                      <p className="inline-flex rounded-full bg-[#3A7BBF]/30 px-3 py-1 text-xs font-semibold text-[#B7D8F2]">
                        추천
                      </p>
                    ) : null}
                    <p className="inline-flex rounded-full border border-rose-300/60 bg-rose-100/70 px-3 py-1 text-xs font-semibold text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300">
                      초기 유저 한정 혜택
                    </p>
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">{plan.name}</h2>
                  <p className="mt-2 text-sm text-foreground/70">{plan.description}</p>
                  <p className="mt-5 text-sm text-foreground/50 line-through">{plan.originalPrice}</p>
                  <p className="mt-6 text-3xl font-semibold text-hero-heading">
                    {plan.price}
                    <span className="ml-1 text-base font-medium text-foreground/65">{plan.unit}</span>
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-foreground/80">
                    {plan.features.map((feature) => (
                      <li key={feature}>- {feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={220}>
            <p className="mt-5 text-center text-sm font-medium text-foreground/100 sm:text-base">
              현재는 베타 테스트 기간이며, 무료 서비스 이용이 가능합니다. <br />
              정식 출시 후, 유료 전환 시 사전에 미리 안내 예정입니다.
            </p>
            <div className="mx-auto mt-4 flex w-fit items-center justify-center rounded-full border border-[#79B4E8]/60 bg-[#3A7BBF]/15 px-4 py-2 text-xs font-semibold text-[#B7D8F2] shadow-[0_8px_24px_-12px_rgba(58,123,191,0.85)] sm:text-sm">
              베타 유저 혜택 · 무료 이용권 3개월 지급 예정
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={300}>
            <div className="mt-10 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-gradient-to-r from-[#79B4E8] via-[#5C97D3] to-[#3A7BBF] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(58,123,191,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-16px_rgba(58,123,191,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EC5F0]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                무료로 시작하기
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
