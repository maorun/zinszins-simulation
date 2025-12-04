import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PensionPointsInfo } from './PensionPointsInfo'

describe('PensionPointsInfo', () => {
  it('should render pension points information', () => {
    render(<PensionPointsInfo nestingLevel={0} />)

    expect(screen.getByText('💡 Rentenpunkte-Berechnung')).toBeInTheDocument()
    expect(screen.getByText(/Die gesetzliche Rente basiert auf/)).toBeInTheDocument()
    expect(screen.getByText(/Rentenpunkten/)).toBeInTheDocument()
  })

  it('should display key information about pension points calculation', () => {
    render(<PensionPointsInfo nestingLevel={0} />)

    // Check for key information points
    expect(screen.getByText(/Pro Jahr erhalten Sie/)).toBeInTheDocument()
    expect(screen.getByText(/Bei genau durchschnittlichem Gehalt/)).toBeInTheDocument()
    expect(screen.getByText(/Monatliche Rente =/)).toBeInTheDocument()
  })

  it('should mention current pension value', () => {
    render(<PensionPointsInfo nestingLevel={0} />)

    expect(screen.getByText(/37,60 € in 2024/)).toBeInTheDocument()
  })

  it('should have appropriate styling for info card', () => {
    const { container } = render(<PensionPointsInfo nestingLevel={1} />)

    const card = container.querySelector('.bg-blue-50')
    expect(card).toBeInTheDocument()
  })
})
