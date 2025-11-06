import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CareCostConfiguration } from './CareCostConfiguration'
import { createDefaultCareCostConfiguration } from '../../helpers/care-cost-simulation'

describe('CareCostConfiguration', () => {
  const defaultProps = {
    values: createDefaultCareCostConfiguration(),
    onChange: vi.fn(),
    currentYear: 2024,
    birthYear: 1990,
    planningMode: 'individual' as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the component with default values', () => {
      render(<CareCostConfiguration {...defaultProps} />)

      expect(screen.getByText('🏥 Pflegekosten-Simulation')).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegekosten-Simulation aktivieren')).toBeInTheDocument()
    })

    it('should show disabled state by default', () => {
      render(<CareCostConfiguration {...defaultProps} />)

      const enableSwitch = screen.getByLabelText('Pflegekosten-Simulation aktivieren')
      expect(enableSwitch).not.toBeChecked()
      expect(screen.queryByLabelText('Startjahr der Pflegebedürftigkeit')).not.toBeInTheDocument()
    })

    it('should show configuration when enabled', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByLabelText('Startjahr der Pflegebedürftigkeit')).toBeInTheDocument()
      expect(screen.getByText('Erwarteter Pflegegrad')).toBeInTheDocument()
      expect(screen.getByText(/Inflationsrate für Pflegekosten:/)).toBeInTheDocument()
    })
  })

  describe('Enable/Disable Functionality', () => {
    it('should call onChange when toggling enabled state', () => {
      render(<CareCostConfiguration {...defaultProps} />)

      const enableSwitch = screen.getByLabelText('Pflegekosten-Simulation aktivieren')
      fireEvent.click(enableSwitch)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        enabled: true,
      })
    })

    it('should show all configuration options when enabled', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByLabelText('Startjahr der Pflegebedürftigkeit')).toBeInTheDocument()
      expect(screen.getByText('Erwarteter Pflegegrad')).toBeInTheDocument()
      expect(screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')).toBeInTheDocument()
      expect(screen.getByText(/Inflationsrate für Pflegekosten:/)).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)')).toBeInTheDocument()
      expect(screen.getByLabelText('Gesetzliche Pflegeleistungen berücksichtigen')).toBeInTheDocument()
      expect(screen.getByLabelText('Private Pflegeversicherung (monatlich)')).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegekosten steuerlich absetzbar')).toBeInTheDocument()
    })
  })

  describe('Care Level Selection', () => {
    it('should display all 5 care levels with correct information', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      // Check that all care levels are displayed
      expect(screen.getByText('Pflegegrad 1')).toBeInTheDocument()
      expect(screen.getByText('Pflegegrad 2')).toBeInTheDocument()
      expect(screen.getByText('Pflegegrad 3')).toBeInTheDocument()
      expect(screen.getByText('Pflegegrad 4')).toBeInTheDocument()
      expect(screen.getByText('Pflegegrad 5')).toBeInTheDocument()

      // Check descriptions are present
      expect(screen.getByText('Geringe Beeinträchtigung der Selbständigkeit')).toBeInTheDocument()
      expect(screen.getByText('Erhebliche Beeinträchtigung der Selbständigkeit')).toBeInTheDocument()

      // Check care allowance information
      expect(screen.getByText('Kein Pflegegeld')).toBeInTheDocument() // Pflegegrad 1
      expect(screen.getByText('332,00 €')).toBeInTheDocument() // Pflegegrad 2 allowance
    })

    it('should call onChange when selecting a different care level', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const level3Radio = screen.getByRole('radio', { name: /Pflegegrad 3/ })
      fireEvent.click(level3Radio)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        careLevel: 3,
      })
    })

    it('should show default level 2 as selected', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const level2Radio = screen.getByRole('radio', { name: /Pflegegrad 2/ })
      expect(level2Radio).toBeChecked()
    })
  })

  describe('Input Fields', () => {
    it('should handle start year input changes', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const startYearInput = screen.getByLabelText('Startjahr der Pflegebedürftigkeit')
      fireEvent.change(startYearInput, { target: { value: '2030' } })

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        startYear: 2030,
      })
    })

    it('should handle custom monthly costs input', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const customCostsInput = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      fireEvent.change(customCostsInput, { target: { value: '1500' } })

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        customMonthlyCosts: 1500,
      })
    })

    it('should handle care duration input', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const durationInput = screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)')
      fireEvent.change(durationInput, { target: { value: '5' } })

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        careDurationYears: 5,
      })
    })

    it('should handle private care insurance benefit input', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const privateBenefitInput = screen.getByLabelText('Private Pflegeversicherung (monatlich)')
      fireEvent.change(privateBenefitInput, { target: { value: '500' } })

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        privateCareInsuranceMonthlyBenefit: 500,
      })
    })
  })

  describe('Switches and Toggles', () => {
    it('should handle statutory benefits toggle', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const statutorySwitch = screen.getByLabelText('Gesetzliche Pflegeleistungen berücksichtigen')
      fireEvent.click(statutorySwitch)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        includeStatutoryBenefits: false, // Should toggle from true to false
      })
    })

    it('should handle tax deductible toggle', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const taxSwitch = screen.getByLabelText('Pflegekosten steuerlich absetzbar')
      fireEvent.click(taxSwitch)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        taxDeductible: false, // Should toggle from true to false
      })
    })

    it('should show tax deduction amount input when tax deductible is enabled', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, taxDeductible: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByLabelText('Maximaler jährlicher Steuerabzug')).toBeInTheDocument()
    })

    it('should hide tax deduction amount input when tax deductible is disabled', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, taxDeductible: false }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.queryByLabelText('Maximaler jährlicher Steuerabzug')).not.toBeInTheDocument()
    })
  })

  describe('Inflation Rate Slider', () => {
    it('should display current inflation rate', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, careInflationRate: 3.5 }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByText(/Inflationsrate für Pflegekosten:.*3.5.*%/)).toBeInTheDocument()
    })

    it('should show inflation rate in slider display', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, careInflationRate: 4.0 }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      // Should show the rate in the slider area
      expect(screen.getAllByText('4%')).toHaveLength(1)
    })
  })

  describe('Couple Planning Mode', () => {
    const coupleProps = {
      ...defaultProps,
      planningMode: 'couple' as const,
      spouseBirthYear: 1988,
    }

    it('should show couple configuration section for couple planning mode', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...coupleProps} values={enabledConfig} />)

      expect(screen.getByText('👫 Paar-Konfiguration')).toBeInTheDocument()
      expect(screen.getByLabelText('Auch Person 2 wird pflegebedürftig')).toBeInTheDocument()
    })

    it('should not show couple configuration for individual planning mode', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.queryByText('👫 Paar-Konfiguration')).not.toBeInTheDocument()
    })

    it('should handle person 2 needs care toggle', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...coupleProps} values={enabledConfig} />)

      const person2Switch = screen.getByLabelText('Auch Person 2 wird pflegebedürftig')
      fireEvent.click(person2Switch)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...enabledConfig,
        coupleConfig: expect.objectContaining({
          person2NeedsCare: true,
          person2StartYear: expect.any(Number),
          person2CareLevel: expect.any(Number),
        }),
      })
    })

    it('should show person 2 configuration when enabled', () => {
      const enabledConfig = {
        ...defaultProps.values,
        enabled: true,
        coupleConfig: {
          person2NeedsCare: true,
          person2StartYear: 2030,
          person2CareLevel: 3 as const,
        },
      }
      render(<CareCostConfiguration {...coupleProps} values={enabledConfig} />)

      expect(screen.getByLabelText('Startjahr für Person 2')).toBeInTheDocument()
      expect(screen.getByText('Pflegegrad für Person 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegedauer für Person 2 (Jahre, 0 = bis Lebensende)')).toBeInTheDocument()
    })
  })

  describe('Validation and Error Display', () => {
    it('should show validation errors when configuration is invalid', () => {
      const invalidConfig = {
        ...defaultProps.values,
        enabled: true,
        startYear: 2020, // Invalid: in the past
        careInflationRate: -1, // Invalid: negative
      }
      render(<CareCostConfiguration {...defaultProps} values={invalidConfig} />)

      expect(screen.getByText('Konfigurationsfehler:')).toBeInTheDocument()
      expect(
        screen.getByText(/Startjahr für Pflegebedürftigkeit kann nicht in der Vergangenheit liegen/),
      ).toBeInTheDocument()
      expect(screen.getByText(/Inflationsrate für Pflegekosten muss zwischen 0% und 20% liegen/)).toBeInTheDocument()
    })

    it('should not show validation errors when configuration is valid', () => {
      const validConfig = {
        ...defaultProps.values,
        enabled: true,
        startYear: 2030,
        careInflationRate: 3,
      }
      render(<CareCostConfiguration {...defaultProps} values={validConfig} />)

      expect(screen.queryByText('Konfigurationsfehler:')).not.toBeInTheDocument()
    })
  })

  describe('Cost Preview', () => {
    it('should show cost preview when enabled and valid', () => {
      const validConfig = {
        ...defaultProps.values,
        enabled: true,
        startYear: 2030,
        careLevel: 2 as const,
      }
      render(<CareCostConfiguration {...defaultProps} values={validConfig} />)

      expect(screen.getByText(/Kostenvorschau für \d{4}/)).toBeInTheDocument()
      expect(screen.getByText('Brutto-Pflegekosten:')).toBeInTheDocument()
      expect(screen.getByText('Gesetzliche Leistungen:')).toBeInTheDocument()
      expect(screen.getByText('Netto-Eigenanteil:')).toBeInTheDocument()
      expect(screen.getByText('Jährliche Netto-Kosten:')).toBeInTheDocument()
    })

    it('should not show cost preview when disabled', () => {
      render(<CareCostConfiguration {...defaultProps} />)

      expect(screen.queryByText(/Kostenvorschau/)).not.toBeInTheDocument()
    })

    it('should not show cost preview when validation errors exist', () => {
      const invalidConfig = {
        ...defaultProps.values,
        enabled: true,
        startYear: 2020, // Invalid
      }
      render(<CareCostConfiguration {...defaultProps} values={invalidConfig} />)

      expect(screen.queryByText(/Kostenvorschau/)).not.toBeInTheDocument()
    })

    it('should show couple results in cost preview for couple planning', () => {
      const coupleConfig = {
        ...defaultProps.values,
        enabled: true,
        startYear: 2030,
        planningMode: 'couple' as const,
        coupleConfig: {
          person2NeedsCare: true,
          person2StartYear: 2030,
          person2CareLevel: 3 as const,
        },
      }
      const coupleProps = {
        ...defaultProps,
        planningMode: 'couple' as const,
        spouseBirthYear: 1988,
      }
      render(<CareCostConfiguration {...coupleProps} values={coupleConfig} />)

      expect(screen.getByText('Paar-Aufschlüsselung:')).toBeInTheDocument()
      expect(screen.getByText('Person 1:')).toBeInTheDocument()
      expect(screen.getByText('Person 2:')).toBeInTheDocument()
    })
  })

  describe('Reset Functionality', () => {
    it('should show reset button when enabled', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByText('Auf Standardwerte zurücksetzen')).toBeInTheDocument()
    })

    it('should call onChange with default configuration when reset button is clicked', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const resetButton = screen.getByText('Auf Standardwerte zurücksetzen')
      fireEvent.click(resetButton)

      expect(defaultProps.onChange).toHaveBeenCalledWith(createDefaultCareCostConfiguration())
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all input fields', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByLabelText('Pflegekosten-Simulation aktivieren')).toBeInTheDocument()
      expect(screen.getByLabelText('Startjahr der Pflegebedürftigkeit')).toBeInTheDocument()
      expect(screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)')).toBeInTheDocument()
      expect(screen.getByLabelText('Private Pflegeversicherung (monatlich)')).toBeInTheDocument()
    })

    it('should have proper radio button labels for care levels', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByRole('radio', { name: /Pflegegrad 1/ })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Pflegegrad 2/ })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Pflegegrad 3/ })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Pflegegrad 4/ })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Pflegegrad 5/ })).toBeInTheDocument()
    })
  })

  describe('Dynamic Content', () => {
    it('should show appropriate placeholder for custom costs based on selected care level', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, careLevel: 3 as const }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      const customCostsInput = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      expect(customCostsInput.getAttribute('placeholder')).toMatch(/Standard:.*1\.500.*€/)
    })

    it('should show different care duration description based on value', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, careDurationYears: 5 }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByText('Pflegebedürftigkeit für 5 Jahre')).toBeInTheDocument()
    })

    it('should show until end of life description when duration is 0', () => {
      const enabledConfig = { ...defaultProps.values, enabled: true, careDurationYears: 0 }
      render(<CareCostConfiguration {...defaultProps} values={enabledConfig} />)

      expect(screen.getByText('Pflegebedürftigkeit bis zum Lebensende')).toBeInTheDocument()
    })
  })
})
