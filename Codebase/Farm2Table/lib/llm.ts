import { GoogleGenerativeAI } from '@google/generative-ai';
import { CarbonCalculatorResult, NutritionAdvisorResult } from './types';

// Get API key helper for Google Gemini
const getApiKey = () => {
  const rawKey = process.env.GEMINI_API_KEY
  const key = rawKey?.trim() || ''
  
  // Google Gemini API keys are typically at least 20 characters
  if (!key || key === 'your_gemini_api_key_here') {
    console.error('getApiKey failed: API key not set or placeholder value')
    return ''
  }
  
  if (key.length < 20) {
    console.error('getApiKey failed: API key too short (expected at least 20 characters)', {
      keyLength: key.length,
      keyPreview: key.substring(0, 5) + '...',
    })
    return ''
  }
  
  return key
}

// Initialize genAI instance
let genAI: GoogleGenerativeAI | null = null

const getGenAI = () => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please check your .env.local file.')
  }
  
  // Recreate if API key changed or not initialized
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

// Gemini 2.0 Flash model name
const GEMINI_MODEL = 'gemini-2.0-flash-exp'

/**
 * Call Google Gemini 2.0 Flash model
 */
export async function callLLM(prompt: string, systemPrompt?: string, retries: number = 3): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) {
    const rawKey = process.env.GEMINI_API_KEY
    if (!rawKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file. Get your API key from https://aistudio.google.com/app/apikey')
    }
    if (rawKey.trim() === 'your_gemini_api_key_here' || rawKey.trim().length < 20) {
      throw new Error('GEMINI_API_KEY is invalid. Please check your .env.local file. API key should be at least 20 characters long. Get your API key from https://aistudio.google.com/app/apikey')
    }
    throw new Error('GEMINI_API_KEY is not configured correctly. Please check your .env.local file.')
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const ai = getGenAI()
      const model = ai.getGenerativeModel({ model: GEMINI_MODEL })
      
      // Build the full prompt with system instruction if provided
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
      
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      return response.text()
    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error'
      console.error('Gemini API error:', errorMsg)
      
      // Handle rate limiting (429) with retry
      if ((errorMsg.includes('429') || errorMsg.includes('Too Many Requests') || errorMsg.includes('Resource exhausted')) && attempt < retries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${waitTime}ms... (attempt ${attempt + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      // Handle specific error types
      if (errorMsg.includes('API_KEY') || errorMsg.includes('api key') || errorMsg.includes('API key')) {
        throw new Error(`Gemini API error: Invalid API key. Please check your GEMINI_API_KEY in .env.local file. Get your API key from https://aistudio.google.com/app/apikey`)
      }
      
      if (errorMsg.includes('not found') || errorMsg.includes('404')) {
        throw new Error(`Gemini API error: Model ${GEMINI_MODEL} not found. Please check if the model name is correct or try a different model.`)
      }
      
      if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests') || errorMsg.includes('Resource exhausted')) {
        throw new Error(`Gemini API error: Rate limit exceeded (429 Too Many Requests). Please wait a moment and try again. The API has usage limits - you may need to wait before making more requests.`)
      }
      
      throw new Error(`Failed to call Gemini API: ${errorMsg}`)
    }
  }
  
  throw new Error('Failed to call Gemini API after retries')
}


/**
 * Get text embedding using Hugging Face embedding model
 * Note: Google Gemini API doesn't provide embeddings, so we still use Hugging Face for embeddings
 * Falls back to simple hash-based embedding if API fails
 */
export async function getTextEmbedding(text: string): Promise<number[]> {
  // Use Hugging Face API for embeddings (Google Gemini doesn't provide embedding API)
  const hfApiKey = process.env.HUGGINGFACE_API_KEY?.trim() || ''
  
  if (!hfApiKey || hfApiKey === 'your_huggingface_api_key_here' || hfApiKey.length < 20) {
    // Fallback to hash-based embedding if no HF API key
    return generateHashEmbedding(text)
  }

  try {
    // Use a general embedding model like sentence-transformers
    const response = await fetch(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    )

    if (response.ok) {
      const data = await response.json()
      // Handle different embedding response formats
      // Format 1: [[0.1, 0.2, ...]] - array of arrays
      if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0])) {
          return data[0] // Return first embedding vector
        }
        // Format 2: [0.1, 0.2, ...] - single array
        if (typeof data[0] === 'number') {
          return data
        }
      }
      // Format 3: { embeddings: [[0.1, 0.2, ...]] }
      if (data.embeddings && Array.isArray(data.embeddings) && data.embeddings.length > 0) {
        return Array.isArray(data.embeddings[0]) ? data.embeddings[0] : data.embeddings
      }
    }
  } catch (error) {
    console.error('Hugging Face embedding error:', error)
  }

  // Fallback to hash-based embedding
  return generateHashEmbedding(text)
}

/**
 * Generate a simple hash-based embedding as fallback
 */
function generateHashEmbedding(text: string): number[] {
  return Array.from({ length: 384 }, (_, i) => {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), i)
    return (hash % 200 - 100) / 100
  })
}

