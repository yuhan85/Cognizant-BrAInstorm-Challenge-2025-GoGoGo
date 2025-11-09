import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/data-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const cityId = searchParams.get('cityId')

    const products = getProducts(farmId || undefined, cityId || undefined)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

