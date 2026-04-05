"use client"

import Image from "next/image"
import { useState } from "react"

type ShowcaseItem = {
  label: string
  imageSrc: string
  title: string
  description: string
}

const showcaseItems: ShowcaseItem[] = [
  {
    label: "트레이딩 인사이트",
    imageSrc: "/images/service/insight.JPG",
    title: "트레이딩 인사이트 대시보드",
    description: "핵심 성과와 포지션별 패턴을 한눈에 확인하고 관리합니다.",
  },
  {
    label: "시나리오",
    imageSrc: "/images/service/scenario.JPG",
    title: "진입 전 시나리오 작성",
    description: "진입 기준, 손절/목표가, 체크리스트를 미리 기록해 일관된 매매 판단을 돕습니다.",
  },
  {
    label: "매매일지",
    imageSrc: "/images/service/journal.JPG",
    title: "실행 중심 매매일지",
    description: "체결 근거, 심리 상태, 차트 스냅샷을 한 화면에서 연결해 나만의 데이터를 축적합니다.",
  },
  {
    label: "매매일지 상세",
    imageSrc: "/images/service/journal1.JPG",
    title: "매매일지 상세 기록",
    description: "기본 정보부터 진입/탈출 근거, 메모와 복기까지 한 화면에서 체계적으로 확인합니다.",
  },
  {
    label: "성과 분석",
    imageSrc: "/images/service/analysis.JPG",
    title: "반복 가능한 매매 분석",
    description: "승패 패턴과 실수 유형을 자동 분류해 개선 포인트를 일관되게 축적합니다.",
  },
]

export function ServiceVisualShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = showcaseItems[activeIndex]

  return (
    <section className="mt-10 sm:mt-14">
      <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent sm:mb-10" />

      <header className="mb-5 text-center sm:mb-6">
        <p className="text-xs tracking-[0.16em] text-foreground/55 uppercase">Features</p>
        <h2 className="cta-spotlight mt-2 font-heading text-2xl tracking-tight text-hero-heading sm:text-4xl">
            트레이더를 위한 올인원 워크플로우
          </h2>
        <p className="mt-2 text-sm text-foreground/72 sm:text-base">
          어떤 기능을 제공하는지 한 눈에 살펴보세요
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {showcaseItems.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 sm:text-sm ${
                isActive
                  ? "bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] text-white shadow-[0_6px_22px_-12px_rgba(110,169,221,0.9)]"
                  : "liquid-glass text-foreground/80 hover:bg-white/[0.04] hover:text-foreground"
              }`}
              aria-pressed={isActive}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <article className="liquid-glass relative overflow-hidden rounded-3xl p-3 sm:p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(58,123,191,0.25),transparent_60%)]" />
        <div key={activeItem.label} className="relative motion-safe:animate-[fadeInUp_500ms_ease-out_both]">
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={activeItem.imageSrc}
              alt={activeItem.label}
              width={1600}
              height={900}
              className="h-auto w-full object-cover transition duration-500"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>

          <div className="mt-4 px-1 pb-1 sm:mt-5">
            <h3 className="text-lg font-semibold text-hero-heading sm:text-xl">{activeItem.title}</h3>
            <p className="mt-1.5 text-sm leading-7 text-foreground/75">{activeItem.description}</p>
          </div>
        </div>
      </article>
    </section>
  )
}
