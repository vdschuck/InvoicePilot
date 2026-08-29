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

async function goToInvoicePage(
  page: import('@playwright/test').Page,
  invoiceSequence = 1,
) {
  await page.goto('/')
  await page.evaluate(
    ({ contractor, client, invoiceSequence }) => {
      localStorage.setItem(
        'invoicepilot:app-data',
        JSON.stringify({ contractor, clients: [client], invoiceSequence }),
      )
    },
    { contractor, client, invoiceSequence },
  )
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/invoice')
}

test('pre-fills an unpadded invoice number from the current sequence', async ({ page }) => {
  await goToInvoicePage(page, 7)
  await expect(page.getByLabel('Invoice number')).toHaveValue('INV-7')
})

test('allows manually editing the invoice number', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Invoice number').fill('INV-2026-007')
  await expect(page.getByLabel('Invoice number')).toHaveValue('INV-2026-007')
})

test('lists registered clients for selection', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await expect(page.getByLabel('Client')).toHaveValue('client-1')
})

test('computes item amount and invoice total live as items are entered', async ({ page }) => {
  await goToInvoicePage(page)

  await page.getByLabel('Quantity').fill('3')
  await page.getByLabel('Rate').fill('50')

  // "150.00" appears in the entry row's Amount and in the live preview's
  // item/Amount Due cells.
  await expect(page.getByText('150.00', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Total: 150.00')).toBeVisible()
})

test('adds and removes items dynamically, recalculating the total', async ({ page }) => {
  await goToInvoicePage(page)

  await page.getByLabel('Quantity').first().fill('2')
  await page.getByLabel('Rate').first().fill('10')

  await page.getByRole('button', { name: 'Add Item' }).click()
  await expect(page.getByLabel('Ref No')).toHaveCount(2)

  await page.getByLabel('Quantity').nth(1).fill('1')
  await page.getByLabel('Rate').nth(1).fill('30')
  await expect(page.getByText('Total: 50.00')).toBeVisible()

  await page.getByRole('button', { name: 'Remove' }).nth(1).click()
  await expect(page.getByLabel('Ref No')).toHaveCount(1)
  await expect(page.getByText('Total: 20.00')).toBeVisible()
})

test('disables removing the last remaining item', async ({ page }) => {
  await goToInvoicePage(page)
  await expect(page.getByRole('button', { name: 'Remove' })).toBeDisabled()
})

test('shows a validation error when the invoice number is cleared', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Invoice number').fill('')
  await page.getByLabel('Invoice number').blur()
  await expect(page.getByText('Invoice number is required')).toBeVisible()
})

test('shows a validation error for a zero quantity', async ({ page }) => {
  await goToInvoicePage(page)
  // The field's default value is already "0"; go through a distinct value
  // first so the change back to 0 is actually registered.
  await page.getByLabel('Quantity').fill('5')
  await page.getByLabel('Quantity').fill('0')
  await page.getByLabel('Quantity').blur()
  await expect(page.getByText('Quantity must be greater than 0')).toBeVisible()
})
