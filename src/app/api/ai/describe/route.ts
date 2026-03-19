import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// ---- Creative default prompts per category (7th-grade English, human-sounding) ----
const categoryPrompts: Record<string, string> = {
  Travel: `You are writing a short description for a travel booking. Write it like a real person would talk — simple, friendly, and warm. Use easy English that a 7th grader can read. Mention the destination, the kind of trip, and say something nice about the experience. Make it 3-4 sentences. Sound like a helpful friend, not a robot or a company.`,

  Flight: `You are writing a short description for a flight booking. Write it like a real person would talk — simple and warm. Use easy English that a 7th grader can read. Mention the destination, the flight experience, and say something encouraging about the trip. Make it 3-4 sentences. Sound like a helpful friend.`,

  'Luxury Travel': `You are writing a short description for a special luxury trip. Write it like a real person would talk — warm and genuine. Use simple English that a 7th grader can read, but make it feel special. Mention the destination, what makes this trip extra nice, and wish them a wonderful time. Make it 3-4 sentences.`,

  Entertainment: `You are writing a short description for an entertainment event or show. Write it like a real person would talk — excited and friendly. Use easy English that a 7th grader can read. Talk about the event, the fun they will have, and add a positive thought. Make it 3-4 sentences.`,

  Hospitality: `You are writing a short description for a hotel stay. Write it like a real person would talk — warm and welcoming. Use easy English that a 7th grader can read. Mention the hotel or place, what makes the stay comfortable, and wish them a relaxing time. Make it 3-4 sentences.`,

  'Tour Operators': `You are writing a short description for a tour package. Write it like a real person would talk — enthusiastic and simple. Use easy English that a 7th grader can read. Mention the places they will visit, the exciting things they will see, and say something positive. Make it 3-4 sentences.`,

  Consulting: `You are writing a short description for a consulting or professional service. Write it like a real person would talk — honest and straightforward. Use easy English that a 7th grader can read. Mention what was done, why it helps, and say something positive. Make it 3-4 sentences.`,

  'E-commerce': `You are writing a short description for a product purchase. Write it like a real person would talk — friendly and positive. Use easy English that a 7th grader can read. Mention the product, why it is a good choice, and thank them. Make it 3-4 sentences.`,

  Any: `You are writing a short description for a service or product. Write it like a real person would talk — simple, warm, and positive. Use easy English that a 7th grader can read. Mention what was provided, why it is good, and say something nice. Make it 3-4 sentences.`,
}

const defaultSystemPrompt = `CRITICAL RULES — FOLLOW THESE EXACTLY:
1. Write ONLY the description text — no labels, no "Description:", no quotation marks
2. Write 3-4 sentences. Not too short, not too long.
3. Use SIMPLE, everyday English — like a 7th grader writes. No big words, no corporate talk.
4. Sound like a REAL HUMAN — like you are writing to a friend or customer you know personally
5. Be WARM and POSITIVE — make the person feel good
6. Use the customer's NAME and the specific DETAILS provided (destination, dates, etc.)
7. NEVER say "invoice", "payment", "billing", "amount", or any money words
8. Focus on the EXPERIENCE — what they will enjoy, what was done for them
9. Each description must feel unique — change the words and sentence order for each one
10. Do NOT start with "We are delighted" or "It is our pleasure" — just talk normally like a person`

// POST: Generate AI descriptions for invoice rows
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rows, customPrompt } = body as {
      rows: Array<{
        index: number
        firstName?: string; lastName?: string
        category?: string; description?: string
        amount?: string; date?: string; details?: string
        [key: string]: unknown
      }>
      customPrompt?: string
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    // Check for API keys (support multiple providers)
    const [geminiKey, groqKey, openaiKey] = await Promise.all([
      db.getSetting('gemini_api_key'),
      db.getSetting('groq_api_key'),
      db.getSetting('openai_api_key'),
    ])

    const activeProvider = geminiKey?.value ? 'gemini'
      : groqKey?.value ? 'groq'
      : openaiKey?.value ? 'openai'
      : null

    if (!activeProvider) {
      // Generate creative fallback descriptions
      const descriptions = rows.map((row) => ({
        index: row.index,
        description: generateCreativeFallback(row),
        source: 'template',
      }))
      return NextResponse.json({
        success: true,
        descriptions,
        source: 'template',
        message: 'No AI API key configured. Using creative template descriptions. Add your Gemini, Groq, or OpenAI API key in Settings for AI-powered descriptions.',
      })
    }

    // Generate descriptions using AI
    const descriptions = []
    let firstDescription = '' // For consistency across batch

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const category = row.category || 'Any'
      const categoryPrompt = categoryPrompts[category] || categoryPrompts['Any']

      const systemMsg = `${categoryPrompt}\n\n${defaultSystemPrompt}`
      const userMsg = buildUserPrompt(row, firstDescription, customPrompt)

      try {
        let desc = ''

        if (activeProvider === 'gemini') {
          desc = await callGemini(geminiKey!.value, systemMsg, userMsg)
        } else if (activeProvider === 'groq') {
          desc = await callGroq(groqKey!.value, systemMsg, userMsg)
        } else if (activeProvider === 'openai') {
          desc = await callOpenAI(openaiKey!.value, systemMsg, userMsg)
        }

        desc = desc.replace(/^["']|["']$/g, '').trim()

        if (i === 0 && desc) firstDescription = desc

        descriptions.push({
          index: row.index,
          description: desc || generateCreativeFallback(row),
          source: desc ? 'ai' : 'fallback',
        })
      } catch (aiErr) {
        console.error(`AI error for row ${row.index}:`, aiErr)
        descriptions.push({
          index: row.index,
          description: generateCreativeFallback(row),
          source: 'fallback',
        })
      }
    }

    return NextResponse.json({
      success: true,
      descriptions,
      source: activeProvider,
      provider: activeProvider,
    })
  } catch (error: unknown) {
    console.error('AI description error:', error)
    return NextResponse.json({ error: 'Failed to generate descriptions' }, { status: 500 })
  }
}

