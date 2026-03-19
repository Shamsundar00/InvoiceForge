import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import path from 'path'

interface ValidationCheck {
  id: string
  name: string
  severity: 'error' | 'warning' | 'info'
  passed: boolean
  message: string
  details?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    const checks: ValidationCheck[] = []

    // 1. File format
    const validExtensions = ['.xlsx', '.xls', '.csv']
    checks.push({
      id: 'file_format',
      name: 'File format',
      severity: 'error',
      passed: validExtensions.includes(ext),
      message: validExtensions.includes(ext)
        ? `Valid file format: ${ext}`
        : `Invalid format: ${ext}. Accepted: .xlsx, .xls, .csv`,
    })

    if (!validExtensions.includes(ext)) {
      return NextResponse.json({
        overallStatus: 'errors',
        overallMessage: 'Cannot Import — Fix Errors',
        checks,
        errorCount: 1, warningCount: 0, infoCount: 0,
      })
    }

    // 2. File size
    const sizeMB = file.size / (1024 * 1024)
    checks.push({
      id: 'file_size',
      name: 'File size',
      severity: 'warning',
      passed: sizeMB <= 50,
      message: sizeMB <= 50
        ? `File size: ${sizeMB.toFixed(2)} MB (OK)`
        : `File is large: ${sizeMB.toFixed(2)} MB. May be slow to process.`,
    })

