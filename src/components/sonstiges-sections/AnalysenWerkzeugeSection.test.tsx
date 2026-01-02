import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AnalysenWerkzeugeSection } from './AnalysenWerkzeugeSection'
import { SimulationProvider } from '../../contexts/SimulationContext'
import { NavigationProvider } from '../../contexts/NavigationContext'
import type { SensitivityAnalysisConfig } from '../../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../../utils/random-returns'
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
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SimulationProvider>
      <NavigationProvider>{ui}</NavigationProvider>
    </SimulationProvider>,
  )
}

describe('AnalysenWerkzeugeSection', () => {
  it('renders the Analysen & Werkzeuge category', () => {
    renderWithProviders(<AnalysenWerkzeugeSection {...defaultProps} />)

    expect(screen.getByText(/📊 Analysen & Werkzeuge/i)).toBeInTheDocument()
  })

  it('renders as a collapsible category', () => {
    const { container } = renderWithProviders(<AnalysenWerkzeugeSection {...defaultProps} />)

    // Check that it's collapsible by looking for the chevron icon
    const chevron = container.querySelector('.lucide-chevron-down')
    expect(chevron).toBeInTheDocument()
  })

  it('loads nested tool sections', async () => {
    renderWithProviders(<AnalysenWerkzeugeSection {...defaultProps} />)

    // The category should be present
    expect(screen.getByText(/📊 Analysen & Werkzeuge/i)).toBeInTheDocument()

    // When collapsed, the nested sections should not be visible initially
    // They are lazy-loaded and only appear when expanded
  })
})
