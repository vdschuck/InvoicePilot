import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { INTER_BOLD_BASE64, INTER_REGULAR_BASE64 } from '../assets/fonts/inter'
import type { Contractor, InvoiceDraft } from '../types'
import { calculateInvoiceTotal, calculateItemAmount } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { formatLongDate } from '../utils/dateFormat'

const MARGIN_X = 14
const PAGE_RIGHT_X = 196
const FONT_NAME = 'Inter'
const HEADER_GRAY: [number, number, number] = [243, 244, 246]
const BORDER_GRAY: [number, number, number] = [229, 231, 235]

type DocumentWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } }

function writeLines(doc: jsPDF, x: number, y: number, lines: string[]): void {
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * 5)
  })
}

function registerInterFont(doc: jsPDF): void {
  doc.addFileToVFS('Inter-Regular.ttf', INTER_REGULAR_BASE64)
  doc.addFont('Inter-Regular.ttf', FONT_NAME, 'normal')
  doc.addFileToVFS('Inter-Bold.ttf', INTER_BOLD_BASE64)
  doc.addFont('Inter-Bold.ttf', FONT_NAME, 'bold')
}

function writeRightAlignedPair(
  doc: jsPDF,
  y: number,
  label: string,
  value: string,
  gap: number,
  labelStyle: 'normal' | 'bold' = 'bold',
  valueStyle: 'normal' | 'bold' = 'normal',
): void {
  doc.setFont(FONT_NAME, valueStyle)
  const valueWidth = doc.getTextWidth(value)
  doc.text(value, PAGE_RIGHT_X, y, { align: 'right' })

  doc.setFont(FONT_NAME, labelStyle)
  const labelX = PAGE_RIGHT_X - valueWidth - gap
  doc.text(label, labelX, y, { align: 'right' })
}

export function generateInvoicePdf(contractor: Contractor, draft: InvoiceDraft): jsPDF {
  const doc = new jsPDF()
  const currency = draft.client.currency

  registerInterFont(doc)
  doc.setFont(FONT_NAME, 'normal')

  doc.setFontSize(26)
  doc.setFont(FONT_NAME, 'bold')
  doc.text(`Invoice # ${draft.invoiceNumber}`, MARGIN_X, 24)

  doc.setFontSize(10)
  doc.setFont(FONT_NAME, 'bold')
  doc.text('FROM', MARGIN_X, 40)
  doc.text('TO', 110, 40)
  doc.setFont(FONT_NAME, 'normal')

  writeLines(doc, MARGIN_X, 46, [
    contractor.name,
    contractor.companyName,
    contractor.streetAddress,
    `${contractor.city}, ${contractor.state}, ${contractor.country}`,
    contractor.contactNumber,
  ])

  writeLines(doc, 110, 46, [
    draft.client.name,
    draft.client.companyName,
    draft.client.streetAddress,
    `${draft.client.city}, ${draft.client.state}, ${draft.client.country}`,
    draft.client.contactNumber,
  ])

  autoTable(doc, {
    startY: 80,
    head: [['Ref No', 'Description In Detail', 'Quantity', 'Rate', 'Amount']],
    body: draft.items.map((item) => [
      item.refNo,
      item.description,
      String(item.quantity),
      formatCurrency(item.rate, currency),
      formatCurrency(calculateItemAmount(item.quantity, item.rate), currency),
    ]),
    theme: 'plain',
    styles: {
      font: FONT_NAME,
      fontSize: 10,
      cellPadding: 3,
      lineColor: BORDER_GRAY,
      lineWidth: { bottom: 0.2 },
    },
    headStyles: {
      font: FONT_NAME,
      fillColor: HEADER_GRAY,
      textColor: 0,
      fontStyle: 'bold',
      lineWidth: { bottom: 0.3 },
    },
    columnStyles: {
      0: { cellWidth: 18 },
      2: { cellWidth: 28 },
      3: { cellWidth: 24 },
      4: { cellWidth: 26 },
    },
  })

  const total = calculateInvoiceTotal(draft.items)
  const finalY = (doc as DocumentWithAutoTable).lastAutoTable?.finalY ?? 80

  doc.setDrawColor(...BORDER_GRAY)
  doc.line(MARGIN_X, finalY + 8, PAGE_RIGHT_X, finalY + 8)

  doc.setFontSize(13)
  writeRightAlignedPair(doc, finalY + 18, 'Amount Due:', formatCurrency(total, currency), 6, 'bold', 'bold')

  let datesY = finalY + 30
  doc.setFontSize(10)
  const dateRows: [string, string][] = [
    ['Invoice Date:', formatLongDate(draft.invoiceDate)],
    ['Issued Date:', formatLongDate(draft.issuedDate)],
    ['Due Date:', formatLongDate(draft.dueDate)],
  ]

  // Labels are right-aligned to a shared x (so the colons line up) and
  // values are left-aligned starting at a shared x right after, so every
  // value starts in the same column regardless of its own or its label's
  // length.
  const labelRightX = 150
  const valueX = 154

  dateRows.forEach(([label, value]) => {
    doc.setFont(FONT_NAME, 'bold')
    doc.text(label, labelRightX, datesY, { align: 'right' })
    doc.setFont(FONT_NAME, 'normal')
    doc.text(value, valueX, datesY)
    datesY += 6
  })

  return doc
}

export function getInvoiceFilename(invoiceNumber: string): string {
  return `invoice-${invoiceNumber}.pdf`
}
