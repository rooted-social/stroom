import Link from "next/link"

const visionLines = [
  "'매매와 수익일지를 작성하고 싶어요.'",
  "'감정이 아닌 데이터로 판단하고 싶어요.'",
  "'매매 원칙을 일관되게 지키고 싶어요.'",
  "'이기는 트레이딩 습관을 만들고 싶어요.'",
]

export function LandingVisionSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-18 sm:px-8 sm:pb-28 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl text-center">
        <div className="space-y-3">
          <p className="text-sm tracking-[0.16em] text-foreground/60 uppercase">Suggestion</p>
          <h2 className="cta-spotlight font-heading text-3xl font-semibold text-hero-heading sm:text-5xl">당신의 트레이딩은 괜찮나요?</h2>
          <p className="mx-auto max-w-3xl text-sm text-foreground/72 sm:text-lg">
            아래와 같은 분에게는 스트룸을 추천해요.
          </p>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center leading-none text-white/45 sm:mb-8 mt-6">
          <span className="text-xl sm:text-2xl">.</span>
          <span className="-mt-1 text-xl sm:text-2xl">.</span>
          <span className="-mt-1 text-xl sm:text-2xl">.</span>
        </div>

        <div className="mb-12 mt-11 space-y-7 sm:mb-14 sm:mt-14 sm:space-y-18">
          {visionLines.slice(0, 2).map((line) => (
            <p key={line} className="font-heading text-xl font-semibold text-white/52 sm:text-5xl">
              {line}
            </p>
          ))}

          <p className="font-heading text-2xl font-semibold text-hero-heading sm:text-6xl">
            &apos;나의 매매를 개선하고 싶어요.&apos;
          </p>

          {visionLines.slice(2).map((line) => (
            <p key={line} className="font-heading text-xl font-semibold text-white/52 sm:text-5xl">
              {line}
            </p>
          ))}
        </div>

        <div className="mb-6 -mt-5 flex flex-col items-center justify-center leading-none text-white/45 sm:mb-15">
          <span className="text-xl sm:text-2xl">.</span>
          <span className="-mt-1 text-xl sm:text-2xl">.</span>
          <span className="-mt-1 text-xl sm:text-2xl">.</span>
        </div>

        <p className="cta-spotlight mt-8 mb-8 text-2xl font-semibold sm:mt-10 sm:mb-20 sm:text-6xl">
          이제 스트룸으로 관리하세요!
        </p>

        <Link
          href="/waitinglist"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#6EA9DD] to-[#3A7BBF] px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:px-8 sm:py-3.5 sm:text-base"
        >
          지금 대기 등록하기
        </Link>
      </div>
    </section>
  )
}
