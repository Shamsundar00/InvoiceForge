// ================================================================
// Creative Invoice HTML Generator — Clean, Professional Layout
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
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGST?: string
}

interface PaperConfig {
  size: 'A4' | 'A5' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
}

const categoryThemes: Record<string, {
  primary: string; gradient: string; light: string; icon: string; tagline: string
}> = {
  Travel:         { primary: '#4F46E5', gradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)', light: '#EEF2FF', icon: '✈️', tagline: 'Travel Services' },
  Flight:         { primary: '#4F46E5', gradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)', light: '#EEF2FF', icon: '✈️', tagline: 'Flight Booking' },
  'Luxury Travel': { primary: '#B45309', gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)', light: '#FFFBEB', icon: '👑', tagline: 'Premium Travel' },
  Entertainment:  { primary: '#DB2777', gradient: 'linear-gradient(135deg, #BE185D 0%, #EC4899 100%)', light: '#FDF2F8', icon: '🎬', tagline: 'Entertainment' },
  Hospitality:    { primary: '#D97706', gradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)', light: '#FFFBEB', icon: '🏨', tagline: 'Hospitality' },
  'Tour Operators': { primary: '#059669', gradient: 'linear-gradient(135deg, #047857 0%, #10B981 100%)', light: '#ECFDF5', icon: '🗺️', tagline: 'Tour Package' },
  Consulting:     { primary: '#7C3AED', gradient: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)', light: '#F5F3FF', icon: '💼', tagline: 'Consulting' },
  'E-commerce':   { primary: '#DC2626', gradient: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)', light: '#FEF2F2', icon: '🛍️', tagline: 'E-Commerce' },
  Any:            { primary: '#475569', gradient: 'linear-gradient(135deg, #334155 0%, #64748B 100%)', light: '#F8FAFC', icon: '📄', tagline: 'Invoice' },
}

function getTheme(category: string) {
  return categoryThemes[category] || categoryThemes['Any']
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

function parseDetails(rawData: string | undefined): Array<{ label: string; value: string }> {
  if (!rawData) return []
  try {
    const data = JSON.parse(rawData)
    const skip = new Set(['first_name', 'last_name', 'firstName', 'lastName'])
    return Object.entries(data)
      .filter(([k, v]) => !skip.has(k) && v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => ({
        label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: String(v),
      }))
  } catch { return [] }
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  function convert(n: number): string {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '')
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '')
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '')
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '')
  }
  const rupees = Math.floor(num)
  const paise = Math.round((num - rupees) * 100)
  let result = 'Rupees ' + convert(rupees)
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise'
  return result
}

