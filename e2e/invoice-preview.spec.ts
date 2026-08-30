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

async function goToInvoicePage(page: import('@playwright/test').Page) {
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
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/invoice')
}

test('shows the contractor in the FROM section immediately', async ({ page }) => {
  await goToInvoicePage(page)
  await expect(page.getByText('Ada Lovelace')).toBeVisible()
  await expect(page.getByText('Analytical Engines Ltd')).toBeVisible()
})

test('shows a placeholder in the TO section until a client is selected', async ({ page }) => {
  await goToInvoicePage(page)
  await expect(page.getByText('No client selected')).toBeVisible()
})

test('updates the TO section once a client is selected', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await expect(page.getByText('Compilers Inc')).toBeVisible()
  await expect(page.getByText('No client selected')).toHaveCount(0)
})

test('reflects dates as they are entered', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Invoice date').fill('2026-01-01')
  await expect(page.getByText('January 1, 2026')).toBeVisible()
})

test('formats Amount Due using the selected client currency', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await page.getByLabel('Quantity').fill('2')
  await page.getByLabel('Rate').fill('25')

  await expect(page.getByText('$50.00').first()).toBeVisible()
})

test('shows plain numbers for Amount Due before a client is selected', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Quantity').fill('2')
  await page.getByLabel('Rate').fill('25')

  await expect(page.getByText('50.00', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('$50.00')).toHaveCount(0)
})
