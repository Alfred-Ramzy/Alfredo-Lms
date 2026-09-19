import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
            <h1 className="text-3xl font-bold">Something went wrong.</h1>
            <p className="mt-3 text-muted-foreground">The app hit an unexpected error boundary. Please refresh or return home.</p>
            <Link to="/" className={buttonVariants({}) + ' mt-6'}>Back Home</Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
