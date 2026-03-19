import { NextRequest, NextResponse } from 'next/server'
import { db, storage } from '@/lib/providers'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups')

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// GET: List all backups
export async function GET() {
  try {
    const backups = await db.getBackups()
    return NextResponse.json({ backups })
  } catch (error: unknown) {
    console.error('GET backups error:', error)
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 })
  }
}

// POST: Create a new backup
export async function POST() {
  try {
    // Gather all data
    const [
      sources, invoices, templates, settings, auditLogs,
      batches, backups, fyConfig,
    ] = await Promise.all([
      prisma.source.findMany(),
      prisma.invoice.findMany(),
      prisma.template.findMany(),
      prisma.settings.findMany(),
      prisma.auditLog.findMany(),
      prisma.generationHistory.findMany(),
      prisma.backup.findMany(),
      prisma.financialYearConfig.findFirst(),
    ])

    const backupData = {
      version: '1.1.0',
      createdAt: new Date().toISOString(),
      data: { sources, invoices, templates, settings, auditLogs, batches, fyConfig },
    }

    const jsonStr = JSON.stringify(backupData, null, 2)
    const buffer = Buffer.from(jsonStr, 'utf-8')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `InvoiceForge_Backup_${timestamp}.json`
    const filePath = path.join(BACKUP_DIR, fileName)

    await fs.promises.writeFile(filePath, buffer)

    const backup = await db.createBackup({
      fileName,
      filePath,
      fileSizeBytes: buffer.length,
      type: 'manual',
      appVersion: '1.1.0',
      invoiceCount: invoices.length,
      templateCount: templates.length,
      sourceCount: sources.length,
      status: 'completed',
    })

    await db.createAuditLog({
      actionType: 'backup',
      actionDetail: `Created backup: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`,
      affectedEntity: 'backup',
      affectedEntityId: backup.id,
    })

    return NextResponse.json({ success: true, backup })
  } catch (error: unknown) {
    console.error('POST backup error:', error)
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}

// DELETE: Delete a backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Backup ID required' }, { status: 400 })
    }

    const backup = await db.getBackup(id)
    if (backup?.filePath && fs.existsSync(backup.filePath)) {
      await fs.promises.unlink(backup.filePath)
    }
    await db.deleteBackup(id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE backup error:', error)
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 })
  }
}
