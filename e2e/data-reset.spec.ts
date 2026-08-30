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

test('Delete All Data is available on the home page but not elsewhere', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Delete All Data' })).toBeVisible()

  await page.getByRole('link', { name: 'Setup Data' }).click()
  await expect(page.getByRole('button', { name: 'Delete All Data' })).toHaveCount(0)
})

test('shows a custom confirmation dialog instead of the browser default', async ({ page }) => {
  await page.goto('/')

  // If the app were still using window.confirm, this listener would fire
  // and the test would hang waiting for a dialog that never resolves on its
  // own; asserting no 'dialog' event fires proves the custom modal is used.
  let nativeDialogFired = false
  page.on('dialog', () => {
    nativeDialogFired = true
  })

  await page.getByRole('button', { name: 'Delete All Data' }).click()

  await expect(page.getByRole('alertdialog')).toBeVisible()
  await expect(page.getByText(/cannot be undone/i)).toBeVisible()
  expect(nativeDialogFired).toBe(false)
})

test('clearing data from the home page returns the app to a fresh state', async ({ page }) => {
  await seedAppData(page)
  await page.reload()

  await page.getByRole('button', { name: 'Delete All Data' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Invoice Pilot' })).toBeVisible()

  const stored = await page.evaluate(() => localStorage.getItem('invoicepilot:app-data'))
  expect(stored).toBeNull()

  // With data cleared, Setup should show an empty form again rather than
  // the previously saved contractor.
  await page.getByRole('link', { name: 'Setup Data' }).click()
  await expect(page.getByLabel('Contractor name')).toHaveValue('')
})

test('does not clear data when the confirmation is cancelled', async ({ page }) => {
  await seedAppData(page)
  await page.reload()

  await page.getByRole('button', { name: 'Delete All Data' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()

  await expect(page.getByRole('alertdialog')).toHaveCount(0)
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

  await page.getByRole('button', { name: 'Delete All Data' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Invoice Pilot' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Setup Data' })).toBeVisible()

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
