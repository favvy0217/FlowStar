import { LandingHeader, Hero } from '@/components/landing/hero'
import {
  Features,
  HowItWorks,
  UseCases,
  CTA,
  Footer,
} from '@/components/landing/sections'

export default function LandingPage() {
  return (
    <div className="relative min-h-svh">
      <LandingHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <CTA />
      <Footer />
    </div>
  )
}