// ---- Build user prompt with row details ----
function buildUserPrompt(
  row: Record<string, unknown>,
  styleReference: string,
  customPrompt?: string
): string {
  const name = `${row.firstName || ''} ${row.lastName || ''}`.trim()
  const details = Object.entries(row)
    .filter(([k]) => !['index', 'firstName', 'lastName'].includes(k))
    .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
    .join('\n')

  let prompt = `Generate a creative, positive invoice description for the following:\n\nCustomer: ${name || 'Valued Customer'}\n${details}\n\n`

  if (customPrompt) {
    prompt += `Additional instructions: ${customPrompt}\n\n`
  }

  if (styleReference) {
    prompt += `IMPORTANT — Match the tone, length, and style of this reference (only change the specific details):\n"${styleReference}"\n`
  }

  return prompt
}

// ---- Gemini API call ----
async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
  const { generateText } = await import('ai')

  const googleAI = createGoogleGenerativeAI({ apiKey })
  const { text } = await generateText({
    model: googleAI('gemini-2.0-flash'),
    system: systemPrompt,
    prompt: userPrompt,
  })
  return text.trim()
}

// ---- Groq API call ----
async function callGroq(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  })
  const json = await res.json()
  return json.choices?.[0]?.message?.content?.trim() || ''
}

// ---- OpenAI-compatible API call ----
async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  })
  const json = await res.json()
  return json.choices?.[0]?.message?.content?.trim() || ''
}

// ---- Fallback descriptions (7th-grade, human-sounding, no AI needed) ----
function generateCreativeFallback(row: Record<string, unknown>): string {
  const name = `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'our customer'
  const category = String(row.category || 'services')
  const destination = String(row.destination || row.venue || row.hotel_name || '')

  const templates: Record<string, string[]> = {
    Travel: [
      `${name} has a great trip planned${destination ? ` to ${destination}` : ''}! We have put everything together to make sure the travel goes smoothly and comfortably. We really hope ${name} enjoys every moment and comes back with amazing memories.`,
      `We are really excited to help ${name} with this trip${destination ? ` to ${destination}` : ''}. All the details are set up so the journey is easy and fun from start to finish. We hope this trip turns out to be one of the best experiences ever!`,
    ],
    Flight: [
      `${name} is all set for the flight${destination ? ` to ${destination}` : ''}! We made sure the booking is smooth and comfortable. We hope the flight is great and the trip ahead is full of wonderful experiences.`,
      `Everything is ready for ${name}'s flight${destination ? ` heading to ${destination}` : ''}. We picked the best options to make the journey comfortable and hassle-free. We hope this trip is truly something special!`,
    ],
    Entertainment: [
      `${name} is going to have an amazing time at this event${destination ? ` at ${destination}` : ''}! We got everything set up so they can just relax and enjoy the show. We are sure it is going to be a night they will never forget.`,
    ],
    Hospitality: [
      `${name} is going to have a wonderful stay${destination ? ` at ${destination}` : ''}! We have made sure everything is ready — the room, the service, and all the little details. We hope it feels like a home away from home, but even better.`,
    ],
    default: [
      `We are really happy to help ${name} with this. Everything has been done carefully to make sure they get the best ${category} possible. We truly appreciate their trust in us and we look forward to helping them again!`,
      `${name} came to us for ${category} and we made sure to give our very best. Every single detail was handled with care to give them a great experience. We are thankful for the chance to work together and hope to do it again soon!`,
    ],
  }

  const categoryTemplates = templates[category as string] || templates.default
  const randomIndex = Math.floor(Math.random() * categoryTemplates.length)
  return categoryTemplates[randomIndex]
}
