import { expect, test } from '@playwright/test'

const contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  zipCode: 'EC1A 1BB',
  contactNumber: '+44 20 7946 0958',
}

async function fillContractorForm(page: import('@playwright/test').Page, values: typeof contractor) {
  await page.getByLabel('Contractor name').fill(values.name)
  await page.getByLabel('Company name').fill(values.companyName)
  await page.getByLabel('Street address').fill(values.streetAddress)
  await page.getByLabel('City').fill(values.city)
  await page.getByLabel('State').fill(values.state)
  await page.getByLabel('Country').fill(values.country)
  await page.getByLabel('Zip code').fill(values.zipCode)
  await page.getByLabel('Contact number').fill(values.contactNumber)
}

test('shows validation errors when saving an empty form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Setup Data' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
})

test('saving contractor information goes straight to Clients', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Setup Data' }).click()

  await fillContractorForm(page, contractor)
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page).toHaveURL('/clients')

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('invoicepilot:app-data') ?? 'null'),
  )
  expect(stored.contractor).toEqual({ ...contractor, paymentInformation: '' })
})

test('saves multi-line payment information entered for the contractor', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Setup Data' }).click()

  await fillContractorForm(page, contractor)
  await page
    .getByLabel('Payment information')
    .fill('TIN (CUI/CIF): 12345\nAccount No: 1234567890\nBank: First National')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page).toHaveURL('/clients')

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('invoicepilot:app-data') ?? 'null'),
  )
  expect(stored.contractor.paymentInformation).toBe(
    'TIN (CUI/CIF): 12345\nAccount No: 1234567890\nBank: First National',
  )
})

test('keeps Create Invoice disabled when a contractor exists but no client is registered', async ({
  page,
}) => {
  await page.addInitScript((data) => {
    if (!localStorage.getItem('invoicepilot:app-data')) {
      localStorage.setItem(
        'invoicepilot:app-data',
        JSON.stringify({ contractor: data, clients: [], invoiceSequence: 1 }),
      )
    }
  }, contractor)
  await page.goto('/')

  // Contractor configured but no clients yet: Create Invoice stays disabled.
  const createInvoiceButton = page.getByRole('button', { name: 'Create Invoice' })
  await expect(createInvoiceButton).toBeDisabled()

  // Resubmitting the (already-configured) contractor form is the way back
  // to Clients to register one.
  await page.getByRole('link', { name: 'Setup Data' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page).toHaveURL('/clients')
})

test('pre-fills and updates existing contractor information', async ({ page }) => {
  const client = {
    id: 'client-1',
    name: 'Grace Hopper',
    companyName: 'Compilers Inc',
    streetAddress: '1 Turing Way',
    city: 'Arlington',
    state: 'VA',
    country: 'United States',
    contactNumber: '+1 555-0100',
    currency: 'USD',
  }
  await page.addInitScript(
    ({ contractor, client }) => {
      if (!localStorage.getItem('invoicepilot:app-data')) {
        localStorage.setItem(
          'invoicepilot:app-data',
          JSON.stringify({ contractor, clients: [client], invoiceSequence: 1 }),
        )
      }
    },
    { contractor, client },
  )
  await page.goto('/')

  await page.getByRole('link', { name: 'Setup Data' }).click()
  await expect(page.getByLabel('Contractor name')).toHaveValue(contractor.name)

  await page.getByLabel('City').fill('Manchester')
  await page.getByRole('button', { name: 'Save' }).click()

  // Saving always goes to Clients, regardless of how many are registered.
  await expect(page).toHaveURL('/clients')

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('invoicepilot:app-data') ?? 'null'),
  )
  expect(stored.contractor.city).toBe('Manchester')
})
