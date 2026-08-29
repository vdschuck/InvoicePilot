# Architecture

## Frontend

React + TypeScript.

## Routing

React Router.

Routes:

/
 /setup
 /clients
 /invoice

## Route Guards

`/` is the home page and is always accessible. It presents two entry
points: a "Setup" button and a "Create Invoice" button.

Directly accessing any route other than `/` (typing the URL,
refreshing on it, or opening a bookmark to it) redirects to `/`. Only
navigation originating from within the application may reach
`/setup`, `/clients`, or `/invoice`.

Within the application, normal navigation still enforces:

- `/clients` redirects to `/setup` if the contractor is not configured.
- `/invoice` redirects to `/setup` if the contractor is not configured,
  or to `/clients` if the contractor is configured but no client is
  registered.

## State

Use React Context for application-level persistent state.

Invoice draft can be local component/context state.

Do not use Redux unless required.

## Persistence

Use localStorage.

All localStorage access must go through:

src/services/storage.ts

Components should not directly call localStorage.

All keys must be prefixed to namespace application data, e.g.
`invoicepilot:app-data`.

## PDF

PDF generation belongs in:

src/services/pdf.ts

Use:

- jsPDF
- jspdf-autotable

## Components

Invoice-related components should live under:

src/components/invoice/

Client-related components should live under:

src/components/clients/

## Business Logic

Calculations and invoice-number logic should live under:

src/utils/

Examples:

calculateItemAmount()
calculateInvoiceTotal()
getNextInvoiceNumber()

## IDs

- Client IDs are generated as GUIDs (`crypto.randomUUID()`).
- Invoice item IDs are generated sequentially within a draft (not globally persisted, and reset for each new draft).

## Currency

Each client has a selected currency (ISO 4217 code). Invoice totals and item amounts are formatted using the currency of the invoice's
selected client. Formatting logic should live in a single shared utility under src/utils/ so the preview and PDF stay consistent.

## Data Reset

A control to delete all localStorage application data must be provided. If stored data fails to parse on load, the UI must show a message directing the user to that control.

## Testing

- Jest for unit tests of business logic (src/utils/, src/services/).
- Playwright for end-to-end/browser tests, including the invoice
  creation and PDF download flow.
- A Husky pre-commit hook runs the full test suite.
