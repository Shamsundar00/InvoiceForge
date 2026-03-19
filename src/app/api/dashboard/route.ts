import { NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dashboardData = await db.getDashboardData();
    return NextResponse.json(dashboardData);
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
