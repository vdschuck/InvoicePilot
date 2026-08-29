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

async function seedAppData(page: Page) {
  await page.goto('/')
  await page.evaluate(
    (data) => {
      localStorage.setItem(
        'invoicepilot:app-data',
        JSON.stringify({ contractor: data, clients: [], invoiceSequence: 1 }),
      )
    },
    contractor,
  )
}

test('Delete All Data is available from the header on every page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Delete All Data' })).toBeVisible()

  await page.getByRole('link', { name: 'Setup' }).click()
  await expect(page.getByRole('button', { name: 'Delete All Data' })).toBeVisible()
})

test('clearing data via the header returns the app to a fresh state', async ({ page }) => {
  await seedAppData(page)
  await page.reload()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete All Data' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'InvoicePilot' })).toBeVisible()

  const stored = await page.evaluate(() => localStorage.getItem('invoicepilot:app-data'))
  expect(stored).toBeNull()

  // With data cleared, Setup should show an empty form again rather than
  // the previously saved contractor.
  await page.getByRole('link', { name: 'Setup' }).click()
  await expect(page.getByLabel('Contractor name')).toHaveValue('')
})

test('does not clear data when the confirmation is dismissed', async ({ page }) => {
  await seedAppData(page)
  await page.reload()

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Delete All Data' }).click()

  const stored = await page.evaluate(() => localStorage.getItem('invoicepilot:app-data'))
  expect(stored).not.toBeNull()
})

test('shows a message and a working reset control when stored data is corrupted', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('invoicepilot:app-data', '{not valid json')
  })
  await page.reload()

  await expect(page.getByText("We couldn't read your saved data")).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete All Data' }).click()

  await expect(page.getByRole('heading', { name: 'InvoicePilot' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Setup' })).toBeVisible()

  const stored = await page.evaluate(() => localStorage.getItem('invoicepilot:app-data'))
  expect(stored).toBeNull()
})

test('the corrupted-data notice appears no matter which URL was requested', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('invoicepilot:app-data', '{not valid json')
  })

  await page.goto('/invoice')

  await expect(page.getByText("We couldn't read your saved data")).toBeVisible()
})
