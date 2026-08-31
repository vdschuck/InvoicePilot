import { clientSchema } from './client'

function validClient() {
  return {
    companyName: 'Compilers Inc',
    addressLine1: '1 Turing Way',
    city: 'Arlington',
    state: 'VA',
    country: 'United States',
    zipCode: '22201',
    contactNumber: '+1 555-0100',
    currency: 'USD',
  }
}

describe('clientSchema', () => {
  it('accepts a fully filled client', () => {
    expect(clientSchema.safeParse(validClient()).success).toBe(true)
  })

  it.each(['companyName', 'addressLine1', 'city', 'state', 'country', 'zipCode', 'contactNumber'])(
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

  it('accepts a client with no banking details', () => {
    const result = clientSchema.safeParse(validClient())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.bankingDetails).toBeUndefined()
    }
  })

  it('accepts and trims multi-line banking details', () => {
    const result = clientSchema.safeParse({
      ...validClient(),
      bankingDetails: '  TIN (CUI/CIF): 12345\nAccount No: 1234567890  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.bankingDetails).toBe('TIN (CUI/CIF): 12345\nAccount No: 1234567890')
    }
  })
})
