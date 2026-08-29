# InvoicePilot

## Project Overview

This is a local-first invoice generation application built with React and TypeScript.

The application allows a user to:

1. Register their contractor information.
2. Register up to 3 clients.
3. Create invoices.
4. Download invoices as PDF files.

The application does not maintain invoice history. All persistent application data is stored locally in the browser using localStorage.

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- jsPDF
- jspdf-autotable
- localStorage
- Husky
- Jest
- Playwright

## Important Architecture Rules

- Do not introduce a backend.
- Do not introduce a database.
- Do not introduce authentication.
- Do not store completed invoices.
- Do not create invoice history.
- Do not use Redux unless there is a demonstrated need.
- Keep the application local-first.

## Code Quality

- Use TypeScript.
- Prefer small, focused components.
- Keep business logic outside presentation components when practical.
- Keep localStorage access inside a dedicated storage service.
- Do not duplicate business logic.
- Validate user input.
- Write tests for important business rules.

## Development Rules

Before implementing a feature:

1. Understand the relevant requirements.
2. Check existing architecture.
3. Avoid unnecessary changes.
4. Implement the smallest maintainable solution.
5. Run tests/type checking after changes.
6. Do not change requirements without explicitly identifying the conflict.
7. Prioritize code clarity and readbility over single line optimizations.
8. A Husky pre-commit hook must run the full local test suite before allowing a commit.

## Privacy

The application should not send contractor, client, or invoice data
to an external server. All user data remains in the user browser.
