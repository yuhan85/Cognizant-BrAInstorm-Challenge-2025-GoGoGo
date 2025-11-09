import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getProducts, getSubscriptionByUserId, getCityById } from '@/lib/data-store'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = getSubscriptionByUserId(session.user.id)
    if (!subscription || subscription.plan !== 'basic') {
      return NextResponse.json({ error: 'Not a basic plan user' }, { status: 400 })
    }

    // Get products from city
    const products = getProducts(undefined, subscription.cityId)
    const availableProducts = products.filter(p => p.available && p.quantity > 0)

    // Generate weekly bundle (simple rule: pick 5 random products)
    const bundle = availableProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: 1,
        unit: p.unit,
        price: p.price,
        farmId: p.farmId,
      }))

    return NextResponse.json({ items: bundle })
  } catch (error) {
    console.error('Get weekly bundle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = getSubscriptionByUserId(session.user.id)
    if (!subscription || subscription.plan !== 'basic') {
      return NextResponse.json({ error: 'Not a basic plan user' }, { status: 400 })
    }

    // Generate new weekly bundle
    const products = getProducts(undefined, subscription.cityId)
    const availableProducts = products.filter(p => p.available && p.quantity > 0)

    const bundle = availableProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: 1,
        unit: p.unit,
        price: p.price,
        farmId: p.farmId,
      }))

    // Store in localStorage on client
    return NextResponse.json({ items: bundle, message: 'Weekly bundle generated' })
  } catch (error) {
    console.error('Generate weekly bundle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

