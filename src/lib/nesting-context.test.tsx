import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NestingProvider } from './nesting-context'
import { useNestingLevel } from './nesting-utils'

// Test component to verify nesting level context
function TestComponent() {
  const nestingLevel = useNestingLevel()
  return <div data-testid="nesting-level">{nestingLevel}</div>
}

describe('NestingProvider', () => {
  it('should provide default nesting level of 0', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('nesting-level')).toHaveTextContent('0')
  })

  it('should increment nesting level automatically', () => {
    render(
      <NestingProvider>
        <TestComponent />
      </NestingProvider>,
    )
    expect(screen.getByTestId('nesting-level')).toHaveTextContent('1')
  })

  it('should support nested providers', () => {
    render(
      <NestingProvider>
        <NestingProvider>
          <NestingProvider>
            <TestComponent />
          </NestingProvider>
        </NestingProvider>
      </NestingProvider>,
    )
    expect(screen.getByTestId('nesting-level')).toHaveTextContent('3')
  })

  it('should allow explicit level override', () => {
    render(
      <NestingProvider level={5}>
        <TestComponent />
      </NestingProvider>,
    )
    expect(screen.getByTestId('nesting-level')).toHaveTextContent('5')
  })
})
