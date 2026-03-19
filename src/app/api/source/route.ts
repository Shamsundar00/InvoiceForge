import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db, storage } from '@/lib/providers'
import path from 'path'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const ext = path.extname(file.name).toLowerCase()
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type: ${ext}. Accepted: .xlsx, .xls, .csv` },
        { status: 400 }
      )
    }

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 50MB` },
        { status: 400 }
      )
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save file via storage provider
    const timestamp = Date.now()
    const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = await storage.uploadFile(safeFileName, buffer)

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Get headers from first row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    const headers: string[] = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col })
      const cell = worksheet[cellAddress]
      headers.push(cell ? String(cell.v).trim() : `Column_${col + 1}`)
    }

    // Get all data rows
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: '',
      raw: false,
    })

    // Auto-detect column mapping
    const columnMapping = autoDetectColumns(headers)

    // Run basic validation
    const validationReport = validateData(headers, jsonData, columnMapping)

    // Compute hash of file for dedup tracking
    const crypto = await import('crypto')
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex')

    // Deactivate previous sources
    await db.deactivateAllSources()

    // Save source record to database
    const source = await db.createSource({
      fileName: file.name,
      filePath: filePath,
      originalFileHash: fileHash,
      rowCount: jsonData.length,
      columnCount: headers.length,
      columnMapping: JSON.stringify(columnMapping),
      validationStatus: validationReport.overallStatus,
      validationReport: JSON.stringify(validationReport),
      isActive: true,
    })

    // Log the upload action
    await db.createAuditLog({
      actionType: 'upload',
      actionDetail: `Uploaded Excel file: ${file.name} (${jsonData.length} rows, ${headers.length} columns)`,
      affectedEntity: 'source',
      affectedEntityId: source.id,
      metadata: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        rowCount: jsonData.length,
        columnCount: headers.length,
        fileHash,
      }),
    })

    return NextResponse.json({
      success: true,
      source: {
        id: source.id,
        fileName: file.name,
        rowCount: jsonData.length,
        columnCount: headers.length,
        validationStatus: validationReport.overallStatus,
      },
      headers,
      data: jsonData.slice(0, 500), // Send first 500 rows for preview
      totalRows: jsonData.length,
      columnMapping,
      validationReport,
      sheetNames: workbook.SheetNames,
    })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to process file: ${message}` }, { status: 500 })
  }
}

// GET: Retrieve current active source
export async function GET() {
  try {
    const source = await db.getActiveSource()

    if (!source) {
      return NextResponse.json({ source: null, data: [] })
    }

    // Re-read file data from disk
    let headers: string[] = []
    let data: Record<string, unknown>[] = []

    if (source.filePath) {
      let buffer: Buffer | null = null;
      try {
        buffer = await storage.downloadFile(source.filePath);
      } catch (err) {
        console.warn('Source file not found in storage:', source.filePath);
      }

      if (buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col })
          const cell = worksheet[cellAddress]
          headers.push(cell ? String(cell.v).trim() : `Column_${col + 1}`)
        }

        data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
          raw: false,
        })
      }
    }

    return NextResponse.json({
      source: {
        id: source.id,
        fileName: source.fileName,
        rowCount: source.rowCount,
        columnCount: source.columnCount,
        validationStatus: source.validationStatus,
        uploadDate: source.uploadDate,
      },
      headers,
      data: data.slice(0, 500),
      totalRows: data.length,
      columnMapping: source.columnMapping ? JSON.parse(source.columnMapping) : {},
      validationReport: source.validationReport ? JSON.parse(source.validationReport) : null,
    })
  } catch (error: unknown) {
    console.error('GET source error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Remove current active source
export async function DELETE() {
  try {
    const source = await db.getActiveSource()

    if (source) {
      await db.updateSource(source.id, { isActive: false })

      await db.createAuditLog({
        actionType: 'delete',
        actionDetail: `Removed data source: ${source.fileName}`,
        affectedEntity: 'source',
        affectedEntityId: source.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE source error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ================================================================
// Helper Functions
// ================================================================

interface ColumnMapping {
  firstName?: string
  lastName?: string
  amount?: string
  category?: string
  description?: string
  date?: string
  email?: string
  phone?: string
  company?: string
  costPrice?: string
  quantity?: string
  unitPrice?: string
  discount?: string
  tax?: string
  language?: string
  [key: string]: string | undefined
}

function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const lowerHeaders = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '_'))

  const matchers: { field: keyof ColumnMapping; patterns: string[] }[] = [
    { field: 'firstName', patterns: ['first_name', 'firstname', 'first', 'fname', 'client_first_name', 'customer_first_name'] },
    { field: 'lastName', patterns: ['last_name', 'lastname', 'last', 'lname', 'surname', 'client_last_name', 'customer_last_name'] },
    { field: 'amount', patterns: ['amount', 'total', 'total_amount', 'total_cost', 'ticket_cost', 'cost', 'price', 'grand_total'] },
    { field: 'category', patterns: ['category', 'type', 'booking_type', 'service_type'] },
    { field: 'description', patterns: ['description', 'desc', 'details', 'notes', 'service_description', 'item_name'] },
    { field: 'date', patterns: ['date', 'invoice_date', 'booking_date', 'travel_date', 'show_date', 'start_date', 'check_in'] },
    { field: 'email', patterns: ['email', 'e_mail', 'email_address'] },
    { field: 'phone', patterns: ['phone', 'mobile', 'telephone', 'contact', 'phone_number'] },
    { field: 'company', patterns: ['company', 'company_name', 'organization', 'firm', 'business'] },
    { field: 'costPrice', patterns: ['cost_price', 'purchase_price', 'base_cost', 'agency_cost', 'buying_price'] },
    { field: 'quantity', patterns: ['quantity', 'qty', 'pax_count', 'units', 'count'] },
    { field: 'unitPrice', patterns: ['unit_price', 'rate', 'hourly_rate', 'nightly_rate', 'cost_per_person', 'price_each'] },
    { field: 'discount', patterns: ['discount', 'discount_amount', 'disc'] },
    { field: 'tax', patterns: ['tax', 'tax_amount', 'gst', 'vat'] },
    { field: 'language', patterns: ['language', 'lang', 'language_code'] },
  ]

  for (const matcher of matchers) {
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (matcher.patterns.includes(lowerHeaders[i])) {
        mapping[matcher.field] = headers[i]
        break
      }
    }
  }

  return mapping
}

interface ValidationCheck {
  name: string
  severity: 'error' | 'warning' | 'info'
  passed: boolean
  message: string
  details?: string[]
}

interface ValidationReport {
  overallStatus: 'passed' | 'warnings' | 'errors'
  checks: ValidationCheck[]
  errorCount: number
  warningCount: number
  infoCount: number
}

function validateData(
  headers: string[],
  data: Record<string, unknown>[],
  mapping: ColumnMapping
): ValidationReport {
  const checks: ValidationCheck[] = []

  // 1. Header row presence
  checks.push({
    name: 'Header row presence',
    severity: 'error',
    passed: headers.length > 0 && headers.some((h) => h.trim() !== ''),
    message: headers.length > 0 ? 'Headers detected successfully' : 'No header row found',
  })

  // 2. Required columns (name + amount)
  const hasName = !!(mapping.firstName || mapping.lastName)
  const hasAmount = !!mapping.amount
  checks.push({
    name: 'Required columns',
    severity: 'error',
    passed: hasName && hasAmount,
    message: hasName && hasAmount
      ? 'Name and amount columns detected'
      : `Missing: ${!hasName ? 'name field' : ''}${!hasName && !hasAmount ? ', ' : ''}${!hasAmount ? 'amount field' : ''}`,
  })

  // 3. Duplicate headers
  const headerSet = new Set<string>()
  const dupes: string[] = []
  for (const h of headers) {
    if (headerSet.has(h.toLowerCase())) dupes.push(h)
    headerSet.add(h.toLowerCase())
  }
  checks.push({
    name: 'Duplicate headers',
    severity: 'error',
    passed: dupes.length === 0,
    message: dupes.length === 0 ? 'All headers are unique' : `Duplicate headers found: ${dupes.join(', ')}`,
    details: dupes.length > 0 ? dupes : undefined,
  })

  // 4. Empty rows
  const emptyRows: number[] = []
  data.forEach((row, i) => {
    const values = Object.values(row)
    if (values.every((v) => v === '' || v === null || v === undefined)) {
      emptyRows.push(i + 2) // +2 for 1-indexed + header
    }
  })
  checks.push({
    name: 'Empty rows',
    severity: 'warning',
    passed: emptyRows.length === 0,
    message: emptyRows.length === 0
      ? 'No empty rows found'
      : `${emptyRows.length} empty row(s) found at row(s): ${emptyRows.slice(0, 5).join(', ')}${emptyRows.length > 5 ? '...' : ''}`,
  })

  // 5. Data type consistency in amount column
  if (mapping.amount) {
    const amountCol = mapping.amount
    const invalidAmounts: number[] = []
    data.forEach((row, i) => {
      const val = row[amountCol]
      if (val !== '' && val !== null && val !== undefined) {
        const cleaned = String(val).replace(/[₹$€,\s]/g, '')
        if (isNaN(Number(cleaned))) {
          invalidAmounts.push(i + 2)
        }
      }
    })
    checks.push({
      name: 'Data type consistency',
      severity: 'warning',
      passed: invalidAmounts.length === 0,
      message: invalidAmounts.length === 0
        ? 'Amount column has consistent numeric data'
        : `${invalidAmounts.length} non-numeric value(s) in amount column at row(s): ${invalidAmounts.slice(0, 5).join(', ')}`,
    })
  } else {
    checks.push({
      name: 'Data type consistency',
      severity: 'warning',
      passed: true,
      message: 'No amount column mapped — skipped type check',
    })
  }

  // 6. Special characters in headers
  const specialHeaders = headers.filter((h) => /[^a-zA-Z0-9_ ]/.test(h))
  checks.push({
    name: 'Special characters in headers',
    severity: 'warning',
    passed: specialHeaders.length === 0,
    message: specialHeaders.length === 0
      ? 'Headers are clean'
      : `Headers with special characters: ${specialHeaders.join(', ')}`,
  })

  // 7. Row count
  checks.push({
    name: 'Row count',
    severity: 'info',
    passed: true,
    message: `${data.length} data row(s) found`,
  })

  // 8. Column count
  checks.push({
    name: 'Column count',
    severity: 'info',
    passed: true,
    message: `${headers.length} column(s) found`,
  })

  // 9. Missing required field values
  const missingNameRows: number[] = []
  const missingAmountRows: number[] = []
  if (mapping.firstName || mapping.lastName) {
    data.forEach((row, i) => {
      const fn = mapping.firstName ? String(row[mapping.firstName] ?? '').trim() : ''
      const ln = mapping.lastName ? String(row[mapping.lastName] ?? '').trim() : ''
      if (!fn && !ln) missingNameRows.push(i + 2)
    })
  }
  if (mapping.amount) {
    data.forEach((row, i) => {
      const val = row[mapping.amount!]
      if (val === '' || val === null || val === undefined) {
        missingAmountRows.push(i + 2)
      }
    })
  }

  checks.push({
    name: 'Missing required values',
    severity: 'error',
    passed: missingNameRows.length === 0 && missingAmountRows.length === 0,
    message:
      missingNameRows.length === 0 && missingAmountRows.length === 0
        ? 'All required fields have values'
        : `Missing name: ${missingNameRows.length} row(s), Missing amount: ${missingAmountRows.length} row(s)`,
  })

  // Calculate overall status
  const errorCount = checks.filter((c) => c.severity === 'error' && !c.passed).length
  const warningCount = checks.filter((c) => c.severity === 'warning' && !c.passed).length
  const infoCount = checks.filter((c) => c.severity === 'info').length

  const overallStatus: ValidationReport['overallStatus'] =
    errorCount > 0 ? 'errors' : warningCount > 0 ? 'warnings' : 'passed'

  return { overallStatus, checks, errorCount, warningCount, infoCount }
}
