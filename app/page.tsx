import type { Metadata } from "next"

import { LandingFaqSection } from "@/components/templates/landing-faq-section"
import { HeroSection } from "@/components/templates/hero-section"
import { LandingServiceSection } from "@/components/templates/landing-service-section"
import { LandingVisionSection } from "@/components/templates/landing-vision-section"
import { landingFaqItems } from "@/lib/content/landing-faq"

export const metadata: Metadata = {
  title: "스트룸 - 트레이더를 위한 매매일지 | 트레이딩 관리와 성과 관리 한 번에",
  description:
    "실전 트레이더를 위한 매매일지 웹서비스. 성과 관리, 거래 복기, 리스크 관리 기능을 통해 매매 습관을 데이터 기반으로 점검할 수 있습니다.",
  alternates: {
    canonical: "/",
  },
}

export default async function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landingFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HeroSection />
      <LandingServiceSection />
      <LandingFaqSection />
      <LandingVisionSection />
    </>
  )
}
