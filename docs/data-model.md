# Data Model

## Contractor

```ts
interface Contractor {
  name?: string; // optional
  companyName: string;
  addressLine1: string;
  addressLine2?: string; // optional
  city: string;
  state: string;
  country: string;
  zipCode: string;
  contactNumber?: string; // optional
  paymentInformation?: string; // free-form, multi-line; optional
}
```

## Client

```ts
interface Client {
  id: string; // GUID
  companyName: string;
  addressLine1: string;
  addressLine2?: string; // optional
  city: string;
  state: string;
  country: string;
  zipCode: string;
  contactNumber?: string; // optional
  currency: string; // ISO 4217 currency code, e.g. "USD"
  bankingDetails?: string; // free-form, multi-line; optional
}
```

## Invoice Item
```ts
interface InvoiceItem {
  id: string; // sequential within the draft, e.g. "1", "2", "3"
  refNo: string;
  description: string;
  quantity: number;
  rate: number;
}
```

## Invoice Draft
```ts
interface InvoiceDraft {
  invoiceNumber: string;
  client: Client;
  invoiceDate: string;
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
}
```

## Persistent Application Data
```ts
interface AppData {
  contractor: Contractor;
  clients: Client[];
  invoiceSequence: number;
}
```

Stored under the localStorage key `invoicepilot:app-data`. All application localStorage keys must use the `invoicepilot:` prefix.

## Constraints

- clients.length <= 3
- invoiceSequence >= 1
- invoice item quantity > 0
- invoice item rate >= 0
- invoice must contain at least one item
- client.currency must be a valid ISO 4217 currency code