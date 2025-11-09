import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { callLLM } from '@/lib/llm'
import { getProductById } from '@/lib/data-store'
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

    // Build list of available foods from weekly items
    const availableFoods = validated.weeklyItems
      .map(item => {
        const product = getProductById(item.id)
        if (!product) return null
        return `${product.name} (${item.quantity} ${product.unit})`
      })
      .filter(Boolean)
      .join(', ')

    const allergies = validated.allergies || 'None'

    const systemPrompt = `You are a creative chef and nutritionist. Generate delicious, healthy recipes using the available ingredients. Consider dietary restrictions and allergies.`

    const userPrompt = `Based on the following ingredients available in the weekly box:
${availableFoods}

Allergies/Dietary Restrictions: ${allergies}

Please generate a detailed recipe recommendation that:
1. Uses as many of the available ingredients as possible
2. Is healthy and nutritious
3. Takes into account any allergies or dietary restrictions
4. Includes clear instructions

Return the recipe in the following JSON format:
{
  "title": "Recipe name",
  "description": "Brief description of the recipe",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "servings": number,
  "prepTime": "X minutes",
  "cookTime": "X minutes",
  "nutritionalNotes": "Brief note about the nutritional benefits"
}

Return only valid JSON, no markdown formatting.`

    const response = await callLLM(userPrompt, systemPrompt)
    
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const recipe = JSON.parse(jsonMatch[0])
        return NextResponse.json({ recipe })
      } catch (e) {
        console.error('Failed to parse recipe JSON:', e)
      }
    }

    // Fallback if JSON parsing fails
    return NextResponse.json({
      recipe: {
        title: 'Custom Recipe',
        description: 'A delicious recipe using your weekly ingredients',
        ingredients: availableFoods.split(', '),
        instructions: ['Prepare all ingredients', 'Follow your favorite cooking method', 'Enjoy!'],
        servings: 4,
        prepTime: '15 minutes',
        cookTime: '30 minutes',
        nutritionalNotes: 'This recipe uses fresh ingredients from your weekly box.',
      },
    })
  } catch (error) {
    console.error('Recipe generation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

