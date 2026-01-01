import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SonstigesView } from './SonstigesView'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'
import React from 'react'

const mockSensitivityConfig: SensitivityAnalysisConfig = {
  startYear: 2025,
  endYear: 2040,
  elements: [],
  steuerlast: 0.26375,
  teilfreistellungsquote: 0.3,
  simulationAnnual: 'yearly',
  freibetragPerYear: {},
  steuerReduzierenEndkapital: false,
  inflationAktivSparphase: false,
  inflationsrateSparphase: 0,
}

const mockReturnConfig: ReturnConfiguration = {
  mode: 'fixed',
  fixedRate: 0.05,
}

const defaultProps = {
  sensitivityConfig: mockSensitivityConfig,
  returnConfig: mockReturnConfig,
  hasSimulationData: false,
  handleApplyScenario: vi.fn(),
  startOfIndependence: 2025,
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('SonstigesView', () => {
  it('renders interactive tutorials', () => {
    renderWithProviders(<SonstigesView {...defaultProps} />)

    expect(screen.getByText(/Interaktive Tutorials/i)).toBeInTheDocument()
  })

  it('renders special events section', () => {
    renderWithProviders(<SonstigesView {...defaultProps} />)

    expect(screen.getByText(/Sonderereignisse verwalten/i)).toBeInTheDocument()
  })

  it('renders simulation parameters section', () => {
    renderWithProviders(<SonstigesView {...defaultProps} />)

    // Use getAllByText since "Konfiguration" appears multiple times (once in title, multiple times in loading states)
    expect(screen.getAllByText(/Konfiguration/i).length).toBeGreaterThan(0)
  })

  it('renders behavioral finance section', () => {
    renderWithProviders(<SonstigesView {...defaultProps} />)

    expect(screen.getByText(/Behavioral Finance/i)).toBeInTheDocument()
  })
})
