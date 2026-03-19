import { NextRequest, NextResponse } from 'next/server'
import { db, storage } from '@/lib/providers'
import * as XLSX from 'xlsx'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST: Generate invoices from source data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      templateId,
      selectedRows, // array of row indices to generate, or null for all
      taxRate = 18,
      taxLabel = 'GST',
      discountRate = 0,
      enableQR = true,
      enableAI = false,
      languageCode = 'en',
      paperSize = 'A4',
      orientation = 'portrait',
    } = body

    // 1. Get active source
    const source = await db.getActiveSource()
    if (!source) {
      return NextResponse.json({ error: 'No active data source. Upload an Excel file first.' }, { status: 400 })
    }

    // 2. Read source data
    let buffer: Buffer
    try {
      buffer = await storage.downloadFile(source.filePath)
    } catch {
      return NextResponse.json({ error: 'Source file not found. Please re-upload.' }, { status: 400 })
    }

    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const allData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false })

    // 3. Get column mapping
    const columnMapping = source.columnMapping ? JSON.parse(source.columnMapping) : {}

    // 4. Filter rows
    const rowsToProcess = selectedRows
      ? selectedRows.map((i: number) => ({ data: allData[i], index: i }))
      : allData.map((data, index) => ({ data, index }))

    if (rowsToProcess.length === 0) {
      return NextResponse.json({ error: 'No rows to process' }, { status: 400 })
    }

    // 5. Get template
    let template = templateId ? await db.getTemplate(templateId) : await db.getDefaultTemplate()
    if (!template) {
      // Create a default template if none exists
      template = await db.createTemplate({
        name: 'Generic Minimal',
        category: 'Any',
        isPreset: true,
        isCustom: false,
        layoutConfig: JSON.stringify(getDefaultLayoutConfig()),
        defaultLanguageCode: 'en',
        qrEnabled: true,
        qrPosition: 'bottom-right',
        qrSize: 'medium',
      })
    }

    // 6. Generate batch ID
    const batchId = `BATCH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`

    // 7. Create batch record
    const batch = await db.createBatch({
      batchId,
      sourceId: source.id,
      templateId: template.id,
      totalInvoices: rowsToProcess.length,
      exportFormat: 'pdf',
    })

    // 8. Get settings
    const settings = await db.getAllSettings()
    const settingsMap: Record<string, string> = {}
    settings.forEach((s: any) => { settingsMap[s.key] = s.value })

    // 9. Process each row and generate invoices
    let successCount = 0
    let errorCount = 0
    let totalRevenue = 0
    let totalProfit = 0
    const invoiceResults: any[] = []

    for (const { data: row, index: rowIndex } of rowsToProcess) {
      try {
        // Get next invoice number
        const { formatted: invoiceNumber } = await db.getNextInvoiceNumber()

        // Extract fields using column mapping
        const firstName = columnMapping.firstName ? String(row[columnMapping.firstName] || '') : ''
        const lastName = columnMapping.lastName ? String(row[columnMapping.lastName] || '') : ''
        const rawAmount = columnMapping.amount ? String(row[columnMapping.amount] || '0') : '0'
        const amount = parseFloat(rawAmount.replace(/[₹$€,\s]/g, '')) || 0
        const category = columnMapping.category ? String(row[columnMapping.category] || '') : ''
        const description = columnMapping.description ? String(row[columnMapping.description] || '') : ''

        // Calculate financials
        const subtotal = amount
        const discountAmount = subtotal * (discountRate / 100)
        const taxableAmount = subtotal - discountAmount
        const taxAmount = taxableAmount * (taxRate / 100)
        const totalAmount = taxableAmount + taxAmount

        // Cost price (if available)
        const costPriceRaw = columnMapping.costPrice ? String(row[columnMapping.costPrice] || '') : ''
        const costPrice = costPriceRaw ? parseFloat(costPriceRaw.replace(/[₹$€,\s]/g, '')) || null : null
        const marginAmount = costPrice != null ? totalAmount - costPrice : null
        const marginPercentage = costPrice != null && totalAmount > 0 ? ((totalAmount - costPrice) / totalAmount) * 100 : null

        // Generate QR data
        let qrData = null
        let qrVerificationHash = null
        if (enableQR) {
          const qrPayload: Record<string, unknown> = {
            app: 'InvoiceForge',
            invoice_number: invoiceNumber,
            date: new Date().toISOString().split('T')[0],
            customer: `${firstName} ${lastName}`.trim(),
            amount: totalAmount,
            currency: 'INR',
            category,
            generated_at: new Date().toISOString(),
          }
          const secret = settingsMap['qr_secret_key'] || 'invoiceforge-default-secret'
          qrVerificationHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(qrPayload) + secret)
            .digest('hex')
          qrPayload.verification_hash = `sha256:${qrVerificationHash.substring(0, 12)}...`
          qrData = JSON.stringify(qrPayload)
        }

        // AI description - call AI if enabled, otherwise generate creative fallback
        let aiDescription = description
        if (!aiDescription || enableAI) {
          try {
            // Check if any AI key is available
            const geminiKey = settingsMap['gemini_api_key']
            const groqKey = settingsMap['groq_api_key']
            const openaiKey = settingsMap['openai_api_key']
            
            if (geminiKey || groqKey || openaiKey) {
              // Call the AI description endpoint internally
              const aiRes = await fetch(new URL('/api/ai/describe', request.url).toString(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  rows: [{
                    index: rowIndex,
                    firstName,
                    lastName,
                    category,
                    ...row,
                  }],
                }),
              })
              const aiJson = await aiRes.json()
              if (aiJson.success && aiJson.descriptions?.[0]?.description) {
                aiDescription = aiJson.descriptions[0].description
              }
            }
          } catch (aiErr) {
            console.error('AI description generation failed, using fallback:', aiErr)
          }
          // Creative fallback if AI didn't produce anything
          if (!aiDescription) {
            const name = `${firstName} ${lastName}`.trim()
            const dest = String(row['destination'] || row['venue'] || row['hotel_name'] || '')
            aiDescription = category === 'Travel' || category === 'Flight'
              ? `We put together a wonderful travel plan for ${name}${dest ? ` heading to ${dest}` : ''}. Everything is set up so they can enjoy a smooth and comfortable trip from start to finish. We made sure every part of the journey is taken care of, and we hope they have an amazing time creating great memories.`
              : category === 'Hospitality'
              ? `We are happy to welcome ${name}${dest ? ` to ${dest}` : ''} for a comfortable and relaxing stay. The rooms and services are all ready to make their visit feel special and easy. We look forward to giving them a wonderful experience they will remember.`
              : `We are glad to provide our best services to ${name}. Each detail has been carefully handled to make sure they get great value and a smooth experience. We truly appreciate their trust in us and look forward to working together again.`
          }
        }

        // Create invoice record
        const invoice = await db.createInvoice({
          invoiceNumber,
          sourceId: source.id,
          sourceRowIndex: rowIndex,
          customerFirstName: firstName,
          customerLastName: lastName,
          category,
          subtotal,
          discountAmount,
          taxRate,
          taxAmount,
          totalAmount,
          costPrice,
          marginAmount,
          marginPercentage,
          aiDescription,
          templateId: template.id,
          languageCode,
          qrData,
          qrVerificationHash,
          invoiceDate: new Date(),
          generatedDate: new Date(),
          status: 'generated',
          isCurrentVersion: true,
          rawData: JSON.stringify(row),
          batchId,
        })

        await db.incrementInvoiceNumber()

        totalRevenue += totalAmount
        if (marginAmount != null) totalProfit += marginAmount
        successCount++

        invoiceResults.push({
          id: invoice.id,
          invoiceNumber,
          customerName: `${firstName} ${lastName}`.trim(),
          totalAmount,
          status: 'generated',
        })
      } catch (rowErr) {
        console.error(`Error processing row ${rowIndex}:`, rowErr)
        errorCount++
        invoiceResults.push({
          rowIndex,
          status: 'error',
          error: rowErr instanceof Error ? rowErr.message : 'Unknown error',
        })
      }
    }

    // 10. Update batch with results
    await db.updateBatch(batch.id, {
      successfulCount: successCount,
      errorCount,
      totalRevenue,
      totalProfit,
    })

    // 11. Audit log
    await db.createAuditLog({
      actionType: 'generate',
      actionDetail: `Generated ${successCount} invoices (${errorCount} errors) in batch ${batchId}`,
      affectedEntity: 'invoice',
      metadata: JSON.stringify({
        batchId,
        totalRows: rowsToProcess.length,
        successCount,
        errorCount,
        totalRevenue,
        templateUsed: template.name,
      }),
    })

    return NextResponse.json({
      success: true,
      batchId,
      summary: {
        total: rowsToProcess.length,
        successful: successCount,
        errors: errorCount,
        totalRevenue,
        totalProfit,
      },
      invoices: invoiceResults,
    })
  } catch (error: unknown) {
    console.error('Generate error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 500 })
  }
}

function getDefaultLayoutConfig() {
  return {
    companyLogo: { position: 'top-left', enabled: true },
    colors: { primary: '#6366F1', secondary: '#1E293B', accent: '#10B981', text: '#334155' },
    fonts: { heading: 'Inter', body: 'Inter', size: { heading: 18, body: 12, small: 10 } },
    sections: {
      header: { show: true, style: 'modern' },
      billTo: { show: true },
      lineItems: { show: true, columns: ['description', 'quantity', 'rate', 'amount'] },
      summary: { show: true },
      footer: { show: true, text: 'Thank you for your business!' },
    },
    paper: { size: 'A4', orientation: 'portrait', margins: { top: 20, right: 20, bottom: 20, left: 20 } },
  }
}
