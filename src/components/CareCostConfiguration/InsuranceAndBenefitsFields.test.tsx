import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InsuranceAndBenefitsFields } from './InsuranceAndBenefitsFields'
import { createDefaultCareCostConfiguration } from '../../../helpers/care-cost-simulation'

describe('InsuranceAndBenefitsFields', () => {
  const defaultProps = {
    values: createDefaultCareCostConfiguration(),
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Statutory Benefits Switch', () => {
    it('should render statutory benefits switch', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      expect(screen.getByLabelText('Gesetzliche Pflegeleistungen berücksichtigen')).toBeInTheDocument()
    })

    it('should reflect current value', () => {
      const propsWithBenefits = {
        ...defaultProps,
        values: { ...defaultProps.values, includeStatutoryBenefits: true },
      }
      render(<InsuranceAndBenefitsFields {...propsWithBenefits} />)

      const switchElement = screen.getByLabelText('Gesetzliche Pflegeleistungen berücksichtigen')
      expect(switchElement).toBeChecked()
    })

    it('should call onChange when toggled', () => {
      const propsWithBenefits = {
        ...defaultProps,
        values: { ...defaultProps.values, includeStatutoryBenefits: false },
      }
      render(<InsuranceAndBenefitsFields {...propsWithBenefits} />)

      const switchElement = screen.getByLabelText('Gesetzliche Pflegeleistungen berücksichtigen')
      fireEvent.click(switchElement)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...propsWithBenefits.values,
        includeStatutoryBenefits: true,
      })
    })
  })

  describe('Private Care Insurance Field', () => {
    it('should render private care insurance input', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      expect(screen.getByLabelText('Private Pflegeversicherung (monatlich)')).toBeInTheDocument()
    })

    it('should show current value', () => {
      const propsWithPrivateCare = {
        ...defaultProps,
        values: { ...defaultProps.values, privateCareInsuranceMonthlyBenefit: 500 },
      }
      render(<InsuranceAndBenefitsFields {...propsWithPrivateCare} />)

      const input = screen.getByLabelText('Private Pflegeversicherung (monatlich)')
      expect(input).toHaveValue(500)
    })

    it('should call onChange when value changes', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      const input = screen.getByLabelText('Private Pflegeversicherung (monatlich)')
      fireEvent.change(input, { target: { value: '750' } })

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        privateCareInsuranceMonthlyBenefit: 750,
      })
    })

    it('should show help text', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      expect(screen.getByText('Zusätzliche monatliche Leistungen aus privater Pflegeversicherung')).toBeInTheDocument()
    })

    it('should have placeholder', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      const input = screen.getByLabelText('Private Pflegeversicherung (monatlich)')
      expect(input).toHaveAttribute('placeholder', 'z.B. 500')
    })
  })

  describe('Tax Deductible Section', () => {
    it('should render tax deductible switch', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      expect(screen.getByLabelText('Pflegekosten steuerlich absetzbar')).toBeInTheDocument()
    })

    it('should not show tax deduction field when switch is off', () => {
      const propsWithoutTax = {
        ...defaultProps,
        values: { ...defaultProps.values, taxDeductible: false },
      }
      render(<InsuranceAndBenefitsFields {...propsWithoutTax} />)

      expect(screen.queryByLabelText('Maximaler jährlicher Steuerabzug')).not.toBeInTheDocument()
    })

    it('should show tax deduction field when switch is on', () => {
      const propsWithTax = {
        ...defaultProps,
        values: { ...defaultProps.values, taxDeductible: true },
      }
      render(<InsuranceAndBenefitsFields {...propsWithTax} />)

      expect(screen.getByLabelText('Maximaler jährlicher Steuerabzug')).toBeInTheDocument()
    })

    it('should call onChange when tax switch is toggled', () => {
      const propsWithoutTax = {
        ...defaultProps,
        values: { ...defaultProps.values, taxDeductible: false },
      }
      render(<InsuranceAndBenefitsFields {...propsWithoutTax} />)

      const switchElement = screen.getByLabelText('Pflegekosten steuerlich absetzbar')
      fireEvent.click(switchElement)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...propsWithoutTax.values,
        taxDeductible: true,
      })
    })

    it('should show tax deduction value when enabled', () => {
      const propsWithTax = {
        ...defaultProps,
        values: {
          ...defaultProps.values,
          taxDeductible: true,
          maxAnnualTaxDeduction: 5000,
        },
      }
      render(<InsuranceAndBenefitsFields {...propsWithTax} />)

      const input = screen.getByLabelText('Maximaler jährlicher Steuerabzug')
      expect(input).toHaveValue(5000)
    })

    it('should call onChange when tax deduction amount changes', () => {
      const propsWithTax = {
        ...defaultProps,
        values: { ...defaultProps.values, taxDeductible: true },
      }
      render(<InsuranceAndBenefitsFields {...propsWithTax} />)

      const input = screen.getByLabelText('Maximaler jährlicher Steuerabzug')
      fireEvent.change(input, { target: { value: '6000' } })

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        maxAnnualTaxDeduction: 6000,
      })
    })

    it('should show help text for tax deduction', () => {
      const propsWithTax = {
        ...defaultProps,
        values: { ...defaultProps.values, taxDeductible: true },
      }
      render(<InsuranceAndBenefitsFields {...propsWithTax} />)

      expect(screen.getByText('Außergewöhnliche Belastungen nach deutschem Steuerrecht')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should render all fields together', () => {
      render(<InsuranceAndBenefitsFields {...defaultProps} />)

      expect(screen.getByLabelText('Gesetzliche Pflegeleistungen berücksichtigen')).toBeInTheDocument()
      expect(screen.getByLabelText('Private Pflegeversicherung (monatlich)')).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegekosten steuerlich absetzbar')).toBeInTheDocument()
    })

    it('should handle multiple onChange calls', () => {
      const propsWithTax = {
        ...defaultProps,
        values: { ...defaultProps.values, taxDeductible: true },
      }
      render(<InsuranceAndBenefitsFields {...propsWithTax} />)

      fireEvent.change(screen.getByLabelText('Private Pflegeversicherung (monatlich)'), {
        target: { value: '500' },
      })
      fireEvent.change(screen.getByLabelText('Maximaler jährlicher Steuerabzug'), {
        target: { value: '5000' },
      })

      expect(defaultProps.onChange).toHaveBeenCalledTimes(2)
    })
  })
})
