import Link from "next/link"

import { HeroVideoLayer } from "@/components/templates/hero-video-layer"
import { LandingNavbar } from "@/components/templates/landing-navbar"

const heroSecondaryLinkClass =
  "liquid-glass inline-flex h-auto items-center justify-center rounded-full border border-[#8FC2ED]/45 bg-[linear-gradient(135deg,rgba(110,169,221,0.2),rgba(255,255,255,0.06))] px-7 py-4 font-medium text-[#EAF4FF] shadow-[0_14px_34px_-18px_rgba(110,169,221,0.82)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#A6D2F7]/65 hover:shadow-[0_18px_42px_-18px_rgba(110,169,221,0.95)] sm:px-[29px] sm:py-[24px]"

export async function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <HeroVideoLayer />
      <LandingNavbar currentPath="/" />

      <div className="relative z-10 flex min-h-[84vh] flex-col items-center justify-center px-4 pb-7 pt-28 text-center sm:min-h-[98vh] sm:pt-36">
        <div className="silver-badge mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-medium tracking-[0.14em] text-white/90 uppercase sm:mb-6">
          매매일지 및 트레이딩 분석 서비스, 스트룸!
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
          <span className="block sm:inline"> 한 곳에서 관리하세요</span>
        </p>

        <div className="mb-10 mt-8 sm:mb-[66px]">
          <Link href="/waitinglist" className={heroSecondaryLinkClass}>
            사전 등록하기
          </Link>
        </div>
      </div>
    </section>
  )
}
