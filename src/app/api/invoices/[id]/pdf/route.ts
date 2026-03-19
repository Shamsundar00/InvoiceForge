import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/providers'
import { generatePDF } from '@/lib/pdf/engine'
import { generateInvoiceHTML } from '@/lib/pdf/invoice-html'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow 30s for PDF generation

// GET: Generate and download PDF for a single invoice
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/invoices/[id]/pdf'>
) {
  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(request.url)
    const paperSize = (searchParams.get('size') || 'A4') as 'A4' | 'A5' | 'Letter' | 'Legal'
    const orientation = (searchParams.get('orientation') || 'portrait') as 'portrait' | 'landscape'

    // Get invoice
    const invoice = await db.getInvoice(id)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Get company settings
    const settings = await db.getAllSettings()
    const settingsMap: Record<string, string> = {}
    settings.forEach((s: any) => { settingsMap[s.key] = s.value })

    // Get template name
    let templateName = ''
    if (invoice.templateId) {
      const template = await db.getTemplate(invoice.templateId)
      templateName = template?.name || ''
    }

    // Generate HTML
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
    }, { size: paperSize, orientation })

    // Generate PDF
    const pdfBuffer = await generatePDF({
      html,
      paperSize,
      orientation,
    })

    // Return PDF as download
    const filename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error: unknown) {
    console.error('PDF generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `PDF generation failed: ${message}` }, { status: 500 })
  }
}
