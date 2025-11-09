import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/authOptions'
import { createProduct, updateProduct, getProductById, deleteProduct } from '@/lib/data-store'
import { z } from 'zod'

const createSchema = z.object({
  farmId: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(0),
  available: z.boolean().optional().default(true),
  image: z.string(),
  nutrition: z.object({
    calories: z.number(),
    proteinG: z.number(),
    fiberG: z.number(),
    vitaminCMg: z.number(),
    ironMg: z.number(),
  }).optional(),
})

const updateSchema = z.object({
  productId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  available: z.boolean().optional(),
  image: z.string().optional(),
  nutrition: z.object({
    calories: z.number(),
    proteinG: z.number(),
    fiberG: z.number(),
    vitaminCMg: z.number(),
    ironMg: z.number(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSchema.parse(body)

    // Default nutrition if not provided
    const nutrition = validated.nutrition || {
      calories: 0,
      proteinG: 0,
      fiberG: 0,
      vitaminCMg: 0,
      ironMg: 0,
    }

    const product = createProduct({
      ...validated,
      nutrition,
    })

    return NextResponse.json({ product, message: 'Product created. Changes saved to memory.' })
  } catch (error) {
    console.error('Product create error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body)

    const { productId, ...updates } = validated
    const product = updateProduct(productId, updates)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product, message: 'Product updated. Changes saved to memory.' })
  } catch (error) {
    console.error('Product update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const success = deleteProduct(productId)
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

