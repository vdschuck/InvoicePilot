import { expect, test } from '@playwright/test'

/**
 * A single, uninterrupted walkthrough of the entire application using only
 * real UI interactions (no seeding via localStorage), from a brand-new
 * browser through contractor setup, client registration, invoice creation,
 * and a real PDF download.
 */
test('a new user can set up, register a client, and download an invoice', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Invoice Pilot' })).toBeVisible()

  // Create Invoice is disabled until the contractor is set up.
  await expect(page.getByRole('button', { name: 'Create Invoice' })).toBeDisabled()

  // --- Setup ---
  await page.getByRole('link', { name: 'Setup Data' }).click()
  await page.getByLabel('Contractor name').fill('Ada Lovelace')
  await page.getByLabel('Company name').fill('Analytical Engines Ltd')
  await page.getByLabel('Street address').fill('1 Babbage Street')
  await page.getByLabel('City').fill('London')
  await page.getByLabel('State').fill('London')
  await page.getByLabel('Country').fill('United Kingdom')
  await page.getByLabel('Zip code').fill('EC1A 1BB')
  await page.getByLabel('Contact number').fill('+44 20 7946 0958')
  await page.getByRole('button', { name: 'Save' }).click()

  // With no clients registered yet, saving takes the user straight to
  // Clients to continue registration.
  await expect(page).toHaveURL('/clients')
  await expect(page.getByText('No clients registered yet.')).toBeVisible()

  // --- Register a client ---
  await page.getByLabel('Client name').fill('Grace Hopper')
  await page.getByLabel('Company name').fill('Compilers Inc')
  await page.getByLabel('Street address').fill('1 Turing Way')
  await page.getByLabel('City').fill('Arlington')
  await page.getByLabel('State').fill('VA')
  await page.getByLabel('Country').fill('United States')
  await page.getByLabel('Contact number').fill('+1 555-0100')
  await page.getByLabel('Currency').selectOption('USD')
  await page.getByRole('button', { name: 'Add Client' }).click()
  await expect(page.getByText('Grace Hopper')).toBeVisible()
  await expect(page.getByText('1 / 3')).toBeVisible()

  // --- Create an invoice ---
  await page.getByRole('link', { name: 'InvoicePilot' }).click()
  await page.getByRole('link', { name: 'Create Invoice' }).click()
  await expect(page).toHaveURL('/invoice')
  await expect(page.getByLabel('Invoice number')).toHaveValue('1')

  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await page.getByLabel('Issue date').fill('2026-01-01')
  await page.getByLabel('Due date').fill('2026-01-15')
  await page.getByLabel('Ref No').fill('A-1')
  await page.getByLabel('Description').fill('Consulting services')
  await page.getByLabel('Quantity').fill('4')
  await page.getByLabel('Rate').fill('75')

  // Preview reflects everything entered, formatted in the client's currency.
  await expect(page.getByText('Grace Hopper').last()).toBeVisible()
  await expect(page.getByText('Amount Due')).toBeVisible()
  await expect(page.getByText('$300.00').first()).toBeVisible()

  // --- Download the PDF ---
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PDF' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('invoice-1.pdf')
  const filePath = await download.path()
  expect(filePath).not.toBeNull()
  const fs = await import('node:fs/promises')
  const contents = await fs.readFile(filePath as string)
  expect(contents.subarray(0, 5).toString('ascii')).toBe('%PDF-')

  // Sequence advanced for the next invoice.
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('invoicepilot:app-data') ?? 'null'),
  )
  expect(stored.invoiceSequence).toBe(2)

  // --- Editing the contractor later still works ---
  await page.getByRole('link', { name: 'InvoicePilot' }).click()
  await page.getByRole('link', { name: 'Setup Data' }).click()
  await expect(page.getByLabel('Contractor name')).toHaveValue('Ada Lovelace')
  await page.getByLabel('City').fill('Manchester')
  await page.getByRole('button', { name: 'Save' }).click()

  // Saving always goes to Clients, regardless of how many are registered.
  await expect(page).toHaveURL('/clients')

  // --- Data reset returns the app to a clean slate ---
  await page.getByRole('link', { name: 'InvoicePilot' }).click()
  await page.getByRole('button', { name: 'Delete All Data' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page).toHaveURL('/')
  const clearedData = await page.evaluate(() => localStorage.getItem('invoicepilot:app-data'))
  expect(clearedData).toBeNull()
})
