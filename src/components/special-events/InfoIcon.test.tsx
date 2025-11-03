import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { InfoIcon } from './InfoIcon'

describe('InfoIcon', () => {
  it('renders an SVG icon', () => {
    const { container } = render(<InfoIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '14')
    expect(svg).toHaveAttribute('height', '14')
  })

  it('has correct accessibility attributes', () => {
    const { container } = render(<InfoIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })
})
