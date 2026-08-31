import { contractorSchema } from './contractor'

function validContractor() {
  return {
    name: 'Ada Lovelace',
    companyName: 'Analytical Engines Ltd',
    streetAddress: '1 Babbage Street',
    city: 'London',
    state: 'London',
    country: 'United Kingdom',
    zipCode: 'EC1A 1BB',
    contactNumber: '+44 20 7946 0958',
  }
}

describe('contractorSchema', () => {
  it('accepts a fully filled contractor', () => {
    const result = contractorSchema.safeParse(validContractor())
    expect(result.success).toBe(true)
  })

  it.each(Object.keys(validContractor()).filter((field) => field !== 'name'))(
    'rejects a blank %s',
    (field) => {
      const result = contractorSchema.safeParse({ ...validContractor(), [field]: '  ' })
      expect(result.success).toBe(false)
    },
  )

  it('trims surrounding whitespace', () => {
    const result = contractorSchema.parse({
      ...validContractor(),
      name: '  Ada Lovelace  ',
    })
    expect(result.name).toBe('Ada Lovelace')
  })

  it('accepts a contractor with no name', () => {
    const contractor = validContractor()
    delete (contractor as Partial<typeof contractor>).name
    const result = contractorSchema.safeParse(contractor)
    expect(result.success).toBe(true)
  })

  it('accepts a contractor with no payment information', () => {
    const result = contractorSchema.safeParse(validContractor())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.paymentInformation).toBeUndefined()
    }
  })

  it('accepts and trims multi-line payment information', () => {
    const result = contractorSchema.safeParse({
      ...validContractor(),
      paymentInformation: '  TIN (CUI/CIF): 12345\nAccount No: 1234567890  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.paymentInformation).toBe('TIN (CUI/CIF): 12345\nAccount No: 1234567890')
    }
  })
})
