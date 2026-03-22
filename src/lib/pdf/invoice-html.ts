// ================================================================
// Suttrula Invoice HTML Generator — Premium Geometric Design
// ================================================================

interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  customerFirstName: string
  customerLastName: string
  category: string
  subtotal: number
  totalAmount: number
  aiDescription: string
  qrData?: string | null
  qrVerificationHash?: string | null
  templateName?: string
  languageCode?: string
  rawData?: string
  companyName?: string
  companyLogo?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGST?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankName?: string
  corporateIdentity?: string
}

interface PaperConfig {
  size: 'A4' | 'A5' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
}

// Suttrula brand colors
const BRAND = {
  blue: '#4AADE0',
  green: '#3BB54A',
  darkBlue: '#2E86B8',
  darkGreen: '#2D8A3A',
  dark: '#1A2332',
  gray: '#6B7B8D',
  lightGray: '#F4F6F8',
  border: '#DEE4EA',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

function numberToWords(n: number): string {
  if (n === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const whole = Math.floor(n)
  if (whole < 20) return ones[whole]
  if (whole < 100) return tens[Math.floor(whole / 10)] + (whole % 10 ? ' ' + ones[whole % 10] : '')
  if (whole < 1000) return ones[Math.floor(whole / 100)] + ' Hundred' + (whole % 100 ? ' and ' + numberToWords(whole % 100) : '')
  if (whole < 100000) return numberToWords(Math.floor(whole / 1000)) + ' Thousand' + (whole % 1000 ? ' ' + numberToWords(whole % 1000) : '')
  if (whole < 10000000) return numberToWords(Math.floor(whole / 100000)) + ' Lakh' + (whole % 100000 ? ' ' + numberToWords(whole % 100000) : '')
  return numberToWords(Math.floor(whole / 10000000)) + ' Crore' + (whole % 10000000 ? ' ' + numberToWords(whole % 10000000) : '')
}

// Section-aware parsing: separate booking details from tax fields
interface ParsedSections {
  bookingDetails: Array<{ label: string; value: string }>
  taxItems: Array<{ label: string; value: string; amount: number }>
}

function parseSections(rawData: string | undefined): ParsedSections {
  const result: ParsedSections = { bookingDetails: [], taxItems: [] }
  if (!rawData) return result
  try {
    const data = JSON.parse(rawData)
    // Fields shown elsewhere in the invoice
    const skipFields = new Set([
      'first_name', 'last_name', 'firstname', 'lastname', 'amount', 'total',
      'total_amount', 'category', 'address', 'email', 'phone', 'mobile',
      'description', 'service_description', 'discount'
    ])

    // Tax-related patterns
    const taxPatterns = /^(igst|cgst|sgst|gst|vat|tax|cess|tds)/i

    for (const [k, v] of Object.entries(data)) {
      const val = String(v).trim().toLowerCase()
      // Skip empty / not-available
      if (v === '' || v === null || v === undefined) continue
      if (val === 'not available' || val === 'n/a' || val === 'na' || val === '-' || val === 'undefined' || val === 'null') continue
      // Skip mapped fields
      if (skipFields.has(k.toLowerCase())) continue

      const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      if (taxPatterns.test(k.replace(/[^a-zA-Z]/g, ''))) {
        const numVal = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
        if (!isNaN(numVal) && numVal > 0) {
          result.taxItems.push({ label, value: String(v), amount: numVal })
        }
      } else {
        result.bookingDetails.push({ label, value: String(v) })
      }
    }
  } catch { /* ignore */ }
  return result
}

export function generateInvoiceHTML(invoice: InvoiceData, paper: PaperConfig = { size: 'A4', orientation: 'portrait' }): string {
  const customerName = `${invoice.customerFirstName} ${invoice.customerLastName}`.trim()
  const sections = parseSections(invoice.rawData)

  const paperSizes: Record<string, { w: string; h: string }> = {
    A4: { w: '210mm', h: '297mm' },
    A5: { w: '148mm', h: '210mm' },
    Letter: { w: '8.5in', h: '11in' },
    Legal: { w: '8.5in', h: '14in' },
  }
  const dim = paperSizes[paper.size] || paperSizes.A4

  // Extract customer contact from rawData
  let customerEmail = '', customerPhone = '', customerAddress = ''
  try {
    if (invoice.rawData) {
      const d = JSON.parse(invoice.rawData)
      customerEmail = d['Email'] || d['email'] || d['e_mail'] || ''
      customerPhone = d['Phone'] || d['phone'] || d['mobile'] || d['Mobile'] || ''
      customerAddress = d['Address'] || d['address'] || d['customer_address'] || ''
    }
  } catch {}

  // Calculate tax total
  const taxTotal = sections.taxItems.reduce((sum, t) => sum + t.amount, 0)
  const discountAmount = invoice.subtotal > 0 ? (invoice.totalAmount - invoice.subtotal + taxTotal) : 0

  // Build booking details rows
  const bookingRows = sections.bookingDetails.map((d, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : BRAND.lightGray}">
      <td style="padding:11px 16px;font-size:12px;color:${BRAND.dark};font-weight:500;border-bottom:1px solid ${BRAND.border}">${d.label}</td>
      <td style="padding:11px 16px;font-size:12px;color:#475569;border-bottom:1px solid ${BRAND.border}">${d.value}</td>
    </tr>
  `).join('')

  // Build tax breakdown rows
  const taxRows = sections.taxItems.map(t => `
    <tr>
      <td style="padding:6px 16px;font-size:11px;color:${BRAND.gray};text-align:right">${t.label}</td>
      <td style="padding:6px 16px;font-size:11px;color:${BRAND.dark};text-align:right;font-weight:500;width:140px">${formatCurrency(t.amount)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="${invoice.languageCode || 'en'}">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: ${dim.w} ${dim.h}; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      color: ${BRAND.dark};
      background: #fff;
      width: ${dim.w};
      min-height: ${dim.h};
    }
    .page {
      min-height: ${dim.h};
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- ======== GEOMETRIC DECORATION (Top Right) ======== -->

    <!-- Left accent bar -->
    <div style="position:absolute;top:0;left:0;width:6px;height:100%;background:linear-gradient(180deg,${BRAND.blue} 0%,${BRAND.green} 100%)"></div>

    <!-- ======== HEADER ======== -->
    <div style="padding:36px 44px 24px 50px;display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
      <!-- Logo -->
      <div>
        ${invoice.companyLogo
          ? `<img src="${invoice.companyLogo}" style="max-height:100px;max-width:280px;object-fit:contain;margin-bottom:8px" />`
          : `<div style="display:flex;margin-bottom:8px">
              <div style="background:${BRAND.blue};color:#fff;padding:6px 18px;font-size:32px;font-weight:900;letter-spacing:-0.5px;border-radius:4px 0 0 4px">Sutt</div>
              <div style="background:${BRAND.green};color:#fff;padding:6px 18px;font-size:32px;font-weight:900;letter-spacing:-0.5px;border-radius:0 4px 4px 0">rula</div>
            </div>
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${BRAND.gray};font-weight:600">TOURS AND TRAVELS</div>`
        }
      </div>

      <!-- Company Contact -->
      <div style="text-align:right;font-size:15px;color:${BRAND.gray};line-height:1.7">
        ${invoice.companyPhone ? `<div>📞 <span style="color:${BRAND.dark};font-weight:600">${invoice.companyPhone}</span></div>` : ''}
        ${invoice.companyEmail ? `<div>✉️ <span style="color:${BRAND.dark};font-weight:600">${invoice.companyEmail}</span></div>` : ''}
        ${invoice.companyAddress ? `<div>📍 <span style="color:${BRAND.dark};font-weight:600">${invoice.companyAddress}</span></div>` : ''}
      </div>
    </div>

    <!-- Colored separator -->
    <div style="margin:0 44px 0 50px;height:3px;background:linear-gradient(90deg,${BRAND.blue},${BRAND.green})"></div>

    <!-- ======== INVOICE DETAILS ROW ======== -->
    <div style="padding:24px 44px 20px 50px;display:flex;justify-content:space-between;align-items:flex-start">
      <!-- Invoice To -->
      <div>
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND.blue};margin-bottom:8px">INVOICE TO</div>
        <div style="font-size:18px;font-weight:700;color:${BRAND.dark};margin-bottom:4px">${customerName || 'Valued Customer'}</div>
        ${customerPhone ? `<div style="font-size:11px;color:${BRAND.gray};margin-bottom:2px">Ph: ${customerPhone}</div>` : ''}
        ${customerEmail ? `<div style="font-size:11px;color:${BRAND.gray};margin-bottom:2px">Em: ${customerEmail}</div>` : ''}
        ${customerAddress ? `<div style="font-size:11px;color:${BRAND.gray};max-width:240px;line-height:1.5">${customerAddress}</div>` : ''}
      </div>

      <!-- Invoice Title & Meta -->
      <div style="text-align:right">
        <div style="font-size:11px;color:${BRAND.gray};line-height:1.8">
          <div>■ <span style="font-weight:600">Invoice No :</span> <span style="color:${BRAND.dark}">${invoice.invoiceNumber}</span></div>
          <div>■ <span style="font-weight:600">Invoice Date :</span> <span style="color:${BRAND.dark}">${formatDate(invoice.invoiceDate)}</span></div>
          <div>■ <span style="font-weight:600">Invoice Issued Date :</span> <span style="color:${BRAND.dark}">${formatDate(invoice.invoiceDate)}</span></div>
        </div>
      </div>
    </div>

    <!-- ======== SERVICE DESCRIPTION ======== -->
    ${invoice.aiDescription ? `
    <div style="padding:0 44px 16px 50px">
      <div style="background:${BRAND.lightGray};border-left:4px solid ${BRAND.blue};padding:12px 16px;border-radius:0 6px 6px 0">
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.blue};margin-bottom:4px">SERVICE DESCRIPTION</div>
        <div style="font-size:12px;line-height:1.6;color:#334155">${invoice.aiDescription}</div>
      </div>
    </div>
    ` : ''}

    <!-- ======== BOOKING DETAILS TABLE ======== -->
    ${bookingRows ? `
    <div style="padding:0 44px 0 50px">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="background:linear-gradient(135deg,${BRAND.blue},${BRAND.darkBlue});color:#fff;padding:12px 16px;font-size:11px;font-weight:700;letter-spacing:1px;text-align:left;text-transform:uppercase;width:40%">Booking Details</th>
            <th style="background:linear-gradient(135deg,${BRAND.green},${BRAND.darkGreen});color:#fff;padding:12px 16px;font-size:11px;font-weight:700;letter-spacing:1px;text-align:left;text-transform:uppercase">Information</th>
          </tr>
        </thead>
        <tbody>
          ${bookingRows}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- ======== TOTALS SECTION ======== -->
    <div style="padding:20px 44px 0 50px;display:flex;justify-content:flex-end;align-items:flex-start">
      <!-- Grand Total Bar -->
      <div style="min-width:320px">
        <div style="background:linear-gradient(135deg,${BRAND.green},${BRAND.darkGreen});padding:14px 20px;border-radius:6px;margin-top:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">GRAND TOTAL</span>
            <span style="color:#fff;font-size:22px;font-weight:800">${invoice.totalAmount}</span>
          </div>
          <div style="color:rgba(255,255,255,0.85);font-size:11px;font-style:italic;line-height:1.4">${numberToWords(invoice.totalAmount)} Only</div>
        </div>
      </div>
    </div>

    <!-- ======== SPACER ======== -->
    <div style="flex:1;min-height:24px"></div>

    <!-- ======== THANK YOU & TERMS ======== -->

    <!-- ======== PAYMENT METHODS ======== -->
    ${(invoice.bankAccountName || invoice.bankAccountNumber || invoice.bankName) ? `
    <div style="padding:0 44px 16px 50px">
      <div style="background:${BRAND.lightGray};border-radius:6px;padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND.dark};margin-bottom:8px">PAYMENT METHODS</div>
          <div style="font-size:10px;color:${BRAND.gray};line-height:1.7">
            ${invoice.bankAccountName ? `<div><strong>Account Name :</strong> ${invoice.bankAccountName}</div>` : ''}
            ${invoice.bankAccountNumber ? `<div><strong>Account No :</strong> ${invoice.bankAccountNumber}</div>` : ''}
            ${invoice.bankName ? `<div><strong>Bank :</strong> ${invoice.bankName}</div>` : ''}
          </div>
        </div>
        <div style="text-align:right">
          ${invoice.corporateIdentity ? `<div style="font-size:10px;color:${BRAND.gray}"><strong>Corporate Identity :</strong> ${invoice.corporateIdentity}</div>` : ''}
          ${invoice.companyGST ? `<div style="font-size:10px;color:${BRAND.gray};margin-top:2px"><strong>GSTIN :</strong> ${invoice.companyGST}</div>` : ''}
        </div>
      </div>
    </div>
    ` : ''}

    <!-- ======== FOOTER ======== -->
    <div style="background:${BRAND.dark};padding:16px 44px 16px 50px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:0.5px">
        This is a computer-generated invoice and requires no signature.
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:11px;font-weight:600;color:#fff;opacity:0.9">${invoice.companyName || 'Suttrula'}</span>
        <span style="width:1px;height:14px;background:rgba(255,255,255,0.3)"></span>
        <span style="font-size:10px;color:rgba(255,255,255,0.6)">${invoice.invoiceNumber}</span>
      </div>
    </div>

  </div>
</body>
</html>`
}
