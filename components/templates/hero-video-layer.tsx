"use client"

import { useEffect, useRef } from "react"

export function HeroVideoLayer() {
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

      video.style.opacity = Math.max(0, Math.min(1, nextOpacity)).toString()
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    }
  }, [])

  return (
    <>
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
      <div className="absolute inset-0 bg-gradient-to-b from-background/88 via-background/65 to-background" />
    </>
  )
}
