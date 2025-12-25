import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { ConfigurationSection } from './ConfigurationSection'

// Mock component for testing
function TestComponent({ message }: { message: string }) {
  return <div>{message}</div>
}

describe('ConfigurationSection', () => {
  test('renders component with Suspense', () => {
    render(<ConfigurationSection Component={TestComponent} componentProps={{ message: 'Test Message' }} />)

    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })

  test('does not render when condition is false', () => {
    render(<ConfigurationSection Component={TestComponent} componentProps={{ message: 'Test Message' }} condition={false} />)

    expect(screen.queryByText('Test Message')).not.toBeInTheDocument()
  })

  test('renders when condition is true', () => {
    render(<ConfigurationSection Component={TestComponent} componentProps={{ message: 'Test Message' }} condition={true} />)

    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })

  test('renders when condition is not provided (defaults to true)', () => {
    render(<ConfigurationSection Component={TestComponent} componentProps={{ message: 'Test Message' }} />)

    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })

  test('renders component without props', () => {
    function SimpleComponent() {
      return <div>No Props Component</div>
    }

    render(<ConfigurationSection Component={SimpleComponent} />)

    expect(screen.getByText('No Props Component')).toBeInTheDocument()
  })
})
