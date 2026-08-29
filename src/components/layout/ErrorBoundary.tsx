import { Component, type ErrorInfo, type ReactNode } from 'react'
import { DataResetControl } from './DataResetControl'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected application error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            InvoicePilot
          </p>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-gray-600">
            An unexpected error occurred. If the problem continues, you can
            delete your stored data and start fresh.
          </p>
          <DataResetControl />
        </div>
      )
    }

    return this.props.children
  }
}
