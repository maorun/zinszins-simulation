import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { WizardStep1Zeitspanne } from './WizardStep1Zeitspanne'
import { WizardStep2Sparplan } from './WizardStep2Sparplan'
import { WizardStep3Entnahme } from './WizardStep3Entnahme'
import { WizardStep4Ergebnis } from './WizardStep4Ergebnis'
import { SimulationProvider } from '../../contexts/SimulationContext'
import { NavigationProvider } from '../../contexts/NavigationContext'
import { DashboardPreferencesProvider } from '../../contexts/DashboardPreferencesProvider'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <DashboardPreferencesProvider>
      <SimulationProvider>
        <NavigationProvider>{ui}</NavigationProvider>
      </SimulationProvider>
    </DashboardPreferencesProvider>,
  )
}

describe('WizardStep1Zeitspanne', () => {
  it('renders heading and sliders', () => {
    renderWithProviders(<WizardStep1Zeitspanne />)

    expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
    expect(screen.getByText(/Ende der Sparphase/i)).toBeInTheDocument()
    expect(screen.getByText(/Ende der Entnahmephase/i)).toBeInTheDocument()
  })

  it('shows summary section', () => {
    renderWithProviders(<WizardStep1Zeitspanne />)

    expect(screen.getByText(/Sparphase:/i)).toBeInTheDocument()
    expect(screen.getByText(/Entnahmephase:/i)).toBeInTheDocument()
  })
})

describe('WizardStep2Sparplan', () => {
  it('renders heading and inputs', () => {
    renderWithProviders(<WizardStep2Sparplan />)

    expect(screen.getByText(/Sparplan festlegen/i)).toBeInTheDocument()
    // "Monatliche Sparrate" appears in both label and summary - use getAllByText
    expect(screen.getAllByText(/Monatliche Sparrate/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Erwartete jährliche Rendite/i)).toBeInTheDocument()
    expect(screen.getByText(/Erwartete jährliche Inflation/i)).toBeInTheDocument()
  })

  it('shows monthly amount input', () => {
    renderWithProviders(<WizardStep2Sparplan />)

    const input = screen.getByLabelText(/Monatliche Sparrate/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'number')
  })

  it('shows real return in summary', () => {
    renderWithProviders(<WizardStep2Sparplan />)

    expect(screen.getByText(/Realrendite/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Inflation/i).length).toBeGreaterThanOrEqual(1)
  })
})

describe('WizardStep3Entnahme', () => {
  it('renders strategy selection', () => {
    renderWithProviders(<WizardStep3Entnahme />)

    expect(screen.getByText(/Entnahme-Strategie wählen/i)).toBeInTheDocument()
    expect(screen.getByText(/4 %-Regel/i)).toBeInTheDocument()
    expect(screen.getByText(/3 %-Regel/i)).toBeInTheDocument()
    expect(screen.getByText(/Monatlicher Festbetrag/i)).toBeInTheDocument()
    expect(screen.getByText(/Kapitalerhalt/i)).toBeInTheDocument()
  })
})

describe('WizardStep4Ergebnis', () => {
  it('renders heading and advanced view button', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardStep4Ergebnis onSwitchToAdvanced={onSwitchToAdvanced} />)

    expect(screen.getByText(/Deine Simulation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vollständige Ansicht/i })).toBeInTheDocument()
  })
})
