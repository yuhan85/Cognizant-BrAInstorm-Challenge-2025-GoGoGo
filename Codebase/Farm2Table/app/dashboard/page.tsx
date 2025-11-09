'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { AIWidget } from '@/components/ai-widget'
import { FarmerDashboard } from '@/components/farmer-dashboard'
import { CustomerDashboard } from '@/components/customer-dashboard'
import { DriverDashboard } from '@/components/driver-dashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        {session.user.role === 'farmer' ? (
          <FarmerDashboard />
        ) : session.user.role === 'driver' ? (
          <DriverDashboard />
        ) : (
          <CustomerDashboard />
        )}
      </main>
      <AIWidget />
    </div>
  )
}

