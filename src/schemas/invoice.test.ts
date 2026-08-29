import { createInvoiceSchema } from './invoice'

function validDraft() {
  return {
    invoiceNumber: 'INV-1',
    clientId: 'client-1',
    invoiceDate: '2026-01-01',
    issuedDate: '2026-01-01',
    dueDate: '2026-01-15',
    items: [
      { id: '1', refNo: 'A-1', description: 'Consulting', quantity: 2, rate: 100 },
    ],
  }
}

describe('createInvoiceSchema', () => {
  const schema = createInvoiceSchema(['client-1', 'client-2'])

  it('accepts a fully filled, valid draft', () => {
    expect(schema.safeParse(validDraft()).success).toBe(true)
  })

  it('rejects a blank invoice number', () => {
    const result = schema.safeParse({ ...validDraft(), invoiceNumber: '  ' })
    expect(result.success).toBe(false)
  })

  it('rejects a client id that is not in the registered list', () => {
    const result = schema.safeParse({ ...validDraft(), clientId: 'unknown-client' })
    expect(result.success).toBe(false)
  })

  it.each(['invoiceDate', 'issuedDate', 'dueDate'])('rejects a blank %s', (field) => {
    const result = schema.safeParse({ ...validDraft(), [field]: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty items array', () => {
    const result = schema.safeParse({ ...validDraft(), items: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an item with zero quantity', () => {
    const draft = validDraft()
    const result = schema.safeParse({
      ...draft,
      items: [{ ...draft.items[0], quantity: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an item with a negative rate', () => {
    const draft = validDraft()
    const result = schema.safeParse({
      ...draft,
      items: [{ ...draft.items[0], rate: -1 }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts an item with a zero rate', () => {
    const draft = validDraft()
    const result = schema.safeParse({
      ...draft,
      items: [{ ...draft.items[0], rate: 0 }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an item missing a ref number or description', () => {
    const draft = validDraft()
    expect(
      schema.safeParse({ ...draft, items: [{ ...draft.items[0], refNo: '' }] }).success,
    ).toBe(false)
    expect(
      schema.safeParse({ ...draft, items: [{ ...draft.items[0], description: '' }] }).success,
    ).toBe(false)
  })
})
