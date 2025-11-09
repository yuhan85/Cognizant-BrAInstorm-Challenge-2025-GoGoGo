import { NextRequest, NextResponse } from 'next/server'
import { callLLM, getTextEmbedding } from '@/lib/llm'
import { getRAGDocuments } from '@/lib/data-store'
import { cosineSimilarity } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, cityId, role, history } = body

    // Get RAG documents
    const ragDocs = getRAGDocuments()
    let filteredDocs = ragDocs

    // Filter by city if provided
    if (cityId) {
      filteredDocs = filteredDocs.filter(doc => doc.city === cityId || !doc.city)
    }

    // Get embedding for user message
    let queryEmbedding: number[] = []
    try {
      queryEmbedding = await getTextEmbedding(message)
    } catch (error) {
      console.error('Embedding error:', error)
    }

    // Find top matches using cosine similarity
    const matches = filteredDocs
      .map(doc => ({
        doc,
        similarity: queryEmbedding.length > 0 && doc.embedding.length > 0
          ? cosineSimilarity(queryEmbedding, doc.embedding)
          : 0.5, // fallback similarity
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)

    // Build system prompt
    const systemPrompt = `You are a helpful assistant for Farm2Table, a platform connecting local farms to customers. 
Brand tone: friendly, sustainable, community-focused.
Mission: We pledge to donate 30% of our net income or equivalent food to local community partners like food banks.
Plan rules:
- Basic plan: Weekly fixed bundle, users can remove items before cutoff but cannot add
- Premium plan: Build your own weekly box, choose delivery date and time, can skip weeks
Only use information from the provided context. If you don't know something, say so.`

    // Build context from matches
    const context = matches
      .map(m => `[${m.doc.title}]: ${m.doc.text}`)
      .join('\n\n')

    const userPrompt = `Context:
${context}

User question: ${message}

Provide a concise, helpful answer based on the context above. Include source titles when referencing specific information.`

    let response: string
    try {
      response = await callLLM(userPrompt, systemPrompt)
    } catch (error: any) {
      console.error('LLM API call error:', error)
      const errorMessage = error?.message || 'Unknown error'
      
      // Check for specific error types
      const isApiKeyIssue = errorMessage.includes('API_KEY') || errorMessage.includes('api key') || errorMessage.includes('API key') || errorMessage.includes('GEMINI') || errorMessage.includes('Gemini')
      
      if (isApiKeyIssue) {
        return NextResponse.json(
          { 
            error: 'GEMINI_API_KEY is not configured or invalid. Please check your .env.local file.',
            response: 'Sorry, the AI assistant is not configured. Please check your API key configuration at https://aistudio.google.com/app/apikey'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: `Failed to get AI response: ${errorMessage}`,
          response: 'Sorry, I encountered an error while processing your request. Please try again later.'
        },
        { status: 500 }
      )
    }

    // Extract sources
    const sources = matches.map(m => ({
      id: m.doc.id,
      title: m.doc.title,
    }))

    return NextResponse.json({ response, sources })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to get AI response',
        response: 'Sorry, I encountered an error. Please try again.'
      },
      { status: 500 }
    )
  }
}

