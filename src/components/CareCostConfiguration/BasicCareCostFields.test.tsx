import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BasicCareCostFields } from './BasicCareCostFields'
import { createDefaultCareCostConfiguration } from '../../../helpers/care-cost-simulation'

describe('BasicCareCostFields', () => {
  const defaultProps = {
    values: createDefaultCareCostConfiguration(),
    onChange: vi.fn(),
    currentYear: 2024,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Start Year Field', () => {
    it('should render start year input with current value', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Startjahr der Pflegebedürftigkeit')
      expect(input).toHaveValue(defaultProps.values.startYear)
    })

    it('should call onChange when start year changes', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Startjahr der Pflegebedürftigkeit')
      fireEvent.change(input, { target: { value: '2030' } })
      
      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        startYear: 2030,
      })
    })

    it('should show help text for start year', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      expect(screen.getByText('Jahr, in dem Pflegebedürftigkeit erwartet wird')).toBeInTheDocument()
    })
  })

  describe('Custom Monthly Costs Field', () => {
    it('should render custom monthly costs input', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      expect(input).toBeInTheDocument()
    })

    it('should show empty value when no custom costs set', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      expect(input).toHaveValue(null)
    })

    it('should call onChange when custom costs change', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      fireEvent.change(input, { target: { value: '1500' } })
      
      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        customMonthlyCosts: 1500,
      })
    })

    it('should clear custom costs when input is emptied', () => {
      const propsWithCustomCosts = {
        ...defaultProps,
        values: { ...defaultProps.values, customMonthlyCosts: 1500 },
      }
      render(<BasicCareCostFields {...propsWithCustomCosts} />)
      
      const input = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      fireEvent.change(input, { target: { value: '' } })
      
      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        customMonthlyCosts: undefined,
      })
    })

    it('should show placeholder with standard cost', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')
      expect(input).toHaveAttribute('placeholder', expect.stringContaining('Standard:'))
    })

    it('should show help text with care level name', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      expect(screen.getByText(/Überschreibt die typischen Kosten für/)).toBeInTheDocument()
    })
  })

  describe('Care Duration Field', () => {
    it('should render care duration input with current value', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)')
      expect(input).toHaveValue(defaultProps.values.careDurationYears)
    })

    it('should call onChange when care duration changes', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      const input = screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)')
      fireEvent.change(input, { target: { value: '5' } })
      
      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...defaultProps.values,
        careDurationYears: 5,
      })
    })

    it('should show "bis Lebensende" text when duration is 0', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      expect(screen.getByText('Pflegebedürftigkeit bis zum Lebensende')).toBeInTheDocument()
    })

    it('should show duration in years when not 0', () => {
      const propsWithDuration = {
        ...defaultProps,
        values: { ...defaultProps.values, careDurationYears: 5 },
      }
      render(<BasicCareCostFields {...propsWithDuration} />)
      
      expect(screen.getByText('Pflegebedürftigkeit für 5 Jahre')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should render all three fields together', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      expect(screen.getByLabelText('Startjahr der Pflegebedürftigkeit')).toBeInTheDocument()
      expect(screen.getByLabelText('Individuelle monatliche Pflegekosten (optional)')).toBeInTheDocument()
      expect(screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)')).toBeInTheDocument()
    })

    it('should handle multiple onChange calls correctly', () => {
      render(<BasicCareCostFields {...defaultProps} />)
      
      fireEvent.change(screen.getByLabelText('Startjahr der Pflegebedürftigkeit'), { target: { value: '2030' } })
      fireEvent.change(screen.getByLabelText('Pflegedauer (Jahre, 0 = bis Lebensende)'), { target: { value: '10' } })
      
      expect(defaultProps.onChange).toHaveBeenCalledTimes(2)
    })
  })
})
