import type { Contractor, InvoiceDraft } from '../types'
import { generateInvoicePdf, getInvoiceFilename } from './pdf'

const contractor: Contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  contactNumber: '+44 20 7946 0958',
}

function makeDraft(overrides: Partial<InvoiceDraft> = {}): InvoiceDraft {
  return {
    invoiceNumber: 'INV-1',
    client: {
      id: '1',
      name: 'Grace Hopper',
      companyName: 'Compilers Inc',
      streetAddress: '1 Turing Way',
      city: 'Arlington',
      state: 'VA',
      country: 'United States',
      contactNumber: '+1 555-0100',
      currency: 'USD',
    },
    invoiceDate: '2026-01-01',
    issuedDate: '2026-01-01',
    dueDate: '2026-01-15',
    items: [{ id: '1', refNo: 'A-1', description: 'Consulting', quantity: 2, rate: 100 }],
    ...overrides,
  }
}

describe('generateInvoicePdf', () => {
  it('produces a non-empty PDF document', () => {
    const doc = generateInvoicePdf(contractor, makeDraft())
    const blob = doc.output('blob')
    expect(blob.size).toBeGreaterThan(0)
    expect(blob.type).toBe('application/pdf')
  })

  it('embeds the contractor, client, dates, and item text in the PDF content', () => {
    const draft = makeDraft()
    const raw = generateInvoicePdf(contractor, draft).output()

    expect(raw).toContain(contractor.name)
    expect(raw).toContain(contractor.companyName)
    expect(raw).toContain(draft.client.name)
    expect(raw).toContain(draft.client.companyName)
    expect(raw).toContain(draft.invoiceNumber)
    expect(raw).toContain(draft.invoiceDate)
    expect(raw).toContain(draft.items[0].refNo)
    expect(raw).toContain(draft.items[0].description)
  })

  it('formats amounts using the client currency, not a raw number only', () => {
    const raw = generateInvoicePdf(contractor, makeDraft()).output()
    // 2 * 100 = 200.00, formatted as USD.
    expect(raw).toContain('$200.00')
  })

  it('supports multiple invoice items', () => {
    const draft = makeDraft({
      items: [
        { id: '1', refNo: 'A-1', description: 'Consulting', quantity: 2, rate: 100 },
        { id: '2', refNo: 'A-2', description: 'Materials', quantity: 5, rate: 20 },
        { id: '3', refNo: 'A-3', description: 'Travel', quantity: 1, rate: 50 },
      ],
    })
    const doc = generateInvoicePdf(contractor, draft)
    const blob = doc.output('blob')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('does not throw for a single-item invoice', () => {
    expect(() => generateInvoicePdf(contractor, makeDraft())).not.toThrow()
  })
})

describe('getInvoiceFilename', () => {
  it('builds the filename from the invoice number', () => {
    expect(getInvoiceFilename('INV-1')).toBe('invoice-INV-1.pdf')
    expect(getInvoiceFilename('INV-42')).toBe('invoice-INV-42.pdf')
  })

  it('uses a manually edited invoice number verbatim', () => {
    expect(getInvoiceFilename('INV-2026-007')).toBe('invoice-INV-2026-007.pdf')
  })
})
