"use client"

import { useEffect, useRef } from "react"

const brands = ["Vortex", "Nimbus", "Prysma", "Cirrus", "Kynder", "Halcyn"]

export function SocialProofSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const restartTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const fadeDuration = 0.5

    const updateOpacity = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      const currentTime = video.currentTime

      let nextOpacity = 1

      if (currentTime < fadeDuration) {
        nextOpacity = currentTime / fadeDuration
      } else if (duration > 0 && duration - currentTime < fadeDuration) {
        nextOpacity = (duration - currentTime) / fadeDuration
      }

      const clamped = Math.max(0, Math.min(1, nextOpacity))
      video.style.opacity = clamped.toString()
      rafRef.current = requestAnimationFrame(updateOpacity)
    }

    const handleEnded = () => {
      video.style.opacity = "0"
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current)
      }

      restartTimerRef.current = window.setTimeout(() => {
        video.currentTime = 0
        void video.play()
      }, 100)
    }

    rafRef.current = requestAnimationFrame(updateOpacity)
    video.addEventListener("ended", handleEnded)
    void video.play()

    return () => {
      video.removeEventListener("ended", handleEnded)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current)
      }
    }
  }, [])

  const marqueeBrands = [...brands, ...brands]

  return (
    <section className="relative w-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative z-10 flex flex-col items-center gap-20 px-4 pb-24 pt-16">
        <div className="h-40" />

        <div className="flex w-full max-w-5xl items-center gap-10">
          <p className="shrink-0 whitespace-nowrap text-sm text-foreground/50">
            Relied on by brands
            <br />
            across the globe
          </p>

          <div className="flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-16">
              {marqueeBrands.map((brand, index) => (
                <div key={`${brand}-${index}`} className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <div className="liquid-glass flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
                    {brand.charAt(0)}
                  </div>
                  <span className="text-base font-semibold text-foreground">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
