import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VariabelProzentConfig, MonatlichFestConfig } from './BucketSubStrategyConfigs'

describe('BucketSubStrategyConfigs', () => {
  describe('VariabelProzentConfig', () => {
    it('renders with value', () => {
      render(<VariabelProzentConfig value={5} onChange={vi.fn()} />)
      
      expect(screen.getByText('Entnahme-Prozentsatz (%)')).toBeInTheDocument()
      expect(screen.getByText('5%')).toBeInTheDocument()
    })

    it('renders slider with correct value', () => {
      render(<VariabelProzentConfig value={4} onChange={vi.fn()} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuenow', '4')
    })

    it('displays helper text', () => {
      render(<VariabelProzentConfig value={4} onChange={vi.fn()} />)
      
      expect(
        screen.getByText(/Wählen Sie einen Entnahme-Prozentsatz zwischen 1% und 10%/),
      ).toBeInTheDocument()
    })

    it('displays correct min and max labels', () => {
      render(<VariabelProzentConfig value={4} onChange={vi.fn()} />)
      
      expect(screen.getByText('1%')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
    })
  })

  describe('MonatlichFestConfig', () => {
    it('renders with value', () => {
      render(<MonatlichFestConfig value={2500} onChange={vi.fn()} />)
      
      expect(screen.getByText('Monatlicher Betrag (€)')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2500')).toBeInTheDocument()
    })

    it('calls onChange when input changes', () => {
      const onChange = vi.fn()
      render(<MonatlichFestConfig value={2000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('2000')
      fireEvent.change(input, { target: { value: '3000' } })
      
      expect(onChange).toHaveBeenCalledWith(3000)
    })

    it('handles empty input by setting to 0', () => {
      const onChange = vi.fn()
      render(<MonatlichFestConfig value={2000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('2000')
      fireEvent.change(input, { target: { value: '' } })
      
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('handles invalid input by falling back to 0', () => {
      const onChange = vi.fn()
      render(<MonatlichFestConfig value={2000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('2000')
      fireEvent.change(input, { target: { value: 'abc' } })
      
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('displays helper text', () => {
      render(<MonatlichFestConfig value={2000} onChange={vi.fn()} />)
      
      expect(
        screen.getByText(/Fester monatlicher Entnahme-Betrag/),
      ).toBeInTheDocument()
    })
  })
})