// ---- MAIN HTML GENERATOR ----
export function generateInvoiceHTML(invoice: InvoiceData, paper: PaperConfig = { size: 'A4', orientation: 'portrait' }): string {
  const theme = getTheme(invoice.category)
  const details = parseDetails(invoice.rawData)
  const customerName = `${invoice.customerFirstName} ${invoice.customerLastName}`.trim()

  const paperSizes: Record<string, { w: string; h: string }> = {
    A4: { w: '210mm', h: '297mm' },
    A5: { w: '148mm', h: '210mm' },
    Letter: { w: '8.5in', h: '11in' },
    Legal: { w: '8.5in', h: '14in' },
  }
  const dim = paperSizes[paper.size] || paperSizes.A4

  // Build details table rows
  const detailsHTML = details.length > 0 ? details.map(d => `
    <tr>
      <td style="padding:8px 12px;font-size:12px;color:#64748B;border-bottom:1px solid #F1F5F9;width:40%">${d.label}</td>
      <td style="padding:8px 12px;font-size:12px;color:#1E293B;font-weight:500;border-bottom:1px solid #F1F5F9">${d.value}</td>
    </tr>
  `).join('') : ''

  return `<!DOCTYPE html>
<html lang="${invoice.languageCode || 'en'}">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: ${dim.w} ${dim.h}; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      color: #1E293B;
      background: #fff;
      width: ${dim.w};
      min-height: ${dim.h};
    }
    .page {
      padding: 0;
      min-height: ${dim.h};
      display: flex;
      flex-direction: column;
      position: relative;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- ======== HEADER ======== -->
    <div style="background:${theme.gradient};color:#fff;padding:28px 40px 24px;position:relative;overflow:hidden">
      <!-- Decorative circle -->
      <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>
      <div style="position:absolute;bottom:-30px;right:60px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.04)"></div>

      <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
        <!-- Company Info -->
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700;margin-bottom:2px">
            ${invoice.companyName || 'InvoiceForge'}
          </div>
          <div style="font-size:10px;opacity:0.7;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">${theme.tagline}</div>
          ${invoice.companyAddress ? `<div style="font-size:10px;opacity:0.65;line-height:1.5">${invoice.companyAddress}</div>` : ''}
          ${invoice.companyPhone ? `<div style="font-size:10px;opacity:0.65">Ph: ${invoice.companyPhone}</div>` : ''}
          ${invoice.companyEmail ? `<div style="font-size:10px;opacity:0.65">${invoice.companyEmail}</div>` : ''}
          ${invoice.companyGST ? `<div style="font-size:10px;opacity:0.8;font-weight:600;margin-top:4px">GSTIN: ${invoice.companyGST}</div>` : ''}
        </div>
        <!-- Invoice Info -->
        <div style="text-align:right">
          <div style="font-size:28px;margin-bottom:4px">${theme.icon}</div>
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.7;margin-bottom:4px">INVOICE</div>
          <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700">${invoice.invoiceNumber}</div>
          <div style="font-size:11px;opacity:0.7;margin-top:2px">${formatDate(invoice.invoiceDate)}</div>
        </div>
      </div>
    </div>
    <!-- Accent bar -->
    <div style="height:4px;background:linear-gradient(90deg,${theme.primary},transparent)"></div>

    <!-- ======== BODY ======== -->
    <div style="flex:1;padding:28px 40px 20px;display:flex;flex-direction:column">

      <!-- Bill To + Invoice Info Row -->
      <div style="display:flex;gap:24px;margin-bottom:24px">
        <div style="flex:1;background:${theme.light};border-radius:10px;padding:18px 20px;border-left:4px solid ${theme.primary}">
          <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${theme.primary};margin-bottom:6px">BILLED TO</div>
          <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:600;color:#0F172A;margin-bottom:4px">${customerName || 'Customer'}</div>
          <div style="display:inline-block;padding:3px 10px;background:${theme.primary}15;color:${theme.primary};border-radius:20px;font-size:10px;font-weight:600">${invoice.category || 'General'}</div>
        </div>
        <div style="width:200px;background:#F8FAFC;border-radius:10px;padding:18px 20px">
          <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#64748B;margin-bottom:8px">DETAILS</div>
          <div style="font-size:11px;color:#475569;line-height:1.8">
            <div><span style="color:#94A3B8">Invoice:</span> <strong>${invoice.invoiceNumber}</strong></div>
            <div><span style="color:#94A3B8">Date:</span> ${formatDate(invoice.invoiceDate)}</div>
            <div><span style="color:#94A3B8">Category:</span> ${invoice.category || 'General'}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:20px 22px;margin-bottom:24px;position:relative">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${theme.gradient};border-radius:10px 10px 0 0"></div>
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${theme.primary};margin-bottom:8px">DESCRIPTION</div>
        <div style="font-size:12.5px;line-height:1.8;color:#334155">${invoice.aiDescription || 'Professional services rendered.'}</div>
      </div>

      <!-- Details Table -->
      ${detailsHTML ? `
      <div style="margin-bottom:24px">
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#64748B;margin-bottom:8px;padding-left:4px">BOOKING DETAILS</div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0">
          ${detailsHTML}
        </table>
      </div>
      ` : ''}

      <!-- Total Amount Box -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
        <div style="background:${theme.gradient};color:#fff;border-radius:12px;padding:20px 32px;text-align:center;min-width:240px;position:relative;overflow:hidden;box-shadow:0 6px 24px ${theme.primary}30">
          <div style="position:absolute;top:-15px;right:-15px;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.08)"></div>
          <div style="font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:0.7;margin-bottom:2px">TOTAL AMOUNT</div>
          <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700">${formatCurrency(invoice.totalAmount)}</div>
          <div style="font-size:9px;opacity:0.6;margin-top:4px;font-style:italic">${numberToWords(invoice.totalAmount)} Only</div>
        </div>
      </div>

      <!-- QR Verification -->
      ${invoice.qrVerificationHash ? `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 18px;background:#F8FAFC;border-radius:8px;border:1px dashed #CBD5E1;margin-bottom:24px">
        <div style="width:56px;height:56px;background:#fff;border-radius:6px;border:1px solid #E2E8F0;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 50 50" width="48" height="48">
            ${generateQRPattern(invoice.qrVerificationHash)}
          </svg>
        </div>
        <div style="font-size:10px;color:#64748B;line-height:1.5">
          <div style="font-weight:600;color:#475569;margin-bottom:2px">🔐 Digitally Verified Invoice</div>
          <div>This invoice has been verified by InvoiceForge.</div>
          <div style="font-family:monospace;font-size:9px;color:#94A3B8;margin-top:3px">Hash: ${invoice.qrVerificationHash.substring(0, 24)}...</div>
        </div>
      </div>
      ` : ''}

      <!-- Spacer to push footer down -->
      <div style="flex:1"></div>

      <!-- Footer -->
      <div style="border-top:2px solid #F1F5F9;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:${theme.primary};margin-bottom:4px">Thank you for your business!</div>
          <div style="font-size:9px;color:#94A3B8;line-height:1.5">
            This is a computer-generated invoice.<br>
            Generated by <span style="font-weight:700;color:${theme.primary}">InvoiceForge</span> • ${formatDate(new Date().toISOString())}
          </div>
        </div>
        <div style="text-align:right;font-size:9px;color:#94A3B8">
          ${invoice.companyName ? `<div style="font-weight:600;color:#475569">${invoice.companyName}</div>` : ''}
          <div>${invoice.invoiceNumber}</div>
        </div>
      </div>
    </div>

    <!-- Bottom accent -->
    <div style="height:4px;background:${theme.gradient}"></div>
  </div>
</body>
</html>`
}

function generateQRPattern(hash: string): string {
  const rects: string[] = []
  const s = 5
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const c = hash.charCodeAt((i * 10 + j) % hash.length)
      if (c % 3 !== 0) {
        rects.push(`<rect x="${i * s}" y="${j * s}" width="${s - 0.5}" height="${s - 0.5}" fill="#1E293B" rx="0.5"/>`)
      }
    }
  }
  rects.push(`<rect x="0" y="0" width="12" height="12" fill="none" stroke="#1E293B" stroke-width="2" rx="1"/>`)
  rects.push(`<rect x="3" y="3" width="6" height="6" fill="#1E293B" rx="0.5"/>`)
  rects.push(`<rect x="38" y="0" width="12" height="12" fill="none" stroke="#1E293B" stroke-width="2" rx="1"/>`)
  rects.push(`<rect x="41" y="3" width="6" height="6" fill="#1E293B" rx="0.5"/>`)
  rects.push(`<rect x="0" y="38" width="12" height="12" fill="none" stroke="#1E293B" stroke-width="2" rx="1"/>`)
  rects.push(`<rect x="3" y="41" width="6" height="6" fill="#1E293B" rx="0.5"/>`)
  return rects.join('')
}
