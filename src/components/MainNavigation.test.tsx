import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MainNavigation } from './MainNavigation'
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
  handleApplyScenario: vi.fn(),
  startOfIndependence: 2025,
  sensitivityConfig: mockSensitivityConfig,
  returnConfig: mockReturnConfig,
  hasSimulationData: false,
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('MainNavigation', () => {
  it('renders all three navigation tabs', () => {
    renderWithProviders(<MainNavigation {...defaultProps} />)

    expect(screen.getByRole('tab', { name: /Sparen/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Entnahme/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Sonstiges/i })).toBeInTheDocument()
  })

  it('renders Sparen tab as default', () => {
    renderWithProviders(<MainNavigation {...defaultProps} />)

    const sparenTab = screen.getByRole('tab', { name: /Sparen/i })
    expect(sparenTab).toHaveAttribute('data-state', 'active')
  })

  it('has sticky positioning applied to navigation container', () => {
    const { container } = renderWithProviders(<MainNavigation {...defaultProps} />)

    const stickyContainer = container.querySelector('.sticky')
    expect(stickyContainer).toBeInTheDocument()
  })
})
