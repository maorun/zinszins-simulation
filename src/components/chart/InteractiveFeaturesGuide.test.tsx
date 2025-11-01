import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InteractiveFeaturesGuide } from './InteractiveFeaturesGuide'

describe('InteractiveFeaturesGuide', () => {
  it('renders interactive functions section', () => {
    render(<InteractiveFeaturesGuide chartView="overview" />)

    expect(screen.getByText(/Interaktive Funktionen:/)).toBeInTheDocument()
    expect(screen.getByText(/Real-Werte:/)).toBeInTheDocument()
    expect(screen.getByText(/Steuern:/)).toBeInTheDocument()
    expect(screen.getByText(/Ansichten:/)).toBeInTheDocument()
  })

  it('shows zoom information in detailed view', () => {
    render(<InteractiveFeaturesGuide chartView="detailed" />)

    expect(screen.getByText(/Zoom:/)).toBeInTheDocument()
    expect(screen.getByText(/Nutzen Sie den Slider unten für Zeitraum-Auswahl/)).toBeInTheDocument()
  })

  it('does not show zoom information in overview mode', () => {
    render(<InteractiveFeaturesGuide chartView="overview" />)

    expect(screen.queryByText(/Zoom:/)).not.toBeInTheDocument()
  })

  it('displays correct description for Real-Werte', () => {
    render(<InteractiveFeaturesGuide chartView="overview" />)

    expect(screen.getByText(/Schalter für inflationsbereinigte Darstellung/)).toBeInTheDocument()
  })

  it('displays correct description for Steuern', () => {
    render(<InteractiveFeaturesGuide chartView="overview" />)

    expect(screen.getByText(/Ein-\/Ausblenden der Steuerbelastung/)).toBeInTheDocument()
  })

  it('displays correct description for Ansichten', () => {
    render(<InteractiveFeaturesGuide chartView="overview" />)

    expect(screen.getByText(/Übersicht oder Detail-Modus mit Zoom/)).toBeInTheDocument()
  })
})
