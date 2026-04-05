import { HeroSection } from "@/components/templates/hero-section"
import { LandingServiceSection } from "@/components/templates/landing-service-section"
import { LandingVisionSection } from "@/components/templates/landing-vision-section"

export default async function Home() {
  return (
    <>
      <HeroSection />
      <LandingServiceSection />
      <LandingVisionSection />
    </>
  )
}
