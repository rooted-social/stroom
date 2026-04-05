import Link from "next/link"

import { LandingNavbar } from "@/components/templates/landing-navbar"

const plans = [
  {
    name: "Starter",
    price: "₩0",
    unit: "/월",
    description: "개인 학습 및 루틴 정착을 위한 기본 플랜",
    features: ["매매 기록 100건", "기본 복기 리포트", "기본 시나리오 템플릿"],
  },
  {
    name: "Pro",
    price: "₩19,000",
    unit: "/월",
    description: "실전 트레이더를 위한 분석 중심 플랜",
    features: ["무제한 매매 기록", "심화 성과 분석", "사용자 설정 체크리스트", "우선 지원"],
    recommended: true,
  },
  {
    name: "Team",
    price: "문의",
    unit: "",
    description: "트레이딩 팀/커뮤니티 운영을 위한 협업 플랜",
    features: ["워크스페이스 공유", "운영자 권한 관리", "맞춤 온보딩", "전담 지원"],
  },
]

export default async function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="blue-spotlight-bg" />
      <LandingNavbar currentPath="/pricing" />

      <section className="px-4 pb-14 pt-30 sm:px-8 sm:pb-18 sm:pt-36">
        <div className="mx-auto w-full max-w-6xl">
          <header className="text-center">
            <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Pricing</p>
            <h1 className="mt-3 font-heading text-3xl tracking-tight text-hero-heading sm:text-4xl">
              팀 규모와 숙련도에 맞는 요금제
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              먼저 무료로 시작하고, 기록량과 분석 깊이에 맞춰 유연하게 확장할 수 있습니다.
            </p>
          </header>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-3xl p-6 ${
                  plan.recommended ? "border border-[#6EA9DD]/60 bg-[#3A7BBF]/12" : "liquid-glass"
                }`}
              >
                {plan.recommended ? (
                  <p className="mb-3 inline-flex rounded-full bg-[#3A7BBF]/30 px-3 py-1 text-xs font-semibold text-[#B7D8F2]">
                    추천
                  </p>
                ) : null}
                <h2 className="text-2xl font-semibold text-foreground">{plan.name}</h2>
                <p className="mt-2 text-sm text-foreground/70">{plan.description}</p>
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

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
