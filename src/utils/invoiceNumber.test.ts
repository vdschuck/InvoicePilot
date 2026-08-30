import { getNextInvoiceNumber } from './invoiceNumber'

describe('getNextInvoiceNumber', () => {
  it('formats the sequence as a plain, unpadded number', () => {
    expect(getNextInvoiceNumber(1)).toBe('1')
    expect(getNextInvoiceNumber(7)).toBe('7')
    expect(getNextInvoiceNumber(42)).toBe('42')
  })
})
