import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the home page at the root route', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'InvoicePilot' }),
    ).toBeInTheDocument()
  })
})
