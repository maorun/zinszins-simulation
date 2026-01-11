import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CoreSatelliteInfo } from './CoreSatelliteInfo'

describe('CoreSatelliteInfo', () => {
  it('should render without errors', () => {
    render(<CoreSatelliteInfo />)

    // Use getAllByText since "Core-Satellite Strategie" appears multiple times
    const elements = screen.getAllByText(/Core-Satellite Strategie/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('should display core and satellite allocation ranges', () => {
    render(<CoreSatelliteInfo />)

    expect(screen.getByText('70-90%')).toBeInTheDocument() // Core range
    expect(screen.getByText('10-30%')).toBeInTheDocument() // Satellite range
  })

  it('should explain what the strategy is', () => {
    render(<CoreSatelliteInfo />)

    expect(screen.getByText(/Was ist die Core-Satellite Strategie/i)).toBeInTheDocument()
    expect(screen.getByText(/breit diversifizierten, kostengünstigen Kern/i)).toBeInTheDocument()
  })

  it('should list satellite strategy types', () => {
    render(<CoreSatelliteInfo />)

    expect(screen.getByText('Sektor')).toBeInTheDocument()
    expect(screen.getByText('Regional')).toBeInTheDocument()
    expect(screen.getByText('Thematisch')).toBeInTheDocument()
    expect(screen.getByText('Faktor')).toBeInTheDocument()
    expect(screen.getByText('Individual')).toBeInTheDocument()
  })

  it('should display cost calculation example', () => {
    render(<CoreSatelliteInfo />)

    // Should show example costs
    const costText = screen.getByText(/Beispiel.*Core.*Satellites.*Gesamt/i)
    expect(costText).toBeInTheDocument()
  })

  it('should include German tax considerations', () => {
    render(<CoreSatelliteInfo />)

    expect(screen.getByText(/Deutsche Steuerliche Aspekte/i)).toBeInTheDocument()
    // Use getAllByText since these appear multiple times
    expect(screen.getAllByText(/Teilfreistellung/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Sparerpauschbetrag/i)).toBeInTheDocument()
  })

  it('should show beginner recommendation', () => {
    render(<CoreSatelliteInfo />)

    expect(screen.getByText(/Empfehlung für Einsteiger/i)).toBeInTheDocument()
    expect(screen.getByText(/reinen Core-Portfolio/i)).toBeInTheDocument()
  })

  it('should display integration note with Multi-Asset Portfolio', () => {
    render(<CoreSatelliteInfo />)

    expect(screen.getByText(/Multi-Asset Portfolio Feature/i)).toBeInTheDocument()
  })

  it('should list benefits of the strategy', () => {
    render(<CoreSatelliteInfo />)

    // Use getAllByText since "Kostenoptimiert" appears in multiple places
    expect(screen.getAllByText(/Kostenoptimiert/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Kontrolliertes Risiko/i)).toBeInTheDocument()
    expect(screen.getByText(/Persönliche Überzeugungen/i)).toBeInTheDocument()
    expect(screen.getByText(/Performance-Attribution/i)).toBeInTheDocument()
  })

  it('should render with custom nesting level', () => {
    const { container } = render(<CoreSatelliteInfo nestingLevel={2} />)

    // Should render without errors with custom nesting level
    expect(container.querySelector('[class*="mb-4"]')).toBeInTheDocument()
  })
})
