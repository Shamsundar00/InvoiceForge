import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// GET: Get single invoice
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/invoices/[id]'>
) {
  try {
    const { id } = await ctx.params
    const invoice = await db.getInvoice(id)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    return NextResponse.json({ invoice })
  } catch (error: unknown) {
    console.error('GET invoice error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// PUT: Update invoice (for revisions)
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/invoices/[id]'>
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const invoice = await db.updateInvoice(id, body)
    return NextResponse.json({ success: true, invoice })
  } catch (error: unknown) {
    console.error('PUT invoice error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
