import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// GET: List invoices with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [invoices, total] = await Promise.all([
      db.getInvoices({ batchId, status, search, limit, offset }),
      db.getInvoiceCount({ batchId, status }),
    ])

    return NextResponse.json({ invoices, total, limit, offset })
  } catch (error: unknown) {
    console.error('GET invoices error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}
