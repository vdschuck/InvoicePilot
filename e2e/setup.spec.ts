import { expect, test } from '@playwright/test'

const contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  contactNumber: '+44 20 7946 0958',
}

async function fillContractorForm(page: import('@playwright/test').Page, values: typeof contractor) {
  await page.getByLabel('Contractor name').fill(values.name)
  await page.getByLabel('Company name').fill(values.companyName)
  await page.getByLabel('Street address').fill(values.streetAddress)
  await page.getByLabel('City').fill(values.city)
  await page.getByLabel('State').fill(values.state)
  await page.getByLabel('Country').fill(values.country)
  await page.getByLabel('Contact number').fill(values.contactNumber)
}

test('shows validation errors when saving an empty form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Setup' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
})

test('saves contractor information and unlocks Create Invoice', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Setup' }).click()

  await fillContractorForm(page, contractor)
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByRole('status')).toHaveText('Contractor information saved.')

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('invoicepilot:app-data') ?? 'null'),
  )
  expect(stored.contractor).toEqual(contractor)

  // Contractor now configured but no clients yet: Create Invoice should
  // redirect to Clients instead of Setup.
  await page.getByRole('link', { name: 'InvoicePilot' }).click()
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/clients')
})

test('pre-fills and updates existing contractor information', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((data) => {
    localStorage.setItem(
      'invoicepilot:app-data',
      JSON.stringify({ contractor: data, clients: [], invoiceSequence: 1 }),
    )
  }, contractor)

  await page.getByRole('link', { name: 'Setup' }).click()
  await expect(page.getByLabel('Contractor name')).toHaveValue(contractor.name)

  await page.getByLabel('City').fill('Manchester')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('status')).toBeVisible()

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('invoicepilot:app-data') ?? 'null'),
  )
  expect(stored.contractor.city).toBe('Manchester')
})
