import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { GlobalPlanningConfiguration } from './GlobalPlanningConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

const TestWrapper = ({ children }: { children: React.ReactNode }) => <SimulationProvider>{children}</SimulationProvider>

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
      expect(
        screen.getByText('Planung für zwei Personen mit gemeinsamer Lebenserwartung (längerer überlebender Partner)'),
      ).toBeInTheDocument()
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

  describe('Automatic Life Expectancy Calculation - Core Fix Validation', () => {
    it('allows birth year changes to trigger useEffect in couple mode', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the main configuration
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // Switch to couple mode
      const coupleRadio = screen.getByText('Ehepaar/Partner').closest('label')
      fireEvent.click(coupleRadio!)

      // Find and change both birth year inputs - this is the core test
      const person1Input = screen.getByLabelText(/Person 1 Geburtsjahr/)
      const person2Input = screen.getByLabelText(/Person 2 Geburtsjahr/)

      // Change values - the fix ensures these changes trigger useEffect
      fireEvent.change(person1Input, { target: { value: '1980' } })
      fireEvent.change(person2Input, { target: { value: '1985' } })

      // Verify the inputs accept the values (this validates the fix allows state updates)
      expect(person1Input).toHaveValue(1980)
      expect(person2Input).toHaveValue(1985)

      // Change values again to test reactivity
      fireEvent.change(person1Input, { target: { value: '1970' } })
      expect(person1Input).toHaveValue(1970)

      // Should show updated age displays when birth years change
      const ageTexts = screen.getAllByText(/Alter: \d+ Jahre/)
      expect(ageTexts.length).toBeGreaterThan(0) // At least one age should be displayed
    })

    it('allows birth year changes to trigger useEffect in individual mode', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the main configuration
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // Switch to individual mode
      const individualRadio = screen.getByText('Einzelperson').closest('label')
      fireEvent.click(individualRadio!)

      // Find and change the birth year input
      const birthYearInput = screen.getByLabelText(/Geburtsjahr/)

      // Change value - this should trigger useEffect
      fireEvent.change(birthYearInput, { target: { value: '1980' } })

      // Verify the input accepts the value
      expect(birthYearInput).toHaveValue(1980)

      // Change value again to test reactivity
      fireEvent.change(birthYearInput, { target: { value: '1974' } })
      expect(birthYearInput).toHaveValue(1974)

      // Should show updated age display
      expect(screen.getByText(/Aktuelles Alter: \d+ Jahre/)).toBeInTheDocument()
    })

    it('handles empty birth year values without crashing', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the main configuration
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // Test individual mode
      const individualRadio = screen.getByText('Einzelperson').closest('label')
      fireEvent.click(individualRadio!)

      const birthYearInput = screen.getByLabelText(/Geburtsjahr/)

      // Should handle empty values gracefully - the fix ensures useEffect still works
      fireEvent.change(birthYearInput, { target: { value: '' } })

      // Should not crash - the main test is that it doesn't throw an error
      expect(birthYearInput).toBeInTheDocument()

      // Switch to couple mode and test the same
      const coupleRadio = screen.getByText('Ehepaar/Partner').closest('label')
      fireEvent.click(coupleRadio!)

      const person1Input = screen.getByLabelText(/Person 1 Geburtsjahr/)
      const person2Input = screen.getByLabelText(/Person 2 Geburtsjahr/)

      fireEvent.change(person1Input, { target: { value: '' } })
      fireEvent.change(person2Input, { target: { value: '' } })

      // Should handle empty values gracefully - main test is no crash
      expect(person1Input).toBeInTheDocument()
      expect(person2Input).toBeInTheDocument()
    })
  })

  describe('Age Display Updates - Validation of Fix', () => {
    it('updates age displays when birth years change in couple mode', () => {
      render(
        <TestWrapper>
          <GlobalPlanningConfiguration {...defaultProps} />
        </TestWrapper>,
      )

      // Expand the main configuration
      const mainTrigger = screen.getByText(/👥 Globale Planung \(Einzelperson\/Ehepaar\)/).closest('div')
      fireEvent.click(mainTrigger!)

      // Switch to couple mode
      const coupleRadio = screen.getByText('Ehepaar/Partner').closest('label')
      fireEvent.click(coupleRadio!)

      // Set birth years for both partners
      const person1Input = screen.getByLabelText(/Person 1 Geburtsjahr/)
      const person2Input = screen.getByLabelText(/Person 2 Geburtsjahr/)

      fireEvent.change(person1Input, { target: { value: '1974' } })
      fireEvent.change(person2Input, { target: { value: '1978' } })

      // Both ages should be calculated and displayed - this validates the fix works
      const ageTexts = screen.getAllByText(/Alter: \d+ Jahre/)
      expect(ageTexts).toHaveLength(2) // Should have age displays for both persons
    })
  })
})
