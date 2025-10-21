import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CoupleModeBanner } from './CoupleModeBanner'

describe('CoupleModeBanner', () => {
  it('renders when planning mode is couple', () => {
    render(<CoupleModeBanner planningMode="couple" />)

    expect(screen.getByText(/Paarplanung aktiviert/)).toBeInTheDocument()
    expect(screen.getByText(/Planungsmodus wird aus der globalen Planung übernommen/)).toBeInTheDocument()
  })

  it('does not render when planning mode is individual', () => {
    const { container } = render(<CoupleModeBanner planningMode="individual" />)

    expect(container).toBeEmptyDOMElement()
  })
})
