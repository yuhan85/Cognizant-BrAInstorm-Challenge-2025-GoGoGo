import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getOrders, createOrder, getProductById, getSubscriptionByUserId } from '@/lib/data-store'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    farmId: z.string(),
  })),
  subscriptionId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If user is a driver, return all orders; otherwise return only user's orders
    const orders = session.user.role === 'driver' 
      ? getOrders() // Get all orders for drivers
      : getOrders(session.user.id) // Get only user's orders for customers
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createOrderSchema.parse(body)

    // Verify subscription belongs to user
    const subscription = getSubscriptionByUserId(session.user.id)
    if (!subscription || subscription.id !== validated.subscriptionId) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Calculate total and validate products
    let total = 0
    const orderItems = validated.items.map(item => {
      const product = getProductById(item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
      if (product.farmId !== item.farmId) {
        throw new Error(`Product ${item.productId} does not belong to farm ${item.farmId}`)
      }
      if (!product.available || product.quantity < item.quantity) {
        throw new Error(`Product ${item.productId} is not available in sufficient quantity`)
      }
      total += product.price * item.quantity
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        farmId: item.farmId,
        status: 'created' as const,
      }
    })

    const order = createOrder({
      userId: session.user.id,
      subscriptionId: validated.subscriptionId,
      status: 'created',
      items: orderItems,
      total,
    })

    return NextResponse.json({ order, message: 'Order created successfully' })
  } catch (error) {
    console.error('Create order error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

