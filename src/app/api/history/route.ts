import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// GET: List generation history batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const batches = await db.getBatches(limit, offset)

    return NextResponse.json({ batches })
  } catch (error: unknown) {
    console.error('GET history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
