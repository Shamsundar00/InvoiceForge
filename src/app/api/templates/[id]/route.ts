import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'

export const dynamic = 'force-dynamic'

// GET: Get single template
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/templates/[id]'>
) {
  try {
    const { id } = await ctx.params
    const template = await db.getTemplate(id)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    return NextResponse.json({ template })
  } catch (error: unknown) {
    console.error('GET template error:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

// PUT: Update template
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/templates/[id]'>
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.category !== undefined) updateData.category = body.category
    if (body.layoutConfig !== undefined) {
      updateData.layoutConfig = typeof body.layoutConfig === 'string'
        ? body.layoutConfig
        : JSON.stringify(body.layoutConfig)
    }
    if (body.defaultLanguageCode !== undefined) updateData.defaultLanguageCode = body.defaultLanguageCode
    if (body.qrEnabled !== undefined) updateData.qrEnabled = body.qrEnabled
    if (body.qrPosition !== undefined) updateData.qrPosition = body.qrPosition
    if (body.qrSize !== undefined) updateData.qrSize = body.qrSize

    const template = await db.updateTemplate(id, updateData)

    await db.createAuditLog({
      actionType: 'settings_change',
      actionDetail: `Updated template: ${template.name}`,
      affectedEntity: 'template',
      affectedEntityId: id,
    })

    return NextResponse.json({ success: true, template })
  } catch (error: unknown) {
    console.error('PUT template error:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

// DELETE: Delete template
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/templates/[id]'>
) {
  try {
    const { id } = await ctx.params
    const template = await db.getTemplate(id)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await db.deleteTemplate(id)

    await db.createAuditLog({
      actionType: 'delete',
      actionDetail: `Deleted template: ${template.name}`,
      affectedEntity: 'template',
      affectedEntityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE template error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
