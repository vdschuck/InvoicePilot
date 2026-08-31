import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { INTER_BOLD_BASE64, INTER_REGULAR_BASE64 } from '../assets/fonts/inter'
import type { Contractor, InvoiceDraft } from '../types'
import { formatAddressLines } from '../utils/address'
import { calculateInvoiceTotal, calculateItemAmount } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { formatLongDate } from '../utils/dateFormat'

const MARGIN_X = 14
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

function writeLabeledLines(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  lines: string[],
): number {
  doc.setFontSize(10)
  doc.setFont(FONT_NAME, 'bold')
  doc.text(label, x, y)
  doc.setFont(FONT_NAME, 'normal')
  writeLines(doc, x, y + 6, lines)
  return y + 6 + lines.length * 5 + 4
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

  const fromLines = [
    contractor.name,
    contractor.companyName,
    ...formatAddressLines(contractor),
    contractor.contactNumber,
  ].filter((line): line is string => Boolean(line))

  const toLines = [
    draft.client.companyName,
    ...formatAddressLines(draft.client),
    draft.client.contactNumber,
  ].filter((line): line is string => Boolean(line))

  writeLines(doc, MARGIN_X, 46, fromLines)
  writeLines(doc, 110, 46, toLines)

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

  let datesY = finalY + 18
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

  const totalsY = datesY + 10
  let leftY = totalsY

  if (draft.client.bankingDetails) {
    leftY = writeLabeledLines(
      doc,
      MARGIN_X,
      leftY,
      'Client Banking Information',
      draft.client.bankingDetails.split('\n'),
    )
  }

  if (contractor.paymentInformation) {
    writeLabeledLines(doc, MARGIN_X, leftY, 'Payment Information:', contractor.paymentInformation.split('\n'))
  }

  doc.setFontSize(13)
  doc.setFont(FONT_NAME, 'bold')
  doc.text('Amount Due:', labelRightX, totalsY, { align: 'right' })
  doc.text(formatCurrency(total, currency), valueX, totalsY)

  return doc
}

export function getInvoiceFilename(invoiceNumber: string): string {
  return `invoice-${invoiceNumber}.pdf`
}
