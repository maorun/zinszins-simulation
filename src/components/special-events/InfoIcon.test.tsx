import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { InfoIcon } from './InfoIcon'

describe('InfoIcon', () => {
  it('renders a lucide-react Info icon', () => {
    const { container } = render(<InfoIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('has correct Tailwind CSS classes', () => {
    const { container } = render(<InfoIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-3.5', 'w-3.5', 'ml-1', 'opacity-60')
  })
})
