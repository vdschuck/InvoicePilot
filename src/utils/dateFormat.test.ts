import { formatLongDate } from './dateFormat'

describe('formatLongDate', () => {
  it('formats an ISO date as a long US-style date', () => {
    expect(formatLongDate('2026-12-31')).toBe('December 31, 2026')
  })

  it('does not shift the date across a UTC/local timezone boundary', () => {
    expect(formatLongDate('2026-01-01')).toBe('January 1, 2026')
  })

  it('returns the input unchanged when it is not a valid ISO date', () => {
    expect(formatLongDate('')).toBe('')
    expect(formatLongDate('not-a-date')).toBe('not-a-date')
  })
})
