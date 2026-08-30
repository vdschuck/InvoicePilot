# InvoicePilot

An invoice generator built with React and TypeScript. Register your contractor details, register up to 3 clients, create invoices, and download them as PDFs — all in the browser. There is no backend, no database, and no account: everything is stored in your browser's `localStorage`, and no data ever leaves your machine.

## Features

- Contractor setup (name, company, address, contact number)
- Up to 3 clients, each with its own currency
- Invoice creation with automatic, editable invoice numbers
- A live invoice preview that updates as you type
- PDF generation and download
- A "Delete All Data" control to reset the app

## Requirements

- Node.js 20+ (Node 22 recommended)
- npm

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).

## Other Commands

```bash
npm run build       # Type-check and build for production
npm run preview     # Preview the production build locally
npm run typecheck   # Run TypeScript's type checker
npm run lint        # Run ESLint
npm test            # Run unit tests (Jest)
npm run test:e2e    # Run end-to-end tests (Playwright)
```
