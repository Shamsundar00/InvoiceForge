import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'
import { generatePDF } from '@/lib/pdf/engine'
import { generateInvoiceHTML } from '@/lib/pdf/invoice-html'
import archiver from 'archiver'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'
export const maxDuration = 120 // Allow 2 min for batch

// POST: Generate PDFs for all invoices in a batch and return as ZIP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { batchId, invoiceIds, paperSize = 'A4', orientation = 'portrait' } = body

    // Get invoices
    let invoices: any[] = []
    if (invoiceIds && invoiceIds.length > 0) {
      const allInvoices = await db.getInvoices({ limit: 9999, offset: 0 })
      invoices = allInvoices.filter((inv: any) => invoiceIds.includes(inv.id))
    } else if (batchId) {
      invoices = await db.getInvoices({ batchId, limit: 9999, offset: 0 })
    } else {
      invoices = await db.getInvoices({ limit: 9999, offset: 0 })
    }

    if (invoices.length === 0) {
      return NextResponse.json({ error: 'No invoices found' }, { status: 404 })
    }

    // Get company settings
    const settings = await db.getAllSettings()
    const settingsMap: Record<string, string> = {}
    settings.forEach((s: any) => { settingsMap[s.key] = s.value })

    // Generate all PDFs
    const pdfFiles: Array<{ name: string; buffer: Buffer }> = []
    for (const invoice of invoices) {
      let templateName = ''
      if (invoice.templateId) {
        const template = await db.getTemplate(invoice.templateId)
        templateName = template?.name || ''
      }

      const html = generateInvoiceHTML({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate?.toISOString() || new Date().toISOString(),
        customerFirstName: invoice.customerFirstName,
        customerLastName: invoice.customerLastName,
        category: invoice.category || 'Any',
        subtotal: invoice.subtotal,
        totalAmount: invoice.totalAmount,
        aiDescription: invoice.aiDescription || '',
        qrData: invoice.qrData,
        qrVerificationHash: invoice.qrVerificationHash,
        templateName,
        languageCode: invoice.languageCode || 'en',
        rawData: invoice.rawData || undefined,
        companyName: settingsMap['company_name'] || undefined,
        companyAddress: settingsMap['company_address'] || undefined,
        companyPhone: settingsMap['company_phone'] || undefined,
        companyEmail: settingsMap['company_email'] || undefined,
        companyGST: settingsMap['company_gst'] || undefined,
      }, { size: paperSize as any, orientation })

      const pdfBuffer = await generatePDF({ html, paperSize, orientation })
      const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`
      pdfFiles.push({ name: filename, buffer: pdfBuffer })
    }

    // Create ZIP
    const zipChunks: Buffer[] = []
    const archive = archiver('zip', { zlib: { level: 6 } })

    archive.on('data', (chunk: Buffer) => zipChunks.push(chunk))

    await new Promise<void>((resolve, reject) => {
      archive.on('error', reject)
      archive.on('end', resolve)

      for (const file of pdfFiles) {
        archive.append(file.buffer, { name: file.name })
      }
      archive.finalize()
    })

    const zipBuffer = Buffer.concat(zipChunks)
    const timestamp = new Date().toISOString().split('T')[0]
    const zipFilename = `InvoiceForge_Invoices_${timestamp}.zip`

    // Audit log
    await db.createAuditLog({
      actionType: 'export',
      actionDetail: `Exported ${pdfFiles.length} invoices as PDF ZIP (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`,
      affectedEntity: 'invoice',
      metadata: JSON.stringify({
        count: pdfFiles.length,
        batchId,
        paperSize,
        zipSizeBytes: zipBuffer.length,
      }),
    })

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    })
  } catch (error: unknown) {
    console.error('Batch PDF error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Batch PDF failed: ${message}` }, { status: 500 })
  }
}
