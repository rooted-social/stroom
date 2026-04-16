"use client"

import { useEffect, useRef, useState } from "react"

type ScrollRevealProps = {
  children: React.ReactNode
  className?: string
  delayMs?: number
  durationMs?: number
  offsetY?: number
}

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  durationMs = 700,
  offsetY = 22,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleMotionPreferenceChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    handleMotionPreferenceChange()
    mediaQuery.addEventListener("change", handleMotionPreferenceChange)

    const currentElement = elementRef.current
    if (!currentElement || mediaQuery.matches) {
      setIsVisible(true)
      return () => {
        mediaQuery.removeEventListener("change", handleMotionPreferenceChange)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      },
    )

    observer.observe(currentElement)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange)
    }
  }, [])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0, 0, 0)" : `translate3d(0, ${offsetY}px, 0)`,
        transition: prefersReducedMotion
          ? "none"
          : `opacity ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`,
        willChange: prefersReducedMotion ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