/**
 * Calculate carbon reduction using LLM
 */
export async function calculateCarbonReduction(
  tripsPerWeek: number,
  kmRoundTrip: number = 8,
  vehicleClass: 'compact' | 'midsize' | 'suv' | 'truck' = 'midsize'
): Promise<CarbonCalculatorResult> {
  const vehicleEmissions: Record<string, number> = {
    compact: 0.12,
    midsize: 0.15,
    suv: 0.18,
    truck: 0.22,
  };
  
  const kgPerKm = vehicleEmissions[vehicleClass] || 0.15;
  const deterministicEstimate = tripsPerWeek * kmRoundTrip * kgPerKm * 4.33; // Monthly
  
  const systemPrompt = `You are an analyst estimating monthly CO2 reduction for a household that uses a Farm2Table subscription. Be conservative and show the math clearly.`;
  
  const userPrompt = `Inputs:
Trips per week: ${tripsPerWeek}
Round trip distance km: ${kmRoundTrip}
Vehicle class: ${vehicleClass} (${kgPerKm} kg CO2 per km)

Assumptions:
Using Farm2Table eliminates those private car trips. Delivery is route optimized and shared. Allocate twenty percent of a delivery van trip to each household.

Task:
Return JSON with:
- estimated_monthly_kg_co2_saved: number
- assumptions: list of strings
- explanation: short string

Return only valid JSON, no markdown formatting.`;

  try {
    const response = await callLLM(userPrompt, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        estimated_monthly_kg_co2_saved: parsed.estimated_monthly_kg_co2_saved || deterministicEstimate,
        assumptions: parsed.assumptions || [],
        explanation: parsed.explanation || 'Estimated based on reduced trips.',
      };
    }
  } catch (error) {
    console.error('LLM carbon calculation error:', error);
  }
  
  return {
    estimated_monthly_kg_co2_saved: Math.round(deterministicEstimate * 100) / 100,
    assumptions: [
      `Eliminates ${tripsPerWeek} trips per week`,
      `Round trip distance: ${kmRoundTrip} km`,
      `Vehicle emissions: ${kgPerKm} kg CO2/km`,
      'Shared delivery reduces per-household impact',
    ],
    explanation: `By using Farm2Table, you eliminate ${tripsPerWeek} weekly trips, saving approximately ${Math.round(deterministicEstimate)} kg CO2 per month.`,
  };
}

/**
 * Get nutrition advice using LLM
 */
export async function getNutritionAdvice(
  allergiesAndNotes: string,
  weeklyItemsTable: string
): Promise<NutritionAdvisorResult> {
  const systemPrompt = `You are a dietitian style assistant. Analyze a weekly list of produce items and recommend missing nutrients precisely.`;
  
  const userPrompt = `Allergies and notes:
${allergiesAndNotes}

Weekly items with nutrition per unit and quantity:
${weeklyItemsTable}

Task:
Return JSON with:
- target_nutrients: list of strings
- gaps: list of strings
- recommendations: list of up to five items available in city with a short why

Return only valid JSON, no markdown formatting.`;

  try {
    const response = await callLLM(userPrompt, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        target_nutrients: parsed.target_nutrients || [],
        gaps: parsed.gaps || [],
        recommendations: parsed.recommendations || [],
      };
    }
    // If no JSON found, try to extract information from text response
    const lowerResponse = response.toLowerCase();
    const gaps: string[] = [];
    const recommendations: Array<{ item: string; why: string }> = [];
    
    // Try to extract gaps from response
    if (lowerResponse.includes('low') || lowerResponse.includes('deficient') || lowerResponse.includes('lacking')) {
      gaps.push('Some nutrients may be below recommended levels based on your current intake');
    }
    
    // Try to extract recommendations
    if (lowerResponse.includes('recommend') || lowerResponse.includes('suggest')) {
      recommendations.push({
        item: 'Consult the full analysis for specific recommendations',
        why: 'AI analysis suggests adding more variety to meet nutritional goals',
      });
    }
    
    return {
      target_nutrients: ['Protein', 'Fiber', 'Vitamin C', 'Iron', 'Calcium'],
      gaps: gaps.length > 0 ? gaps : ['Consider adding more variety to your weekly produce selection'],
      recommendations: recommendations.length > 0 ? recommendations : [],
    };
  } catch (error) {
    console.error('LLM nutrition advice error:', error);
    // Return fallback recommendations based on common nutritional needs
    return {
      target_nutrients: ['Protein', 'Fiber', 'Vitamin C', 'Iron', 'Calcium'],
      gaps: ['Your current intake may be low in some essential nutrients. Consider adding more variety.'],
      recommendations: [
        { item: 'Leafy greens (spinach, kale)', why: 'High in iron, vitamin C, and fiber' },
        { item: 'Legumes (beans, lentils)', why: 'Excellent source of protein and fiber' },
        { item: 'Citrus fruits', why: 'Rich in vitamin C' },
        { item: 'Nuts and seeds', why: 'Good source of protein and healthy fats' },
        { item: 'Whole grains', why: 'High in fiber and B vitamins' },
      ],
    };
  }
}

