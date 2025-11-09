import { NextRequest, NextResponse } from 'next/server'
import { getFarms } from '@/lib/data-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    const farms = getFarms(cityId || undefined)
    return NextResponse.json({ farms })
  } catch (error) {
    console.error('Get farms error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

