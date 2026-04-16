import { ServiceVisualShowcase } from "@/components/templates/service-visual-showcase"
import { ScrollReveal } from "@/components/templates/scroll-reveal"

const featureItems = [
  {
    title: "계획",
    description: "진입 전 시나리오, 체크리스트, 리스크를 한 번에 정리하여 심리적인 방해 요소를 최소화하고 미리 설계합니다.",
    detail: "진입 조건 / 손절 기준 / 목표가 설정 / 진입 전 메모",
  },
  {
    title: "기록",
    description: "실행한 매매를 빠르게 남기고, 감정과 판단 근거까지 누적하여 나만의 데이터를 축적합니다.",
    detail: "진입 정보 / 차트 캡처 / 심리 메모 / 실행 평가",
  },
  {
    title: "분석",
    description: "복기 데이터를 기반으로 승률, 손익, 포지션 편향을 추적하여 더 나은 매매로 개선합니다.",
    detail: "매매 및 편향 분석 / 시간대별 성과 / AI 분석 개선 방안(도입 예정)",
  },
]

export function LandingServiceSection() {
  return (
    <section id="service" className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(58,123,191,0.3),transparent_65%)] blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <ScrollReveal>
          <ServiceVisualShowcase />
        </ScrollReveal>

        <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent sm:mt-12" />

        <ScrollReveal delayMs={120}>
          <div className="mb-10 mt-10 space-y-3 text-center sm:mb-14 sm:mt-12">
            <p className="text-sm tracking-[0.16em] text-foreground/60 uppercase">Service</p>
            <h2 className="cta-spotlight font-heading whitespace-nowrap text-[clamp(1.42rem,3.9vw,1.5rem)] tracking-tight text-hero-heading sm:text-4xl">
              "성공은 단순한 행동에서 시작됩니다."
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">
              트레이딩을 계획하고, 기록하고, 분석하여 시스템화 하세요.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={210}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item, index) => {
              const delayClass = index === 0 ? "motion-safe:delay-75" : index === 1 ? "motion-safe:delay-150" : "motion-safe:delay-300"

              return (
                <article
                  key={item.title}
                  className={`liquid-glass group rounded-2xl p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.03] motion-safe:animate-[fadeInUp_900ms_ease-out_both] ${delayClass} sm:p-6`}
                >
                  <p className="text-xs tracking-[0.14em] text-foreground/50 uppercase">{item.title}</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {item.title === "계획"
                      ? "전략을 설계하세요"
                      : item.title === "기록"
                        ? "데이터를 쌓으세요"
                        : "성과를 최적화하세요"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-foreground/75">{item.description}</p>
                  <p className="mt-4 text-xs text-foreground/55">{item.detail}</p>
                  <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[30%] bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] transition-all duration-700 group-hover:w-full [clip-path:polygon(0_0,92%_0,100%_50%,92%_100%,0_100%)]" />
                  </div>
                </article>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
