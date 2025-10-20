import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SimulationProvider } from '../contexts/SimulationContext'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'
import { RMDStartAgeConfig } from './RMDStartAgeConfig'
import { RMDLifeExpectancyTableConfig } from './RMDLifeExpectancyTableConfig'
import { RMDCustomLifeExpectancyConfig } from './RMDCustomLifeExpectancyConfig'
import { RMDCalculationInfo } from './RMDCalculationInfo'
import {
  validateModeProps,
  getCurrentValuesFromForm,
  getCurrentValuesFromDirect,
} from './RMDWithdrawalConfiguration.helpers'

describe('RMDWithdrawalConfiguration', () => {
  describe('Form Mode (Unified Strategy)', () => {
    it('should render in form mode with correct values', () => {
      const formValue = {
        strategie: 'rmd' as const,
        rendite: 0.05,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 0.02,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 0.1,
        variabelProzent: 0.04,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        bucketConfig: {
          initialCashCushion: 20000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
        },
        rmdStartAge: 67,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
        steueroptimierteEntnahmeTargetTaxRate: 0.26375,
        steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
        steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
        steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
        einkommensteuersatz: 0.42,
      }

      const updateFormValue = vi.fn()

      render(
        <SimulationProvider>
          <RMDWithdrawalConfiguration
            formValue={formValue}
            updateFormValue={updateFormValue}
          />
        </SimulationProvider>,
      )

      expect(screen.getByDisplayValue('67')).toBeInTheDocument()
      expect(screen.getByText('Das Alter, mit dem die RMD-Entnahme beginnt (Standard: 65 Jahre)')).toBeInTheDocument()
      expect(screen.getByText('Datengrundlage für Lebenserwartung')).toBeInTheDocument()
    })

    it('should update form value when age changes', () => {
      const formValue = {
        strategie: 'rmd' as const,
        rendite: 0.05,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 0.02,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 0.1,
        variabelProzent: 0.04,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        bucketConfig: {
          initialCashCushion: 20000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
        },
        rmdStartAge: 65,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
        steueroptimierteEntnahmeTargetTaxRate: 0.26375,
        steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
        steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
        steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
        einkommensteuersatz: 0.42,
      }

      const updateFormValue = vi.fn()

      render(
        <SimulationProvider>
          <RMDWithdrawalConfiguration
            formValue={formValue}
            updateFormValue={updateFormValue}
          />
        </SimulationProvider>,
      )

      const ageInput = screen.getByDisplayValue('65')
      fireEvent.change(ageInput, { target: { value: '70' } })

      expect(updateFormValue).toHaveBeenCalledWith({
        ...formValue,
        rmdStartAge: 70,
      })
    })
  })

  describe('Direct Mode (Segmented Strategy)', () => {
    it('should render in direct mode with correct values', () => {
      const values = {
        startAge: 70,
        lifeExpectancyTable: 'german_2020_22' as const,
        customLifeExpectancy: undefined,
      }

      const onChange = {
        onStartAgeChange: vi.fn(),
        onLifeExpectancyTableChange: vi.fn(),
        onCustomLifeExpectancyChange: vi.fn(),
      }

      render(
        <SimulationProvider>
          <RMDWithdrawalConfiguration
            values={values}
            onChange={onChange}
          />
        </SimulationProvider>,
      )

      expect(screen.getByDisplayValue('70')).toBeInTheDocument()
      expect(screen.getByText('Das Alter zu Beginn dieser Entnahme-Phase (wird für die Berechnung der Lebenserwartung verwendet)')).toBeInTheDocument()
      expect(screen.getByText('Sterbetabelle')).toBeInTheDocument()
    })

    it('should call onChange handlers when values change', () => {
      const values = {
        startAge: 65,
        lifeExpectancyTable: 'german_2020_22' as const,
        customLifeExpectancy: 20,
      }

      const onChange = {
        onStartAgeChange: vi.fn(),
        onLifeExpectancyTableChange: vi.fn(),
        onCustomLifeExpectancyChange: vi.fn(),
      }

      render(
        <SimulationProvider>
          <RMDWithdrawalConfiguration
            values={values}
            onChange={onChange}
          />
        </SimulationProvider>,
      )

      const ageInput = screen.getByDisplayValue('65')
      fireEvent.change(ageInput, { target: { value: '72' } })

      expect(onChange.onStartAgeChange).toHaveBeenCalledWith(72)
    })
  })

  describe('Mode Validation', () => {
    it('should throw error when neither mode is provided', () => {
      expect(() => {
        render(
          <SimulationProvider>
            <RMDWithdrawalConfiguration />
          </SimulationProvider>,
        )
      }).toThrow('RMDWithdrawalConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
    })
  })
})

describe('RMDStartAgeConfig', () => {
  it('should render with default props', () => {
    const onChange = vi.fn()
    render(<RMDStartAgeConfig value={65} onChange={onChange} />)

    expect(screen.getByDisplayValue('65')).toBeInTheDocument()
    expect(screen.getByText('Alter zu Beginn der Entnahmephase')).toBeInTheDocument()
  })

  it('should call onChange when value changes', () => {
    const onChange = vi.fn()
    render(<RMDStartAgeConfig value={65} onChange={onChange} />)

    const input = screen.getByDisplayValue('65')
    fireEvent.change(input, { target: { value: '70' } })

    expect(onChange).toHaveBeenCalledWith(70)
  })

  it('should show form mode description', () => {
    const onChange = vi.fn()
    render(<RMDStartAgeConfig value={65} onChange={onChange} isFormMode={true} />)

    expect(screen.getByText('Das Alter, mit dem die RMD-Entnahme beginnt (Standard: 65 Jahre)')).toBeInTheDocument()
  })

  it('should show direct mode description', () => {
    const onChange = vi.fn()
    render(<RMDStartAgeConfig value={65} onChange={onChange} isFormMode={false} />)

    expect(screen.getByText('Das Alter zu Beginn dieser Entnahme-Phase (wird für die Berechnung der Lebenserwartung verwendet)')).toBeInTheDocument()
  })
})

describe('RMDLifeExpectancyTableConfig', () => {
  it('should render with german_2020_22 selected', () => {
    const onChange = vi.fn()
    render(<RMDLifeExpectancyTableConfig value="german_2020_22" onChange={onChange} />)

    expect(screen.getByRole('radio', { name: /Deutsche Sterbetabelle/ })).toBeChecked()
  })

  it('should call onChange when selection changes', () => {
    const onChange = vi.fn()
    render(<RMDLifeExpectancyTableConfig value="german_2020_22" onChange={onChange} />)

    const customOption = screen.getByRole('radio', { name: /Benutzerdefiniert/ })
    fireEvent.click(customOption)

    expect(onChange).toHaveBeenCalledWith('custom')
  })

  it('should show form mode label', () => {
    const onChange = vi.fn()
    render(<RMDLifeExpectancyTableConfig value="german_2020_22" onChange={onChange} isFormMode={true} />)

    expect(screen.getByText('Datengrundlage für Lebenserwartung')).toBeInTheDocument()
  })

  it('should show direct mode label', () => {
    const onChange = vi.fn()
    render(<RMDLifeExpectancyTableConfig value="german_2020_22" onChange={onChange} isFormMode={false} />)

    expect(screen.getByText('Sterbetabelle')).toBeInTheDocument()
  })
})

describe('RMDCustomLifeExpectancyConfig', () => {
  it('should render with value', () => {
    const onChange = vi.fn()
    render(<RMDCustomLifeExpectancyConfig value={20} startAge={65} onChange={onChange} />)

    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
  })

  it('should call onChange when value changes', () => {
    const onChange = vi.fn()
    render(<RMDCustomLifeExpectancyConfig value={20} startAge={65} onChange={onChange} />)

    const input = screen.getByDisplayValue('20')
    fireEvent.change(input, { target: { value: '25' } })

    expect(onChange).toHaveBeenCalledWith(25)
  })

  it('should show form mode label and description', () => {
    const onChange = vi.fn()
    render(<RMDCustomLifeExpectancyConfig value={20} startAge={65} onChange={onChange} isFormMode={true} />)

    expect(screen.getByText('Verbleibende Lebenserwartung (Jahre)')).toBeInTheDocument()
    expect(screen.getByText('Anzahl der Jahre, die das Portfolio vorhalten soll')).toBeInTheDocument()
  })

  it('should show direct mode label and description with calculated age', () => {
    const onChange = vi.fn()
    render(<RMDCustomLifeExpectancyConfig value={20} startAge={65} onChange={onChange} isFormMode={false} />)

    expect(screen.getByText('Benutzerdefinierte Lebenserwartung (Jahre)')).toBeInTheDocument()
    expect(screen.getByText(/Erwartete Lebensdauer.*Leben bis Alter 85/)).toBeInTheDocument()
  })
})

describe('RMDCalculationInfo', () => {
  it('should render calculation info', () => {
    render(<RMDCalculationInfo startAge={65} />)

    expect(screen.getByText('Entnahme-Berechnung')).toBeInTheDocument()
    expect(screen.getByText(/Portfoliowert ÷ Divisor/)).toBeInTheDocument()
  })

  it('should display RMD description for given age', () => {
    render(<RMDCalculationInfo startAge={70} />)

    // The description will be shown from the getRMDDescription function
    expect(screen.getByText('Entnahme-Berechnung')).toBeInTheDocument()
  })
})

describe('RMDWithdrawalConfiguration Helpers', () => {
  describe('validateModeProps', () => {
    it('should not throw when form mode is valid', () => {
      expect(() => validateModeProps(true, false)).not.toThrow()
    })

    it('should not throw when direct mode is valid', () => {
      expect(() => validateModeProps(false, true)).not.toThrow()
    })

    it('should throw when neither mode is valid', () => {
      expect(() => validateModeProps(false, false)).toThrow(
        'RMDWithdrawalConfiguration requires either (formValue + updateFormValue) or (values + onChange)',
      )
    })
  })

  describe('getCurrentValuesFromForm', () => {
    it('should extract values from form value', () => {
      const formValue = {
        rmdStartAge: 67,
      } as any

      const result = getCurrentValuesFromForm(formValue, 'german_2020_22', 20)

      expect(result).toEqual({
        startAge: 67,
        lifeExpectancyTable: 'german_2020_22',
        customLifeExpectancy: 20,
      })
    })
  })

  describe('getCurrentValuesFromDirect', () => {
    it('should merge direct values with defaults', () => {
      const values = {
        startAge: 70,
        lifeExpectancyTable: 'custom' as const,
        customLifeExpectancy: 25,
      }

      const result = getCurrentValuesFromDirect(values)

      expect(result).toEqual({
        startAge: 70,
        lifeExpectancyTable: 'custom',
        customLifeExpectancy: 25,
      })
    })

    it('should use default values for missing fields', () => {
      const values = {
        startAge: 65,
        lifeExpectancyTable: 'german_2020_22' as const,
      }

      const result = getCurrentValuesFromDirect(values)

      expect(result.customLifeExpectancy).toBe(20)
    })
  })
})
