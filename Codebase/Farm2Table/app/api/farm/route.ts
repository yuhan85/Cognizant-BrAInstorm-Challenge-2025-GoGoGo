import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateFarm } from '@/lib/data-store'
import { z } from 'zod'

const schema = z.object({
  farmId: z.string(),
  name: z.string().optional(),
  bio: z.string().optional(),
  bannerImage: z.string().optional(),
  videoUrl: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = schema.parse(body)

    const farm = updateFarm(validated.farmId, validated)
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    // Mirror to localStorage on client
    return NextResponse.json({ farm, message: 'Farm updated. Changes saved to memory.' })
  } catch (error) {
    console.error('Farm update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