    // Parse file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    } catch {
      checks.push({
        id: 'parse_error',
        name: 'File parsing',
        severity: 'error',
        passed: false,
        message: 'Failed to parse file. It may be corrupted or password-protected.',
      })
      return NextResponse.json({
        overallStatus: 'errors',
        overallMessage: 'Cannot Import — Fix Errors',
        checks,
        errorCount: 2, warningCount: 0, infoCount: 0,
      })
    }

    // 3. Sheet count
    checks.push({
      id: 'sheet_count',
      name: 'Sheet count',
      severity: 'info',
      passed: true,
      message: `${workbook.SheetNames.length} sheet(s) found. Using first sheet: "${workbook.SheetNames[0]}"`,
    })

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const ref = worksheet['!ref']

    if (!ref) {
      checks.push({
        id: 'empty_sheet',
        name: 'Sheet content',
        severity: 'error',
        passed: false,
        message: 'The first sheet is empty.',
      })
      return NextResponse.json({
        overallStatus: 'errors',
        overallMessage: 'Cannot Import — Fix Errors',
        checks,
        errorCount: 1, warningCount: 0, infoCount: 0,
      })
    }

    const range = XLSX.utils.decode_range(ref)

    // 4. Header row presence
    const headers: string[] = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col })
      const cell = worksheet[cellAddress]
      headers.push(cell ? String(cell.v).trim() : '')
    }
    const nonEmptyHeaders = headers.filter(h => h !== '')
    checks.push({
      id: 'header_row',
      name: 'Header row presence',
      severity: 'error',
      passed: nonEmptyHeaders.length > 0,
      message: nonEmptyHeaders.length > 0
        ? `${nonEmptyHeaders.length} column headers detected`
        : 'No headers found in the first row',
    })

    // 5. Required columns (name + amount)
    const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'))
    const namePatterns = ['first_name', 'firstname', 'first', 'name', 'client_first_name', 'customer_name', 'customer', 'client_name', 'client']
    const amountPatterns = ['amount', 'total', 'total_amount', 'total_cost', 'ticket_cost', 'cost', 'price', 'grand_total']
    const hasName = lowerHeaders.some(h => namePatterns.includes(h))
    const hasAmount = lowerHeaders.some(h => amountPatterns.includes(h))
    checks.push({
      id: 'required_columns',
      name: 'Required columns',
      severity: 'error',
      passed: hasName && hasAmount,
      message: hasName && hasAmount
        ? 'Name and amount columns detected'
        : `Missing: ${[!hasName && 'name field', !hasAmount && 'amount field'].filter(Boolean).join(', ')}`,
    })

    // Get data rows
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false })

    // 6. Data type consistency (check numeric columns)
    const numericIssues: string[] = []
    const amountHeader = headers.find((_, i) => amountPatterns.includes(lowerHeaders[i]))
    if (amountHeader) {
      jsonData.forEach((row, i) => {
        const val = row[amountHeader]
        if (val !== '' && val !== null && val !== undefined) {
          const cleaned = String(val).replace(/[₹$€,\s]/g, '')
          if (isNaN(Number(cleaned))) {
            numericIssues.push(`Row ${i + 2}: "${val}"`)
          }
        }
      })
    }
    checks.push({
      id: 'data_types',
      name: 'Data type consistency',
      severity: 'warning',
      passed: numericIssues.length === 0,
      message: numericIssues.length === 0
        ? 'Numeric columns have consistent data types'
        : `${numericIssues.length} non-numeric value(s) in amount column`,
      details: numericIssues.length > 0 ? numericIssues.slice(0, 10) : undefined,
    })

    // 7. Empty rows
    const emptyRows: number[] = []
    jsonData.forEach((row, i) => {
      if (Object.values(row).every(v => v === '' || v === null || v === undefined)) {
        emptyRows.push(i + 2)
      }
    })
    checks.push({
      id: 'empty_rows',
      name: 'Empty rows',
      severity: 'warning',
      passed: emptyRows.length === 0,
      message: emptyRows.length === 0
        ? 'No empty rows detected'
        : `${emptyRows.length} empty row(s) found`,
      details: emptyRows.length > 0 ? emptyRows.slice(0, 10).map(r => `Row ${r}`) : undefined,
    })

    // 8. Merged cells
    const mergedCells = worksheet['!merges'] || []
    checks.push({
      id: 'merged_cells',
      name: 'Merged cells',
      severity: 'error',
      passed: mergedCells.length === 0,
      message: mergedCells.length === 0
        ? 'No merged cells detected'
        : `${mergedCells.length} merged cell region(s) found. Please unmerge before importing.`,
    })

    // 9. Special characters in headers
    const specialHeaders = headers.filter(h => h && /[^a-zA-Z0-9_ ]/.test(h))
    checks.push({
      id: 'special_chars',
      name: 'Special characters in headers',
      severity: 'warning',
      passed: specialHeaders.length === 0,
      message: specialHeaders.length === 0
        ? 'All headers are clean'
        : `Headers with special characters: ${specialHeaders.join(', ')}`,
      details: specialHeaders.length > 0 ? specialHeaders : undefined,
    })

    // 10. Date format consistency
    const dateHeaders = headers.filter((_, i) => {
      const l = lowerHeaders[i]
      return ['date', 'travel_date', 'show_date', 'start_date', 'end_date', 'check_in', 'check_out', 'booking_date', 'return_date'].includes(l)
    })
    let dateIssues: string[] = []
    if (dateHeaders.length > 0) {
      const dateCol = dateHeaders[0]
      const formats = new Set<string>()
      jsonData.forEach((row, i) => {
        const val = String(row[dateCol] || '')
        if (val) {
          if (/^\d{4}-\d{2}-\d{2}/.test(val)) formats.add('YYYY-MM-DD')
          else if (/^\d{2}\/\d{2}\/\d{4}/.test(val)) formats.add('DD/MM/YYYY')
          else if (/^\d{2}-\d{2}-\d{4}/.test(val)) formats.add('DD-MM-YYYY')
          else formats.add('other')
        }
      })
      if (formats.size > 1) {
        dateIssues = [`Multiple date formats detected in "${dateCol}": ${[...formats].join(', ')}`]
      }
    }
    checks.push({
      id: 'date_format',
      name: 'Date format consistency',
      severity: 'warning',
      passed: dateIssues.length === 0,
      message: dateIssues.length === 0
        ? dateHeaders.length > 0 ? 'Date formats are consistent' : 'No date columns detected'
        : dateIssues[0],
    })

    // 11. Duplicate headers
    const dupes: string[] = []
    const seen = new Set<string>()
    headers.forEach(h => {
      if (h && seen.has(h.toLowerCase())) dupes.push(h)
      if (h) seen.add(h.toLowerCase())
    })
    checks.push({
      id: 'duplicate_headers',
      name: 'Duplicate headers',
      severity: 'error',
      passed: dupes.length === 0,
      message: dupes.length === 0
        ? 'All column headers are unique'
        : `Duplicate headers: ${dupes.join(', ')}`,
    })

    // 12. Row count
    checks.push({
      id: 'row_count',
      name: 'Row count',
      severity: 'info',
      passed: true,
      message: `${jsonData.length} data row(s) found`,
    })

    // 13. Column count
    checks.push({
      id: 'column_count',
      name: 'Column count',
      severity: 'info',
      passed: true,
      message: `${headers.length} column(s) found`,
    })

    // Calculate summary
    const errorCount = checks.filter(c => c.severity === 'error' && !c.passed).length
    const warningCount = checks.filter(c => c.severity === 'warning' && !c.passed).length
    const infoCount = checks.filter(c => c.severity === 'info').length
    const passedCount = checks.filter(c => c.passed).length

    let overallStatus: string
    let overallMessage: string
    if (errorCount > 0) {
      overallStatus = 'errors'
      overallMessage = 'Cannot Import — Fix Errors'
    } else if (warningCount > 0) {
      overallStatus = 'warnings'
      overallMessage = 'Import with Warnings'
    } else {
      overallStatus = 'passed'
      overallMessage = 'Ready to Import'
    }

    const score = Math.round((passedCount / checks.length) * 100)

    return NextResponse.json({
      overallStatus,
      overallMessage,
      score,
      checks,
      errorCount,
      warningCount,
      infoCount,
      headers,
      rowCount: jsonData.length,
      columnCount: headers.length,
      sheetNames: workbook.SheetNames,
    })
  } catch (error: unknown) {
    console.error('Validate error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Validation failed: ${msg}` }, { status: 500 })
  }
}
