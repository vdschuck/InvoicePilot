import { calculateInvoiceTotal, calculateItemAmount } from './calculations'

describe('calculateItemAmount', () => {
  it('multiplies quantity by rate', () => {
    expect(calculateItemAmount(3, 25)).toBe(75)
  })

  it('returns 0 when rate is 0', () => {
    expect(calculateItemAmount(5, 0)).toBe(0)
  })
})

describe('calculateInvoiceTotal', () => {
  it('sums the amount of every item', () => {
    const total = calculateInvoiceTotal([
      { quantity: 2, rate: 10 },
      { quantity: 1, rate: 50 },
      { quantity: 3, rate: 5 },
    ])
    expect(total).toBe(85)
  })

  it('returns 0 for an empty list', () => {
    expect(calculateInvoiceTotal([])).toBe(0)
  })
})
