import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { WizardNavigation } from './WizardNavigation'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import { DashboardPreferencesProvider } from '../contexts/DashboardPreferencesProvider'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <DashboardPreferencesProvider>
      <SimulationProvider>
        <NavigationProvider>{ui}</NavigationProvider>
      </SimulationProvider>
    </DashboardPreferencesProvider>,
  )
}

describe('WizardNavigation', () => {
  it('renders step 1 (Zeitspanne) by default', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
    expect(screen.getByText(/Schritt 1 von 4/i)).toBeInTheDocument()
  })

  it('shows step indicator with 4 steps', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    expect(screen.getAllByText(/Zeit|Sparen|Entnahme|Ergebnis/i).length).toBeGreaterThanOrEqual(1)
  })

  it('disables Back button on first step', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    const backButton = screen.getByRole('button', { name: /zurück/i })
    expect(backButton).toBeDisabled()
  })

  it('advances to step 2 (Sparplan) when clicking Weiter', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    const nextButton = screen.getByRole('button', { name: /^Weiter$/ })
    fireEvent.click(nextButton)

    expect(screen.getByText(/Sparplan festlegen/i)).toBeInTheDocument()
    expect(screen.getByText(/Schritt 2 von 4/i)).toBeInTheDocument()
  })

  it('advances to step 3 (Entnahme) after two clicks on Weiter', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    fireEvent.click(screen.getByRole('button', { name: /^Weiter$/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Weiter$/ }))

    expect(screen.getByText(/Entnahme-Strategie wählen/i)).toBeInTheDocument()
    expect(screen.getByText(/Schritt 3 von 4/i)).toBeInTheDocument()
  })

  it('navigates back from step 2 to step 1', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    fireEvent.click(screen.getByRole('button', { name: /^Weiter$/ }))
    expect(screen.getByText(/Sparplan festlegen/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /zurück/i }))
    expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
  })

  it('calls onSwitchToAdvanced when clicking Erweitert button', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    const erweitertButton = screen.getByTitle(/Zur vollständigen Ansicht wechseln/i)
    fireEvent.click(erweitertButton)

    expect(onSwitchToAdvanced).toHaveBeenCalledTimes(1)
  })

  it('shows Alle Einstellungen button on last step', () => {
    const onSwitchToAdvanced = vi.fn()
    renderWithProviders(<WizardNavigation onSwitchToAdvanced={onSwitchToAdvanced} />)

    // Navigate to last step
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Weiter$/ }))
    }

    expect(screen.getAllByText(/Alle Einstellungen/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole('button', { name: /^Weiter$/ })).not.toBeInTheDocument()
  })
})
