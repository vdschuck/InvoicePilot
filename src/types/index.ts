export interface Contractor {
  name: string
  companyName: string
  streetAddress: string
  city: string
  state: string
  country: string
  contactNumber: string
}

export interface Client {
  id: string
  name: string
  companyName: string
  streetAddress: string
  city: string
  state: string
  country: string
  contactNumber: string
  currency: string
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
