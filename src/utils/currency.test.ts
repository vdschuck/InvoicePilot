import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats an amount using the given currency code', () => {
    expect(formatCurrency(150, 'USD')).toBe('$150.00')
  })

  it('formats a different currency with its own symbol', () => {
    expect(formatCurrency(150, 'GBP')).toBe('£150.00')
  })

  it('rounds to two decimal places', () => {
    expect(formatCurrency(19.999, 'USD')).toBe('$20.00')
  })

  it('falls back to a plain number when the currency code is invalid', () => {
    expect(formatCurrency(150, 'NOT-A-CODE')).toBe('150.00')
  })
})
