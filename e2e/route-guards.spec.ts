import { expect, test } from '@playwright/test'

test.describe('direct URL access', () => {
  for (const path of ['/setup', '/clients', '/invoice', '/does-not-exist']) {
    test(`redirects ${path} back to the home page`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL('/')
      await expect(page.getByRole('heading', { name: 'InvoicePilot' })).toBeVisible()
    })
  }
})

test.describe('in-app navigation prerequisites', () => {
  test('Setup is reachable with no contractor configured', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Setup' }).click()
    await expect(page).toHaveURL('/setup')
    await expect(page.getByRole('heading', { name: 'Setup' })).toBeVisible()
  })

  test('Create Invoice redirects to Setup when no contractor is configured', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Create Invoice' }).click()
    await expect(page).toHaveURL('/setup')
  })

  test('Create Invoice redirects to Clients when the contractor exists but no client is registered', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'invoicepilot:app-data',
        JSON.stringify({
          contractor: {
            name: 'Ada Lovelace',
            companyName: '',
            streetAddress: '',
            city: '',
            state: '',
            country: '',
            contactNumber: '',
          },
          clients: [],
          invoiceSequence: 1,
        }),
      )
    })
    await page.getByRole('link', { name: 'Create Invoice' }).click()
    await expect(page).toHaveURL('/clients')
  })

  test('Create Invoice succeeds when a contractor and a client exist', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'invoicepilot:app-data',
        JSON.stringify({
          contractor: {
            name: 'Ada Lovelace',
            companyName: '',
            streetAddress: '',
            city: '',
            state: '',
            country: '',
            contactNumber: '',
          },
          clients: [
            {
              id: '1',
              name: 'Client',
              companyName: '',
              streetAddress: '',
              city: '',
              state: '',
              country: '',
              contactNumber: '',
              currency: 'USD',
            },
          ],
          invoiceSequence: 1,
        }),
      )
    })
    await page.getByRole('link', { name: 'Create Invoice' }).click()
    await expect(page).toHaveURL('/invoice')
    await expect(page.getByRole('heading', { name: 'Create Invoice' })).toBeVisible()
  })
})
