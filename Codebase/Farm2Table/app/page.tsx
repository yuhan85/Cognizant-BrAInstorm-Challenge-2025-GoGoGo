import { Navigation } from '@/components/navigation'
import { AIWidget } from '@/components/ai-widget'
import { Hero } from '@/components/hero'
import { ValuePropositions } from '@/components/value-propositions'
import { PartnerFarms } from '@/components/partner-farms'
import { Testimonials } from '@/components/testimonials'
import { CarbonCalculator } from '@/components/carbon-calculator'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <ValuePropositions />
        <PartnerFarms />
        <Testimonials />
        <CarbonCalculator />
        <CTASection />
      </main>
      <Footer />
      <AIWidget />
    </div>
  )
}

