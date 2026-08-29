# Development Plan

## Phase 1

Project setup.

- Vite
- React
- TypeScript
- Tailwind
- React Router
- ESLint
- Testing setup (Jest for unit tests, Playwright for end-to-end tests)
- Husky pre-commit hook that runs the full test suite

## Phase 2

Application shell.

- Navigation
- Layout
- Pages
- Responsive design
- Home page with Setup and Create Invoice buttons
- Route guards (redirect direct/URL access to any other route back to
  home; redirect in-app to /setup or /clients when prerequisites are
  missing)

## Phase 3

Contractor setup.

- Contractor form (including contact number)
- Validation
- localStorage persistence
- Edit functionality

## Phase 4

Clients.

- Client list
- Add client (including contact number and currency selection)
- Edit client
- Delete client
- Maximum 3 clients
- Validation

## Phase 5

Invoice creation.

- Automatic invoice number (unpadded, starting at 1)
- Manual invoice number editing
- Client selection
- Dates
- Dynamic invoice items
- Calculations
- Validation

## Phase 6

Invoice preview.

- FROM
- TO
- Dates
- Items
- Amount Due (formatted in the selected client's currency)

## Phase 7

PDF generation.

- PDF layout
- Table
- Totals
- Filename
- Download
- Error handling (failed generation shows an error and does not advance the sequence)

## Phase 8

Invoice sequence.

- Persist sequence
- Increment only after successful generation
- Ensure next invoice receives next number
- Idempotent repeat downloads of an unmodified draft

## Phase 9

Data reset.

- Delete-all-data control
- Message directing the user to reset data when stored data cannot be read

## Phase 10

Testing and polish.

- Responsive UI
- Error states
- Empty states
- Unit tests (Jest) for business logic
- End-to-end tests (Playwright) for invoice creation and PDF download
- Browser testing
