import { contractorSchema } from './contractor'

function validContractor() {
  return {
    name: 'Ada Lovelace',
    companyName: 'Analytical Engines Ltd',
    streetAddress: '1 Babbage Street',
    city: 'London',
    state: 'London',
    country: 'United Kingdom',
    contactNumber: '+44 20 7946 0958',
  }
}

describe('contractorSchema', () => {
  it('accepts a fully filled contractor', () => {
    const result = contractorSchema.safeParse(validContractor())
    expect(result.success).toBe(true)
  })

  it.each(Object.keys(validContractor()))('rejects a blank %s', (field) => {
    const result = contractorSchema.safeParse({ ...validContractor(), [field]: '  ' })
    expect(result.success).toBe(false)
  })

  it('trims surrounding whitespace', () => {
    const result = contractorSchema.parse({
      ...validContractor(),
      name: '  Ada Lovelace  ',
    })
    expect(result.name).toBe('Ada Lovelace')
  })
})
