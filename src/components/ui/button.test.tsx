import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button Component - Mobile Touch Targets', () => {
  it('should have minimum 44px height for mobile touch targets by default', () => {
    const { container } = render(<Button>Test Button</Button>)
    const button = container.querySelector('button')

    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('h-10')
  })

  it('should have appropriate mobile touch target for small size', () => {
    const { container } = render(<Button size="sm">Small Button</Button>)
    const button = container.querySelector('button')

    expect(button).toHaveClass('min-h-[40px]')
    expect(button).toHaveClass('h-9')
  })

  it('should have enhanced mobile touch target for large size', () => {
    const { container } = render(<Button size="lg">Large Button</Button>)
    const button = container.querySelector('button')

    expect(button).toHaveClass('min-h-[48px]')
    expect(button).toHaveClass('h-12')
  })

  it('should have proper mobile touch target for icon buttons', () => {
    const { container } = render(<Button size="icon">🔄</Button>)
    const button = container.querySelector('button')

    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('min-w-[44px]')
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('w-10')
  })

  it('should maintain responsive design with smaller sizes on desktop', () => {
    const { container } = render(<Button>Responsive Button</Button>)
    const button = container.querySelector('button')

    // Should have mobile-first large size and responsive smaller desktop size
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('sm:h-9')
  })
})
