import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SonstigesView } from './SonstigesView'
import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../types/return-configuration'

const mockSensitivityConfig: SensitivityAnalysisConfig = {
  startYear: 2025,
  endYear: 2040,
  elements: [],
  steuerlast: 0.26375,
  teilfreistellungsquote: 0.3,
  simulationAnnual: true,
  freibetragPerYear: {},
  steuerReduzierenEndkapital: false,
  inflationAktivSparphase: false,
  inflationsrateSparphase: 0,
  inflationAnwendungSparphase: 'none',
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

  it('renders data export section', () => {
    renderWithProviders(<SonstigesView {...defaultProps} />)

    expect(screen.getByText(/Export/i)).toBeInTheDocument()
  })

  it('renders extended features', () => {
    renderWithProviders(<SonstigesView {...defaultProps} />)

    expect(screen.getByText(/Profile verwalten/i)).toBeInTheDocument()
  })
})
