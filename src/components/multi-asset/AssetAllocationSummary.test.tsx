import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssetAllocationSummary } from './AssetAllocationSummary'

describe('AssetAllocationSummary', () => {
  it('should display portfolio overview with expected return and risk', () => {
    render(
      <AssetAllocationSummary
        expectedReturn={0.07}
        expectedRisk={0.15}
        enabledAssetsCount={3}
        validationErrors={[]}
      />,
    )

    expect(screen.getByText('Portfolio-Übersicht')).toBeInTheDocument()
    expect(screen.getByText('Erwartete Rendite:')).toBeInTheDocument()
    expect(screen.getByText('7.0%')).toBeInTheDocument()
    expect(screen.getByText('Portfoliorisiko:')).toBeInTheDocument()
    expect(screen.getByText('15.0%')).toBeInTheDocument()
  })

  it('should display validation errors when present', () => {
    const errors = [
      'Die Summe der Allokationen muss 100% ergeben',
      'Mindestens eine Anlageklasse muss aktiviert sein',
    ]

    render(
      <AssetAllocationSummary
        expectedReturn={0.07}
        expectedRisk={0.15}
        enabledAssetsCount={0}
        validationErrors={errors}
      />,
    )

    expect(screen.getByText('Konfigurationsfehler:')).toBeInTheDocument()
    expect(screen.getByText(errors[0])).toBeInTheDocument()
    expect(screen.getByText(errors[1])).toBeInTheDocument()

    // Should not show portfolio overview when there are errors
    expect(screen.queryByText('Portfolio-Übersicht')).not.toBeInTheDocument()
  })

  it('should not render anything when no enabled assets and no errors', () => {
    const { container } = render(
      <AssetAllocationSummary
        expectedReturn={0.07}
        expectedRisk={0.15}
        enabledAssetsCount={0}
        validationErrors={[]}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('should format percentages correctly', () => {
    render(
      <AssetAllocationSummary
        expectedReturn={0.0725}
        expectedRisk={0.1456}
        enabledAssetsCount={2}
        validationErrors={[]}
      />,
    )

    // Check that percentages are rounded to 1 decimal place
    expect(screen.getByText('7.2%')).toBeInTheDocument()
    expect(screen.getByText('14.6%')).toBeInTheDocument()
  })
})
