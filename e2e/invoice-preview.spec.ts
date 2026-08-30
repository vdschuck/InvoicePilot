import { expect, test } from '@playwright/test'

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

const paidContractor = {
  ...contractor,
  paymentInformation: 'TIN (CUI/CIF): 111\nAccount No: 999888777\nBank: Analytical Bank',
}

const bankedClient = {
  id: 'client-2',
  name: 'Alan Turing',
  companyName: 'Codebreakers Ltd',
  streetAddress: '2 Enigma Road',
  city: 'Bletchley',
  state: 'Buckinghamshire',
  country: 'United Kingdom',
  contactNumber: '+44 20 7946 0959',
  currency: 'USD',
  bankingDetails: 'TIN (CUI/CIF): 999\nAccount No: 1234567890\nBank: Turing Trust',
}

async function goToInvoicePage(
  page: import('@playwright/test').Page,
  activeContractor: typeof contractor = contractor,
) {
  await page.addInitScript(
    ({ contractor, client, bankedClient }) => {
      if (!localStorage.getItem('invoicepilot:app-data')) {
        localStorage.setItem(
          'invoicepilot:app-data',
          JSON.stringify({
            contractor,
            clients: [client, bankedClient],
            invoiceSequence: 1,
          }),
        )
      }
    },
    { contractor: activeContractor, client, bankedClient },
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

test('does not show banking details for a client that has none', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Client').selectOption({ label: 'Grace Hopper' })
  await expect(page.getByText("Client Banking Information")).toHaveCount(0)
})

test('shows banking details for a client that has them', async ({ page }) => {
  await goToInvoicePage(page)
  await page.getByLabel('Client').selectOption({ label: 'Alan Turing' })

  await expect(page.getByText("Client Banking Information")).toBeVisible()
  await expect(page.getByText(/TIN \(CUI\/CIF\): 999/)).toBeVisible()
  await expect(page.getByText(/Bank: Turing Trust/)).toBeVisible()
})

test('does not show payment information for a contractor that has none', async ({ page }) => {
  await goToInvoicePage(page)
  await expect(page.getByText('Payment Information:')).toHaveCount(0)
})

test('shows payment information right below the client banking details', async ({ page }) => {
  await goToInvoicePage(page, paidContractor)
  await page.getByLabel('Client').selectOption({ label: 'Alan Turing' })

  const clientHeading = page.getByText('Client Banking Information')
  const paymentHeading = page.getByText('Payment Information:')
  await expect(clientHeading).toBeVisible()
  await expect(paymentHeading).toBeVisible()
  await expect(page.getByText(/TIN \(CUI\/CIF\): 111/)).toBeVisible()

  const clientBox = await clientHeading.boundingBox()
  const paymentBox = await paymentHeading.boundingBox()
  expect(paymentBox!.y).toBeGreaterThan(clientBox!.y)
})
