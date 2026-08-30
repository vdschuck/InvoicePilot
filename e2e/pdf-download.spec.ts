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
  await page.addInitScript(
    ({ contractor, client, invoiceSequence }) => {
      if (!localStorage.getItem('invoicepilot:app-data')) {
        localStorage.setItem(
          'invoicepilot:app-data',
          JSON.stringify({ contractor, clients: [client], invoiceSequence }),
        )
      }
    },
    { contractor, client, invoiceSequence },
  )
  await page.goto('/')
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/invoice')
}

async function fillValidDraft(page: import('@playwright/test').Page) {
  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await page.getByLabel('Invoice date').fill('2026-01-01')
  await page.getByLabel('Issued date').fill('2026-01-01')
  await page.getByLabel('Due date').fill('2026-01-15')
  await page.getByLabel('Ref No').fill('A-1')
  await page.getByLabel('Description').fill('Consulting services')
  await page.getByLabel('Quantity').fill('4')
  await page.getByLabel('Rate').fill('75')
}

test('downloads a PDF named after the invoice number', async ({ page }) => {
  await goToInvoicePage(page, 7)
  await fillValidDraft(page)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])

  expect(download.suggestedFilename()).toBe('invoice-7.pdf')

  const filePath = await download.path()
  expect(filePath).not.toBeNull()
  const fs = await import('node:fs/promises')
  const contents = await fs.readFile(filePath as string)
  expect(contents.subarray(0, 5).toString('ascii')).toBe('%PDF-')
})

test('uses a manually edited invoice number in the filename', async ({ page }) => {
  await goToInvoicePage(page)
  await fillValidDraft(page)
  await page.getByLabel('Invoice number').fill('INV-2026-007')

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])

  expect(download.suggestedFilename()).toBe('invoice-INV-2026-007.pdf')
})

test('does not download and shows validation errors for an incomplete draft', async ({
  page,
}) => {
  await goToInvoicePage(page)

  let downloadHappened = false
  page.once('download', () => {
    downloadHappened = true
  })

  await page.getByRole('button', { name: 'Download PDF' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Select a client' })).toBeVisible()

  expect(downloadHappened).toBe(false)
})
