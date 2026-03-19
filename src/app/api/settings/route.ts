import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic';

// GET all settings or by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const key = searchParams.get('key')

    if (key) {
      const setting = await db.getSetting(key)
      return NextResponse.json({ setting })
    }

    const settings = await db.getAllSettings(category || undefined)

    // Convert to key-value map for easy consumption
    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => { settingsMap[s.key] = s.value })

    return NextResponse.json({ settings: settingsMap, raw: settings })
  } catch (error: unknown) {
    console.error('GET settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST/PUT: Upsert settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, category } = body as { key: string; value: string; category?: string }

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const setting = await db.updateSetting(key, value, category || 'general')

    await db.createAuditLog({
      actionType: 'settings_change',
      actionDetail: `Setting "${key}" updated`,
      affectedEntity: 'setting',
      affectedEntityId: setting?.id || 'unknown',
      metadata: JSON.stringify({ key, category: category || 'general' }),
    })

    return NextResponse.json({ success: true, setting })
  } catch (error: unknown) {
    console.error('POST settings error:', error)
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}

// PUT: Bulk upsert settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body as { settings: { key: string; value: string; category?: string }[] }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array is required' }, { status: 400 })
    }

    const results = await Promise.all(
      settings.map((s) => db.updateSetting(s.key, s.value, s.category || 'general'))
    )

    return NextResponse.json({ success: true, count: results.length })
  } catch (error: unknown) {
    console.error('PUT settings error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
