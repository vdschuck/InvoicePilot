# Invoice Specification

## Header

Display:

INVOICE

Invoice number

---

## FROM

Display contractor:

- Contractor Name
- Company Name
- Street Address
- City, State, Country
- Contact Number

---

## TO

Display selected client:

- Client Name
- Company Name
- Street Address
- City, State, Country
- Contact Number

---

## Dates

Display:

Invoice Date
Issued Date
Due Date

---

## Items Table

Columns:

1. Ref No
2. Description In Detail
3. Quantity
4. Rate
5. Amount

Amount:

quantity × rate

All monetary values are displayed in the selected client's currency.

---

## Total

Display:

Amount Due

The amount due is the sum of all item amounts.

If the selected client has banking details on file, display them to the left of Amount Due, at the same level, preceded by the label: Client Banking Information.

Banking details are free-form and multi-line. If the client has no banking details on file, nothing is displayed in their place.

---

## PDF

The PDF must:

- Be professionally formatted.
- Be readable when printed.
- Support multiple invoice items.
- Calculate amounts correctly.
- Display the same information as the invoice preview.
- Use the invoice number in the filename.

Example:

invoice-1.pdf