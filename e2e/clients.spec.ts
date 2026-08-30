import { expect, test, type Page } from '@playwright/test'

const contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  contactNumber: '+44 20 7946 0958',
}

const clientA = {
  name: 'Grace Hopper',
  companyName: 'Compilers Inc',
  streetAddress: '1 Turing Way',
  city: 'Arlington',
  state: 'VA',
  country: 'United States',
  contactNumber: '+1 555-0100',
  currency: 'USD',
}

async function goToClientsPage(page: Page) {
  // Seed via addInitScript (runs before the app's own scripts) so the home
  // page's initial render already reflects the contractor being configured,
  // rather than seeding after the page has already rendered. Guarded so a
  // later navigation on this page doesn't re-run the seed and wipe out
  // anything the test has since added.
  await page.addInitScript((data) => {
    if (!localStorage.getItem('invoicepilot:app-data')) {
      localStorage.setItem(
        'invoicepilot:app-data',
        JSON.stringify({ contractor: data, clients: [], invoiceSequence: 1 }),
      )
    }
  }, contractor)
  await page.goto('/')
  // Create Invoice stays disabled until a client exists, so the only in-app
  // path to /clients is resubmitting the already-configured contractor form,
  // which always navigates to /clients on success.
  await page.getByRole('link', { name: 'Setup Data' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page).toHaveURL('/clients')
}

async function fillClientForm(page: Page, values: typeof clientA) {
  await page.getByLabel('Client name').fill(values.name)
  await page.getByLabel('Company name').fill(values.companyName)
  await page.getByLabel('Street address').fill(values.streetAddress)
  await page.getByLabel('City').fill(values.city)
  await page.getByLabel('State').fill(values.state)
  await page.getByLabel('Country').fill(values.country)
  await page.getByLabel('Contact number').fill(values.contactNumber)
  await page.getByLabel('Currency').selectOption(values.currency)
}

test('shows validation errors when saving an empty client form', async ({ page }) => {
  await goToClientsPage(page)
  await page.getByRole('button', { name: 'Add Client' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
})

test('adds a client and unlocks Create Invoice', async ({ page }) => {
  await goToClientsPage(page)

  await fillClientForm(page, clientA)
  await page.getByRole('button', { name: 'Add Client' }).click()

  await expect(page.getByText('Grace Hopper')).toBeVisible()
  await expect(page.getByText('1 / 3')).toBeVisible()

  await page.getByRole('link', { name: 'InvoicePilot' }).click()
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/invoice')
})

test('enforces the maximum of 3 clients in the UI', async ({ page }) => {
  await goToClientsPage(page)

  for (let i = 1; i <= 3; i += 1) {
    await fillClientForm(page, { ...clientA, name: `Client ${i}` })
    await page.getByRole('button', { name: 'Add Client' }).click()
    await expect(page.getByText(`Client ${i}`)).toBeVisible()
  }

  await expect(page.getByText('3 / 3')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Client' })).toBeDisabled()
})

test('edits an existing client', async ({ page }) => {
  await goToClientsPage(page)
  await fillClientForm(page, clientA)
  await page.getByRole('button', { name: 'Add Client' }).click()
  await expect(page.getByText('Grace Hopper')).toBeVisible()

  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Client name').fill('Grace B. Hopper')
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await expect(page.getByText('Grace B. Hopper')).toBeVisible()
  await expect(page.getByText('Grace Hopper', { exact: true })).toHaveCount(0)
})

test('deletes a client after confirming in the custom dialog', async ({ page }) => {
  await goToClientsPage(page)
  await fillClientForm(page, clientA)
  await page.getByRole('button', { name: 'Add Client' }).click()
  await expect(page.getByText('Grace Hopper')).toBeVisible()

  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page.getByText('Grace Hopper')).toHaveCount(0)
  await expect(page.getByText('0 / 3')).toBeVisible()
})

test('does not delete a client when the confirmation dialog is cancelled', async ({ page }) => {
  await goToClientsPage(page)
  await fillClientForm(page, clientA)
  await page.getByRole('button', { name: 'Add Client' }).click()
  await expect(page.getByText('Grace Hopper')).toBeVisible()

  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  const dialog = page.getByRole('alertdialog')
  await dialog.getByRole('button', { name: 'Cancel' }).click()

  await expect(dialog).toHaveCount(0)
  await expect(page.getByText('Grace Hopper')).toBeVisible()
})
