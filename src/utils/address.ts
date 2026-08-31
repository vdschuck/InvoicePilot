interface AddressFields {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  zipCode: string
}

export function formatAddressLines(address: AddressFields): string[] {
  const line1 = [address.addressLine1, address.addressLine2].filter(Boolean).join(', ')
  const line2 = `${address.city}, ${address.state} - ${address.zipCode}`
  return [line1, line2, address.country]
}
