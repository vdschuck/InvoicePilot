import { expect, test } from '@playwright/test'

test('loads the home page with Setup and a disabled Create Invoice button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Invoice Pilot' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Setup Data' })).toBeVisible()

  // Create Invoice starts disabled since no contractor is configured yet.
  const createInvoiceButton = page.getByRole('button', { name: 'Create Invoice' })
  await expect(createInvoiceButton).toBeVisible()
  await expect(createInvoiceButton).toBeDisabled()
  await expect(createInvoiceButton).toHaveAttribute(
    'title',
    'Complete Setup and add a client before creating an invoice.',
  )
})
