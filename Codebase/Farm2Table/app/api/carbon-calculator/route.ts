import { NextRequest, NextResponse } from 'next/server'
import { calculateCarbonReduction } from '@/lib/llm'
import { z } from 'zod'

const schema = z.object({
  trips_per_week: z.number().min(0).max(20),
  km_round_trip: z.number().min(0).max(100).optional().default(8),
  vehicle_class: z.enum(['compact', 'midsize', 'suv', 'truck']).optional().default('midsize'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.parse(body)

    const result = await calculateCarbonReduction(
      validated.trips_per_week,
      validated.km_round_trip,
      validated.vehicle_class
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Carbon calculator error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

