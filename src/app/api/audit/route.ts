import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// GET: List audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const batchId = searchParams.get('batchId') || undefined

    const [logs, total, analytics] = await Promise.all([
      db.getAuditLogs(limit, offset),
      db.getAuditLogCount(),
      db.getAuditAnalytics(batchId),
    ])

    return NextResponse.json({ logs, total, limit, offset, analytics })
  } catch (error: unknown) {
    console.error('GET audit error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit data' }, { status: 500 })
  }
}
