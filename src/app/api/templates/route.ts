import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// GET: List all templates
export async function GET() {
  try {
    const templates = await db.getTemplates()
    return NextResponse.json({ templates })
  } catch (error: unknown) {
    console.error('GET templates error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST: Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, layoutConfig, isPreset, isCustom, defaultLanguageCode, qrEnabled, qrPosition, qrSize } = body

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    const template = await db.createTemplate({
      name,
      category: category || 'General',
      layoutConfig: typeof layoutConfig === 'string' ? layoutConfig : JSON.stringify(layoutConfig || {}),
      isPreset: isPreset || false,
      isCustom: isCustom ?? true,
      defaultLanguageCode: defaultLanguageCode || 'en',
      qrEnabled: qrEnabled || false,
      qrPosition: qrPosition || 'bottom-right',
      qrSize: qrSize || 'medium',
    })

    await db.createAuditLog({
      actionType: 'settings_change',
      actionDetail: `Created template: ${name}`,
      affectedEntity: 'template',
      affectedEntityId: template.id,
    })

    return NextResponse.json({ success: true, template })
  } catch (error: unknown) {
    console.error('POST template error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
