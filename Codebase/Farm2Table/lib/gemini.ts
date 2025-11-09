import { GoogleGenerativeAI } from '@google/generative-ai';
import { CarbonCalculatorResult, NutritionAdvisorResult } from './types';

// Get API key helper
const getApiKey = () => {
  const rawKey = process.env.GEMINI_API_KEY
  const key = rawKey?.trim() || ''
  if (!key || key === 'your_gemini_api_key_here' || key.length < 10) {
    console.error('getApiKey failed:', {
      rawExists: !!rawKey,
      rawLength: rawKey?.length || 0,
      trimmedLength: key.length,
    })
    return ''
  }
  return key
}

// Initialize genAI - will be recreated if needed
let genAI: GoogleGenerativeAI | null = null

const getGenAI = () => {
  // Always get fresh API key to ensure we have the latest value
  const apiKey = getApiKey()
  if (!apiKey) {
    // Log detailed debug info
    const rawKey = process.env.GEMINI_API_KEY
    console.error('getGenAI: API key check failed', {
      rawKeyExists: !!rawKey,
      rawKeyLength: rawKey?.length || 0,
      rawKeyPreview: rawKey ? `${rawKey.substring(0, 10)}...` : 'undefined',
      trimmedKey: getApiKey(),
    })
    throw new Error('GEMINI_API_KEY is not configured. Please check your .env.local file.')
  }
  
  // Recreate if API key changed or not initialized
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const ai = getGenAI()
    
    // Try models in order - newer SDK versions may use different names
    let model
    let lastError: any = null
    
    // According to SDK README, use gemini-1.5-flash
    // But v1beta API may not support it, so we'll try multiple options
    const modelNames = [
      'gemini-1.5-flash',  // From SDK README example
      'gemini-pro',        // Standard model
      'gemini-1.5-pro',    // 1.5 version
    ]
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    // Try each model until one works
    for (const modelName of modelNames) {
      try {
        model = ai.getGenerativeModel({ model: modelName })
        console.log(`Trying model: ${modelName}`)
        
        // Actually try to use the model - errors happen on generateContent, not getGenerativeModel
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        console.log(`Successfully used model: ${modelName}`)
        return response.text();
      } catch (e: any) {
        lastError = e
        const errorMsg = e?.message || ''
        console.log(`Model ${modelName} failed:`, errorMsg.substring(0, 150))
        
        // If it's a 404 or model not found, try next model
        if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('not supported')) {
          continue
        }
        // For other errors (like API key), throw immediately
        throw e
      }
    }
    
    // If we get here, all models failed
    throw new Error(`No available Gemini model found. Tried: ${modelNames.join(', ')}. Last error: ${lastError?.message || 'Unknown'}. The API key may not have access to these models, or the models are not available in your region.`)
  } catch (error: any) {
    console.error('Gemini API error:', error);
    // Provide more detailed error message
    const errorMessage = error?.message || 'Unknown error';
    if (errorMessage.includes('API_KEY') || errorMessage.includes('api key') || errorMessage.includes('API key')) {
      throw new Error('GEMINI_API_KEY is invalid or not configured. Please check your .env.local file.');
    }
    if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
      throw new Error(`Model not available. Please check your API key has access to Gemini models. Error: ${errorMessage}`);
    }
    throw new Error(`Gemini API error: ${errorMessage}`);
  }
}

export async function getGeminiEmbedding(text: string): Promise<number[]> {
  try {
    const ai = getGenAI()
    // Use text-embedding-004 model for embeddings
    const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    // Handle both array and object formats
    if (Array.isArray(embedding)) {
      return embedding;
    }
    if (embedding && typeof embedding === 'object' && 'values' in embedding) {
      return embedding.values as number[];
    }
    // Fallback: generate a simple hash-based embedding
    return Array.from({ length: 128 }, (_, i) => {
      const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), i);
      return (hash % 200 - 100) / 100;
    });
  } catch (error) {
    console.error('Gemini embedding error:', error);
    // Fallback: generate a simple hash-based embedding
    return Array.from({ length: 128 }, (_, i) => {
      const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), i);
      return (hash % 200 - 100) / 100;
    });
  }
}

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
    const response = await callGemini(userPrompt, systemPrompt);
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
    console.error('Gemini carbon calculation error:', error);
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
    const response = await callGemini(userPrompt, systemPrompt);
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
    console.error('Gemini nutrition advice error:', error);
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

