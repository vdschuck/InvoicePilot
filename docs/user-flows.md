# User Flows

## Home Page

User opens application.

The application shows the home page (`/`).

The home page displays two buttons:

    Setup
    Create Invoice

User clicks Setup to configure the contractor, or Create Invoice to start creating an invoice.

If the contractor has not been configured yet, the Create Invoice button is disabled. Hovering over it shows a message explaining that Setup must be completed first.

---

## First Visit

If contractor information has not been configured:

    Show setup flow.

User enters contractor information.

User saves information.

After saving contractor information, the user is always taken to the Clients screen.

---

## Route Guards

If the user tries to access any screen other than the home page
directly (typing a URL, refreshing on it, or opening a bookmark), the
application redirects to the home page.

Within the application:

If the user navigates to Clients before the contractor is configured,
the application redirects to Setup.

If the user navigates to Create Invoice before the contractor is
configured, the application redirects to Setup.

If the user navigates to Create Invoice after the contractor is
configured but with zero clients registered, the application
redirects to Clients.

---

## Client Registration

User opens Clients.

User sees current client count:

    0 / 3

User clicks Add Client.

User fills client information.

User saves client.

Client is stored in localStorage.

Maximum:

    3 clients

When 3 clients exist, Add Client is disabled.


User can delete an existing client.

---

## Create Invoice

User opens Create Invoice.

The application immediately generates the next invoice number.

Example: 7

The invoice number field is populated.

The user can manually change it.

Example:

    INV-2026-007

The application must not leave the invoice number empty.

---

### Step 1 — Invoice Number

Automatically populated.

User may edit.

---

### Step 2 — Select Client

User selects one of the registered clients.

The client information is displayed in the TO section.

---

### Step 3 — Dates

User selects:

- Invoice Date
- Issued Date
- Due Date

---

### Step 4 — Invoice Items

User adds one or more items.

Each item contains:

- Ref No
- Description
- Quantity
- Rate

Amount is calculated automatically.

---

### Step 5 — Preview

The invoice preview updates as the user changes the form.

---

### Step 6 — Generate PDF

User clicks Download PDF.

The application generates the PDF.

If generation succeeds:

    The invoice sequence is updated.

If generation fails:

    An error message is shown.
    The invoice sequence is not updated.
    The user can retry generation from the same draft.

The invoice itself is not persisted.

---

## Completed Invoice

After downloading:

- The invoice remains available in the current screen if desired.
- The invoice is not saved to invoice history.
- The invoice data does not need to be stored in localStorage.
- Clicking Download PDF again on the same, unmodified draft
  re-generates and re-downloads the PDF but does not advance the
  invoice sequence again.
- If the user modifies the draft after a successful download and
  clicks Download PDF again, this is treated as a new generation and
  advances the sequence.

---

## Data Reset

User opens the data reset control (e.g. "Delete All Data").

User confirms the action.

All contractor, client, and invoice sequence data is deleted from
localStorage.

If the application cannot read the stored data on startup (e.g. it is
corrupted), the application shows a message directing the user to
this control.
