import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/authOptions'
import analyticsData from '@/data/analytics.json'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.farmId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return the analytics data from the JSON file
    // In a real app, you would filter by farmId, but for demo purposes we return all data
    return NextResponse.json({ analytics: analyticsData })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

