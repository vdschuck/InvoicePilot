import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { Contractor, InvoiceDraft } from '../types'
import { calculateInvoiceTotal, calculateItemAmount } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'

const MARGIN_X = 14

type DocumentWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } }

function writeLines(doc: jsPDF, x: number, y: number, lines: string[]): void {
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * 5)
  })
}

export function generateInvoicePdf(contractor: Contractor, draft: InvoiceDraft): jsPDF {
  const doc = new jsPDF()
  const currency = draft.client.currency

  doc.setFontSize(20)
  doc.text('INVOICE', MARGIN_X, 20)
  doc.setFontSize(12)
  doc.text(draft.invoiceNumber, MARGIN_X, 28)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('FROM', MARGIN_X, 40)
  doc.text('TO', 110, 40)
  doc.setFont('helvetica', 'normal')

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

  const datesY = 80
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Date', MARGIN_X, datesY)
  doc.text('Issued Date', 80, datesY)
  doc.text('Due Date', 146, datesY)
  doc.setFont('helvetica', 'normal')
  doc.text(draft.invoiceDate, MARGIN_X, datesY + 6)
  doc.text(draft.issuedDate, 80, datesY + 6)
  doc.text(draft.dueDate, 146, datesY + 6)

  autoTable(doc, {
    startY: datesY + 16,
    head: [['Ref No', 'Description In Detail', 'Quantity', 'Rate', 'Amount']],
    body: draft.items.map((item) => [
      item.refNo,
      item.description,
      String(item.quantity),
      formatCurrency(item.rate, currency),
      formatCurrency(calculateItemAmount(item.quantity, item.rate), currency),
    ]),
  })

  const total = calculateInvoiceTotal(draft.items)
  const finalY = (doc as DocumentWithAutoTable).lastAutoTable?.finalY ?? datesY + 16

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Amount Due: ${formatCurrency(total, currency)}`, MARGIN_X, finalY + 12)

  return doc
}

export function getInvoiceFilename(invoiceNumber: string): string {
  return `invoice-${invoiceNumber}.pdf`
}
