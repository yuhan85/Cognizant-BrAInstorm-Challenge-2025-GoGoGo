import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { callLLM } from '@/lib/llm'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.farmId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { analytics } = await request.json()

    const systemPrompt = `You are an expert agricultural business analyst. Analyze farm sales data and return structured JSON insights. Focus on weather impact, demand planning, and local consumer preferences.`

    const userPrompt = `Analyze the farm sales data and return a JSON object with exactly three sections.

OUTPUT FORMAT (JSON only, no markdown, no code blocks):
{
  "weatherImpact": {
    "title": "Weather Impact Analysis",
    "insights": [
      "Insight 1 about weather impact",
      "Insight 2 about weather impact",
      "Insight 3 about weather impact"
    ]
  },
  "demandPlanning": {
    "title": "Demand Planning",
    "insights": [
      "Insight 1 about demand planning",
      "Insight 2 about demand planning",
      "Insight 3 about demand planning"
    ]
  },
  "consumerPreferences": {
    "title": "Local Consumer Preferences",
    "insights": [
      "Insight 1 about consumer preferences",
      "Insight 2 about consumer preferences",
      "Insight 3 about consumer preferences"
    ]
  }
}

REQUIREMENTS:
- Return ONLY valid JSON, no other text
- Each section must have exactly 3-5 insights
- Insights should be concise, actionable, and agriculture-relevant
- Use specific numbers and percentages from the data when available
- If data is missing, provide generic but relevant insights

Data:
${JSON.stringify(analytics, null, 2)}`

    const insights = await callLLM(userPrompt, systemPrompt)

    return NextResponse.json({ insights })
  } catch (error: any) {
    console.error('AI insights error:', error)
    const errorMessage = error?.message || 'Unknown error'
    
    // Handle rate limiting specifically
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('Too Many Requests')) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          insights: 'The AI service is currently experiencing high demand. Please wait a moment and try again. Rate limits are in place to ensure fair usage for all users.',
          rateLimited: true
        },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { 
        error: `Failed to get AI insights: ${errorMessage}`,
        insights: 'Sorry, I encountered an error while analyzing your data. Please try again later.'
      },
      { status: 500 }
    )
  }
}

