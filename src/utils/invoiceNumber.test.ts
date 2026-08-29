import { getNextInvoiceNumber } from './invoiceNumber'

describe('getNextInvoiceNumber', () => {
  it('formats the sequence with no zero-padding', () => {
    expect(getNextInvoiceNumber(1)).toBe('INV-1')
    expect(getNextInvoiceNumber(7)).toBe('INV-7')
    expect(getNextInvoiceNumber(42)).toBe('INV-42')
  })
})
