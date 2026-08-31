export interface Contractor {
  name?: string
  companyName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  zipCode: string
  contactNumber?: string
  paymentInformation?: string
}

export interface Client {
  id: string
  companyName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  country: string
  zipCode: string
  contactNumber?: string
  currency: string
  bankingDetails?: string
}

interface InvoiceItem {
  id: string
  refNo: string
  description: string
  quantity: number
  rate: number
}

export interface InvoiceDraft {
  invoiceNumber: string
  client: Client
  invoiceDate: string
  issuedDate: string
  dueDate: string
  items: InvoiceItem[]
}

export interface AppData {
  contractor: Contractor
  clients: Client[]
  invoiceSequence: number
}
