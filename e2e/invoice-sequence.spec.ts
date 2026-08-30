import { expect, test, type Page } from '@playwright/test'

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

async function seedAppData(page: Page, invoiceSequence: number) {
  // Only seed once: addInitScript re-runs on every navigation this page
  // makes, and some tests here navigate again later (e.g. back to "/" to
  // check the next invoice number) after the sequence has already advanced.
  // Re-running the seed unconditionally would wipe that progress out.
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
}

async function getStoredSequence(page: Page): Promise<number> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('invoicepilot:app-data')
    return raw ? JSON.parse(raw).invoiceSequence : null
  })
}

async function goToInvoicePage(page: Page, invoiceSequence = 1) {
  await seedAppData(page, invoiceSequence)
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/invoice')
}

async function fillValidDraft(page: Page) {
  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await page.getByLabel('Invoice date').fill('2026-01-01')
  await page.getByLabel('Issued date').fill('2026-01-01')
  await page.getByLabel('Due date').fill('2026-01-15')
  await page.getByLabel('Ref No').fill('A-1')
  await page.getByLabel('Description').fill('Consulting services')
  await page.getByLabel('Quantity').fill('2')
  await page.getByLabel('Rate').fill('100')
}

async function download(page: Page) {
  const [downloadEvent] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])
  return downloadEvent
}

test('advances the invoice sequence after a successful download', async ({ page }) => {
  await goToInvoicePage(page, 1)
  await fillValidDraft(page)

  await download(page)

  await expect.poll(() => getStoredSequence(page)).toBe(2)
})

test('is idempotent: downloading the same unmodified draft again does not advance the sequence twice', async ({
  page,
}) => {
  await goToInvoicePage(page, 1)
  await fillValidDraft(page)

  await download(page)
  await expect.poll(() => getStoredSequence(page)).toBe(2)

  await download(page)
  await expect.poll(() => getStoredSequence(page)).toBe(2)
})

test('advances the sequence again when the draft is modified before downloading again', async ({
  page,
}) => {
  await goToInvoicePage(page, 1)
  await fillValidDraft(page)

  await download(page)
  await expect.poll(() => getStoredSequence(page)).toBe(2)

  await page.getByLabel('Quantity').fill('5')
  await download(page)

  await expect.poll(() => getStoredSequence(page)).toBe(3)
})

test('the next invoice draft receives the next sequence number', async ({ page }) => {
  await goToInvoicePage(page, 1)
  await fillValidDraft(page)
  await download(page)
  await expect.poll(() => getStoredSequence(page)).toBe(2)

  await page.goto('/')
  await page.getByRole('link', { name: 'Create Invoice' }).click()

  await expect(page.getByLabel('Invoice number')).toHaveValue('2')
})
