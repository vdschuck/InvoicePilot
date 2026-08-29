import { expect, test } from '@playwright/test'

test('loads the home page with Setup and Create Invoice buttons', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'InvoicePilot' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Setup' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create Invoice' })).toBeVisible()
})
