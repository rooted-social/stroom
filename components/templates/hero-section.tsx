import Link from "next/link"

import { HeroVideoLayer } from "@/components/templates/hero-video-layer"
import { LandingNavbar } from "@/components/templates/landing-navbar"

const heroSecondaryLinkClass =
  "liquid-glass inline-flex h-auto items-center justify-center rounded-full px-7 py-4 text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/5 hover:shadow-[0_10px_30px_-16px_rgba(110,169,221,0.7)] sm:px-[29px] sm:py-[24px]"

export async function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <HeroVideoLayer />
      <LandingNavbar currentPath="/" />

      <div className="relative z-10 flex min-h-[84vh] flex-col items-center justify-center px-4 pb-7 pt-28 text-center sm:min-h-[98vh] sm:pt-36">
        <div className="silver-badge mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-medium tracking-[0.14em] text-white/90 uppercase sm:mb-6">
          최초의 트레이딩 관리 시스템
        </div>
        <h1
          className="cta-spotlight font-heading whitespace-nowrap text-[clamp(3.1rem,16vw,8.8rem)] leading-[0.98] font-semibold tracking-[-0.024em] text-transparent bg-clip-text sm:text-[clamp(4.6rem,24vw,13.5rem)]"
          style={{
            backgroundImage: "linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)",
          }}
        >
          For Traders
        </h1>

        <p className="cta-spotlight mt-4 max-w-xl text-center text-base leading-4 text-hero-sub opacity-95 sm:max-w-none sm:text-lg sm:leading-8">
          <span className="block sm:inline">나만의 전략 설계, 매매일지, 성과 분석을</span>
          <br className="sm:hidden" />
          <span className="block sm:inline"> 한번에 관리하세요</span>
        </p>

        <div className="mb-10 mt-8 sm:mb-[66px]">
          <Link href="/signup" className={heroSecondaryLinkClass}>
            스트룸 시작하기
          </Link>
        </div>
      </div>
    </section>
  )
}
