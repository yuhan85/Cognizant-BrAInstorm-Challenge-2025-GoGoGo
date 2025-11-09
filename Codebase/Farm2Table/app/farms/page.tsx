'use client'

import { Navigation } from '@/components/navigation'
import { AIWidget } from '@/components/ai-widget'
import { FarmsList } from '@/components/farms-list'

export default function FarmsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Farms</h1>
          <p className="text-lg text-gray-600">
            Discover local farms committed to sustainable agriculture
          </p>
        </div>
        <FarmsList />
      </main>
      <AIWidget />
    </div>
  )
}

