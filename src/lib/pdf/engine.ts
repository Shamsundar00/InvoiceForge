// ================================================================
// PDF Generation Engine using Puppeteer
// Renders beautiful HTML invoices to high-quality PDF
// ================================================================

import puppeteer, { type Browser } from 'puppeteer'

let browserInstance: Browser | null = null

// Reuse browser instance for performance
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance
  }
  browserInstance = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  })
  return browserInstance
}

interface PDFOptions {
  html: string
  paperSize?: 'A4' | 'A5' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
}

const paperFormats: Record<string, { width: string; height: string }> = {
  A4: { width: '210mm', height: '297mm' },
  A5: { width: '148mm', height: '210mm' },
  Letter: { width: '8.5in', height: '11in' },
  Legal: { width: '8.5in', height: '14in' },
}

export async function generatePDF(options: PDFOptions): Promise<Buffer> {
  const { html, paperSize = 'A4', orientation = 'portrait' } = options
  const format = paperFormats[paperSize] || paperFormats.A4

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    // Set content and wait for fonts to load
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000,
    })

    // Wait a bit for fonts to render
    await new Promise(resolve => setTimeout(resolve, 500))

    // Generate PDF
    const width = orientation === 'landscape' ? format.height : format.width
    const height = orientation === 'landscape' ? format.width : format.height

    const pdfBuffer = await page.pdf({
      width,
      height,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await page.close()
  }
}

export async function generateMultiplePDFs(
  htmlPages: string[],
  options: Omit<PDFOptions, 'html'> = {}
): Promise<Buffer[]> {
  const results: Buffer[] = []
  for (const html of htmlPages) {
    const pdf = await generatePDF({ html, ...options })
    results.push(pdf)
  }
  return results
}

// Cleanup browser on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    if (browserInstance) {
      browserInstance.close().catch(() => {})
    }
  })
}
