import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataAvailabilityWarning } from './DataAvailabilityWarning'
import type { HistoricalIndex } from '../../utils/historical-data'

const mockIndex: HistoricalIndex = {
  id: 'dax',
  name: 'DAX',
  description: 'Deutscher Aktienindex',
  startYear: 2000,
  endYear: 2023,
  currency: 'EUR',
  averageReturn: 0.075,
  volatility: 0.22,
  data: [],
}

describe('DataAvailabilityWarning', () => {
  it('should render the warning heading', () => {
    render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Begrenzte Datenabdeckung')).toBeInTheDocument()
  })

  it('should display simulation year range', () => {
    render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText(/1990-2030/)).toBeInTheDocument()
  })

  it('should display available data year range', () => {
    render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText(/2000-2023/)).toBeInTheDocument()
  })

  it('should display average return fallback information', () => {
    render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText(/Fehlende Jahre werden mit der Durchschnittsrendite/)).toBeInTheDocument()
    expect(screen.getByText(/7.5%/)).toBeInTheDocument()
  })

  it('should apply correct orange styling classes', () => {
    const { container } = render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    const orangeCard = container.querySelector('.border-orange-200.bg-orange-50')
    expect(orangeCard).toBeInTheDocument()
  })

  it('should display AlertTriangle icon', () => {
    const { container } = render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    const icon = container.querySelector('.text-orange-600')
    expect(icon).toBeInTheDocument()
  })

  it('should render with different nesting levels', () => {
    const { rerender } = render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )
    expect(screen.getByText('Begrenzte Datenabdeckung')).toBeInTheDocument()

    rerender(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={2}
      />,
    )
    expect(screen.getByText('Begrenzte Datenabdeckung')).toBeInTheDocument()
  })

  it('should format negative average return correctly', () => {
    const indexWithNegativeReturn: HistoricalIndex = {
      ...mockIndex,
      averageReturn: -0.025,
    }

    render(
      <DataAvailabilityWarning
        index={indexWithNegativeReturn}
        simulationStartYear={1990}
        simulationEndYear={2030}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText(/-2.5%/)).toBeInTheDocument()
  })

  it('should handle edge case year ranges', () => {
    render(
      <DataAvailabilityWarning
        index={mockIndex}
        simulationStartYear={2023}
        simulationEndYear={2023}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText(/2023-2023/)).toBeInTheDocument()
  })
})
