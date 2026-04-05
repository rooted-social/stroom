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
          나만의 트레이딩 관리 시스템
        </div>
        <h1
          className="cta-spotlight font-heading text-[clamp(4.6rem,24vw,13.5rem)] leading-[0.98] font-semibold tracking-[-0.024em] text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)",
          }}
        >
          For Traders
        </h1>

        <p className="cta-spotlight mt-4 max-w-xl text-center text-base leading-7 text-hero-sub opacity-95 sm:text-lg sm:leading-8">
          스트룸은 나만의 매매 시나리오를 계획하고, 매매일지도 작성하며
          <br />
          데이터를 쌓아, 더 나은 매매로 성장하게 합니다.
        </p>

        <div className="mb-10 mt-8 sm:mb-[66px]">
          <Link href="/signup" className={heroSecondaryLinkClass}>
            매매일지 만들기
          </Link>
        </div>
      </div>
    </section>
  )
}
