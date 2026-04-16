"use client"

import { useState } from "react"

import { ScrollReveal } from "@/components/templates/scroll-reveal"
import { landingFaqItems } from "@/lib/content/landing-faq"

export function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24" aria-labelledby="landing-faq-heading">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(58,123,191,0.18),transparent_70%)]" />
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <ScrollReveal>
          <div className="mb-8 space-y-3 text-center sm:mb-10">
            <p className="text-sm tracking-[0.16em] text-foreground/60 uppercase">FAQ</p>
            <h2 id="landing-faq-heading" className="cta-spotlight font-heading text-3xl font-semibold text-hero-heading sm:text-5xl">
              자주 묻는 질문
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-foreground/72 sm:text-base">
              핵심 질문만 간단하게 정리했습니다.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={140}>
          <div className="space-y-3">
            {landingFaqItems.map((item, index) => {
              const isOpen = openIndex === index

              return (
                <article
                  key={item.question}
                  className="liquid-glass overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleItem(index)}
                      aria-expanded={isOpen}
                      aria-controls={`landing-faq-panel-${index}`}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-6 sm:py-5"
                    >
                      <span className="text-sm font-medium text-foreground sm:text-base">{item.question}</span>
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`landing-faq-panel-${index}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-7 text-foreground/75 sm:px-6 sm:pb-6">{item.answer}</p>
                    </div>
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
