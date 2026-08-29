import { clientSchema } from './client'

function validClient() {
  return {
    name: 'Grace Hopper',
    companyName: 'Compilers Inc',
    streetAddress: '1 Turing Way',
    city: 'Arlington',
    state: 'VA',
    country: 'United States',
    contactNumber: '+1 555-0100',
    currency: 'USD',
  }
}

describe('clientSchema', () => {
  it('accepts a fully filled client', () => {
    expect(clientSchema.safeParse(validClient()).success).toBe(true)
  })

  it.each(['name', 'companyName', 'streetAddress', 'city', 'state', 'country', 'contactNumber'])(
    'rejects a blank %s',
    (field) => {
      const result = clientSchema.safeParse({ ...validClient(), [field]: '  ' })
      expect(result.success).toBe(false)
    },
  )

  it('rejects a currency code that is not in the supported list', () => {
    const result = clientSchema.safeParse({ ...validClient(), currency: 'XXX' })
    expect(result.success).toBe(false)
  })

  it('rejects a blank currency', () => {
    const result = clientSchema.safeParse({ ...validClient(), currency: '' })
    expect(result.success).toBe(false)
  })
})
