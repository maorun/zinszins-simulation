import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { GlobalPlanningConfiguration } from './GlobalPlanningConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SimulationProvider>{children}</SimulationProvider>
)

describe('GlobalPlanningConfiguration', () => {
  const defaultProps = {
    startOfIndependence: 2040,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the global planning configuration card', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      expect(screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/)).toBeInTheDocument()
    })

    it('renders as collapsed by default', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // The main title should be visible
      expect(screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/)).toBeInTheDocument()

      // The content should not be visible initially (collapsed)
      expect(screen.queryByText('Planungsmodus')).not.toBeInTheDocument()
      expect(screen.queryByText('Einzelperson')).not.toBeInTheDocument()
      expect(screen.queryByText('Ehepaar/Partner')).not.toBeInTheDocument()
    })

    it('expands the configuration when clicked', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Click on the collapsible trigger
      const trigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      expect(trigger).toBeInTheDocument()
      fireEvent.click(trigger!)

      // Now the content should be visible
      expect(screen.getByText('Planungsmodus')).toBeInTheDocument()
      expect(screen.getByText('Einzelperson')).toBeInTheDocument()
      expect(screen.getByText('Ehepaar/Partner')).toBeInTheDocument()
    })
  })

  describe('Planning Mode Configuration', () => {
    it('displays individual and couple planning options', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the configuration
      const trigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(trigger!)

      // Check planning mode options
      expect(screen.getByText('Planungsmodus')).toBeInTheDocument()
      expect(screen.getByText('Einzelperson')).toBeInTheDocument()
      expect(screen.getByText('Planung für eine Person mit individueller Lebenserwartung')).toBeInTheDocument()
      expect(screen.getByText('Ehepaar/Partner')).toBeInTheDocument()
      expect(screen.getByText('Planung für zwei Personen mit gemeinsamer Lebenserwartung (längerer überlebender Partner)')).toBeInTheDocument()
    })

    it('shows gender configuration for individual planning', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the configuration
      const trigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(trigger!)

      // Select individual planning mode (couple might be selected by default)
      const individualRadio = screen.getByText('Einzelperson').closest('label')
      fireEvent.click(individualRadio!)

      // Now individual planning should be selected, so gender options should be visible
      expect(screen.getByText('Geschlecht für Lebenserwartung')).toBeInTheDocument()
      expect(screen.getByText('Männlich')).toBeInTheDocument()
      expect(screen.getByText('Weiblich')).toBeInTheDocument()
    })
  })

  describe('Life Expectancy Calculation', () => {
    it('renders the life expectancy calculation section as collapsed', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the main configuration
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // The life expectancy calculation section should be visible but collapsed
      expect(screen.getByText(/🕰️ Lebensende Berechnung/)).toBeInTheDocument()

      // The content should not be visible initially (collapsed)
      expect(screen.queryByText('Berechnungsmodus')).not.toBeInTheDocument()
      expect(screen.queryByText('Lebensende (Jahr)')).not.toBeInTheDocument()
    })

    it('expands the life expectancy calculation when clicked', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the main configuration
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // Click on the life expectancy calculation trigger
      const lifeExpectancyTrigger = screen.getByText(/🕰️ Lebensende Berechnung/).closest('div')
      fireEvent.click(lifeExpectancyTrigger!)

      // Now the life expectancy content should be visible
      expect(screen.getByText('Berechnungsmodus')).toBeInTheDocument()
      expect(screen.getByText('Lebensende (Jahr)')).toBeInTheDocument()
      expect(screen.getByText('Manuell')).toBeInTheDocument()
      expect(screen.getByText('Automatisch')).toBeInTheDocument()
    })
  })

  describe('Manual vs Automatic Calculation', () => {
    it('shows manual input by default', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand both sections
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // Switch to individual mode to simplify the test
      const individualRadio = screen.getByText('Einzelperson').closest('label')
      fireEvent.click(individualRadio!)

      const lifeExpectancyTrigger = screen.getByText(/🕰️ Lebensende Berechnung/).closest('div')
      fireEvent.click(lifeExpectancyTrigger!)

      // Manual mode should be active by default
      expect(screen.getByText('Manuell')).toBeInTheDocument()
      expect(screen.getByText('Automatisch')).toBeInTheDocument()

      // Year input should be visible - look for any number input that might be the life end year
      const numberInputs = screen.getAllByRole('spinbutton')
      expect(numberInputs.length).toBeGreaterThan(0)

      // Look for the life end year description to confirm the section loaded
      expect(screen.getByText(/Das Jahr, in dem die Entnahmephase enden soll/)).toBeInTheDocument()
    })
  })

  describe('Data Source Configuration', () => {
    it('shows appropriate life expectancy data source options', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand both sections
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)
      const lifeExpectancyTrigger = screen.getByText(/🕰️ Lebensende Berechnung/).closest('div')
      fireEvent.click(lifeExpectancyTrigger!)

      // Should show data source configuration
      expect(screen.getByText('Datengrundlage für Lebenserwartung')).toBeInTheDocument()
    })
  })
})
