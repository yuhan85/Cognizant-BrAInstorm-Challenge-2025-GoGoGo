import { Navigation } from '@/components/navigation'
import { AIWidget } from '@/components/ai-widget'
import { FarmDetail } from '@/components/farm-detail'

export default async function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <FarmDetail farmId={id} />
      </main>
      <AIWidget />
    </div>
  )
}

