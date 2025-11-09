import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/authOptions'
import { getNutritionAdvice } from '@/lib/llm'
import { getProductById, getProducts } from '@/lib/data-store'
import { z } from 'zod'

const schema = z.object({
  weeklyItems: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
  })),
  allergies: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = schema.parse(body)

    // Build weekly items table with nutrition and calculate totals
    let totalCalories = 0
    let totalProtein = 0
    let totalFiber = 0
    let totalVitaminC = 0
    let totalIron = 0

    const itemsTable = validated.weeklyItems
      .map(item => {
        const product = getProductById(item.id)
        if (!product) return null
        const nutrition = product.nutrition
        const quantity = item.quantity || 1
        totalCalories += nutrition.calories * quantity
        totalProtein += nutrition.proteinG * quantity
        totalFiber += nutrition.fiberG * quantity
        totalVitaminC += nutrition.vitaminCMg * quantity
        totalIron += nutrition.ironMg * quantity
        return `${product.name} (${item.quantity} ${product.unit}): ${nutrition.calories} cal, ${nutrition.proteinG}g protein, ${nutrition.fiberG}g fiber, ${nutrition.vitaminCMg}mg vitamin C, ${nutrition.ironMg}mg iron`
      })
      .filter(Boolean)
      .join('\n')

    const allergiesAndNotes = validated.allergies || 'None'

    const result = await getNutritionAdvice(allergiesAndNotes, itemsTable)

    // Add weekly totals to result
    return NextResponse.json({
      ...result,
      weeklyTotals: {
        calories: Math.round(totalCalories * 100) / 100,
        proteinG: Math.round(totalProtein * 100) / 100,
        fiberG: Math.round(totalFiber * 100) / 100,
        vitaminCMg: Math.round(totalVitaminC * 100) / 100,
        ironMg: Math.round(totalIron * 100) / 100,
      },
    })
  } catch (error) {
    console.error('Nutrition advice error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

