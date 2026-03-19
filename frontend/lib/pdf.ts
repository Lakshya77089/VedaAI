import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// A4 dimensions in mm
const PAGE_W_MM = 210
const PAGE_H_MM = 297
const MARGIN_MM = 12          // uniform margin on all 4 sides
const MIN_SECTION_GAP_MM = 20 // push item to next page if less than this remains at bottom

interface PDFOptions {
  /** CSS selector for elements to hide before capture (e.g. answer key for questions-only) */
  hideSelector?: string
}

export async function downloadAsPDF(
  elementId: string,
  filename: string,
  options?: PDFOptions
): Promise<{ success: boolean; error?: string }> {
  const element = document.getElementById(elementId)
  if (!element) return { success: false, error: 'Element not found' }

  // 1. Hide requested elements (e.g. answer key)
  const hiddenEls: HTMLElement[] = []
  if (options?.hideSelector) {
    element.querySelectorAll<HTMLElement>(options.hideSelector).forEach((el) => {
      hiddenEls.push(el)
      el.style.display = 'none'
    })
  }

  // 2. Snapshot styles, then apply clean-capture overrides
  const savedCss = element.style.cssText
  element.style.boxShadow = 'none'
  element.style.borderRadius = '0'
  element.style.margin = '0'

  // 3. Wait for fonts so text renders crisply
  await document.fonts.ready

  // 4. Measure all break candidates: direct children (sections) + individual question items
  const rootRect = element.getBoundingClientRect()
  const directChildOffsets = Array.from(element.children).map(
    (c) => (c as HTMLElement).getBoundingClientRect().top - rootRect.top
  )
  const questionItemOffsets = Array.from(
    element.querySelectorAll<HTMLElement>('.question-item')
  ).map((el) => el.getBoundingClientRect().top - rootRect.top)

  // Deduplicate and sort all candidate cut points
  const sectionOffsets = [...new Set([...directChildOffsets, ...questionItemOffsets])].sort(
    (a, b) => a - b
  )

  try {
    // 5. Capture the element as a high-res canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Capture full scrollable height, not just the visible viewport
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
    })

    // 6. Restore element immediately after capture
    element.style.cssText = savedCss
    hiddenEls.forEach((el) => (el.style.display = ''))

    // ── Geometry ─────────────────────────────────────────────────────────────
    const contentW  = PAGE_W_MM - MARGIN_MM * 2   // printable width  in mm
    const contentH  = PAGE_H_MM - MARGIN_MM * 2   // printable height in mm

    // How many canvas pixels fit in one printable page height
    const pxPerMm     = canvas.width / contentW           // canvas px per mm
    const pageSlicePx = contentH * pxPerMm               // canvas px per page
    const minGapPx    = MIN_SECTION_GAP_MM * pxPerMm     // orphan threshold

    // Section starts in canvas-pixel coordinates
    const scaleRatio    = canvas.width / rootRect.width   // screen px → canvas px
    const sectionStarts = sectionOffsets.map((y) => y * scaleRatio)

    // ── Build page slices ────────────────────────────────────────────────────
    const pages: Array<{ y: number; h: number }> = []
    let cursor = 0

    while (cursor < canvas.height) {
      let sliceH = Math.min(pageSlicePx, canvas.height - cursor)

      // If this is not the last page, avoid orphaning a section header
      if (cursor + sliceH < canvas.height) {
        const cutAt  = cursor + sliceH
        const orphan = sectionStarts.find((sy) => sy > cutAt - minGapPx && sy < cutAt)
        if (orphan !== undefined) {
          // Cut just before the upcoming section
          sliceH = Math.max(1, orphan - cursor - 2)
        }
      }

      pages.push({ y: cursor, h: sliceH })
      cursor += sliceH
    }

    // ── Render each page into the PDF ────────────────────────────────────────
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < pages.length; i++) {
      const { y: sliceY, h: sliceH } = pages[i]

      // Draw this slice onto a temporary canvas with a white background
      const pageCanvas    = document.createElement('canvas')
      pageCanvas.width    = canvas.width
      pageCanvas.height   = Math.ceil(sliceH)

      const ctx = pageCanvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

      if (i > 0) pdf.addPage()

      // imgH preserves the aspect ratio: width maps to contentW
      const imgH = (sliceH / canvas.width) * contentW
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        MARGIN_MM,
        MARGIN_MM,
        contentW,
        imgH
      )
    }

    pdf.save(filename || 'question-paper.pdf')
    return { success: true }
  } catch (err) {
    // Always restore styles even on failure
    element.style.cssText = savedCss
    hiddenEls.forEach((el) => (el.style.display = ''))
    console.error('PDF generation error:', err)
    return { success: false, error: 'Could not generate PDF. Please try again.' }
  }
}
