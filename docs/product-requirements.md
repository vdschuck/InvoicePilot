# Product Requirements

## Product

Invoice Generator

## Goal

Provide a simple browser-based application for creating professional
invoices without requiring an account, backend, or cloud storage.

## Target User

An individual contractor or small business that needs to generate
invoices quickly.

## Core Requirements

### Contractor Information

The user can register:

- Contractor name
- Company name
- Street address
- City
- State
- Country
- Contact number

### Clients

The user can register a maximum of 3 clients. The limit must be
enforced both in the UI and in the application logic.

The user can edit and delete a registered client.

Each client contains:

- Client name
- Company name
- Street address
- City
- State
- Country
- Contact number
- Currency (selected when the client is registered or edited; used to
  display and calculate amounts on invoices for that client)
- Banking details (optional)

Client IDs are generated as GUIDs.

Banking details are shown on the invoice preview and PDF only when not empty.

### Invoice

The user can create an invoice containing:

- Invoice number
- Invoice date
- Issued date
- Due date
- Selected client
- Invoice items

Each invoice item contains:

- Reference number
- Description in detail
- Quantity
- Rate

The amount for each item is:

quantity × rate

The invoice total is the sum of all item amounts, displayed in the
selected client's currency.

Invoice item IDs are generated sequentially within a draft (not
globally persisted).

### PDF

The user can download the completed invoice as a PDF.

The PDF and on-screen invoice preview must use the same invoice data
model. A separate, inconsistent data model must not be created for
PDF generation.

### Persistence

The application stores only:

- Contractor information
- Clients (including each client's selected currency)
- Invoice sequence

Completed invoices are not persisted. The invoice currently being
created is temporary application state.

### Data Reset

The application must provide a control (e.g. a "Delete All Data"
button) that clears all application data from localStorage.

If the application cannot read or parse the stored data on startup
(e.g. corrupted or malformed JSON), it must display a message
instructing the user to delete the stored data using this control.

## Invoice Number Rules

When the Create Invoice screen opens, the invoice number must
already contain an automatically generated number.

The format is the sequence number itself, with no prefix and no zero-padding (e.g. `1`, `7`,`42`).

The invoice sequence starts at 1. The first invoice ever generated is `1`.

The user may manually edit the invoice number.

The invoice number must never initially be blank.

Manual changes to the invoice number must not modify the automatic invoice sequence.

The sequence should advance only when the invoice PDF is generated successfully. If generation fails, an error must be shown, the sequence must not advance, and the user must be able to retry generation from the same draft.

Clicking Download again on the same draft, without changing it after a successful download, must be idempotent: the PDF may be re-generated/re-downloaded, but the sequence must not advance a second time for that draft. Modifying the draft after a successful download and downloading again is treated as a new generation and advances the sequence.

Concurrent use of the application in multiple browser tabs is not supported. Two tabs open at the same time may read and advance the same sequence value independently, which can produce duplicate invoice numbers. This is an accepted limitation.

## Route Guards

`/` is the home page and is always accessible. It presents two entry points: a Setup button and a Create Invoice button.

Directly accessing any route other than `/` (typing the URL,
refreshing on it, or opening a bookmark to it) redirects to `/`.

Within the application, normal navigation still enforces:

- `/clients` requires the contractor to be configured; otherwise
  redirect to `/setup`.
- `/invoice` requires the contractor to be configured and at least one client to be registered; otherwise redirect to `/setup`.

## Storage Keys

All localStorage keys used by the application must be prefixed to namespace them, e.g `invoicepilot:app-data`. No key may be written without this prefix.
