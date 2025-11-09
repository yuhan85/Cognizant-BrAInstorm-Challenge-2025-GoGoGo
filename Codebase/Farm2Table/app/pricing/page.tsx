'use client'

import { Navigation } from '@/components/navigation'
import { AIWidget } from '@/components/ai-widget'
import { PricingCards } from '@/components/pricing-cards'

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
          <p className="text-lg text-gray-600">
            Choose the plan that works best for you
          </p>
        </div>
        <PricingCards />
      </main>
      <AIWidget />
    </div>
  )
}

