import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  InitialCashCushionConfig,
  RefillThresholdConfig,
  RefillPercentageConfig,
} from './BucketConfigComponents'

describe('BucketConfigComponents', () => {
  describe('InitialCashCushionConfig', () => {
    it('renders with value', () => {
      render(<InitialCashCushionConfig value={25000} onChange={vi.fn()} />)
      
      expect(screen.getByText('Initiales Cash-Polster (€)')).toBeInTheDocument()
      expect(screen.getByDisplayValue('25000')).toBeInTheDocument()
    })

    it('calls onChange when input changes', () => {
      const onChange = vi.fn()
      render(<InitialCashCushionConfig value={20000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('20000')
      fireEvent.change(input, { target: { value: '30000' } })
      
      expect(onChange).toHaveBeenCalledWith(30000)
    })

    it('handles empty input by setting to 0', () => {
      const onChange = vi.fn()
      render(<InitialCashCushionConfig value={20000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('20000')
      fireEvent.change(input, { target: { value: '' } })
      
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('displays form mode helper text when isFormMode=true', () => {
      render(<InitialCashCushionConfig value={20000} onChange={vi.fn()} isFormMode={true} />)
      
      expect(
        screen.getByText(/Anfänglicher Betrag im Cash-Polster für Entnahmen/),
      ).toBeInTheDocument()
    })

    it('displays direct mode helper text when isFormMode=false', () => {
      render(<InitialCashCushionConfig value={20000} onChange={vi.fn()} isFormMode={false} />)
      
      expect(
        screen.getByText(/Anfänglicher Cash-Puffer für negative Rendite-Jahre/),
      ).toBeInTheDocument()
    })

    it('uses custom inputId when provided', () => {
      render(
        <InitialCashCushionConfig 
          value={20000} 
          onChange={vi.fn()} 
          inputId="custom-id"
        />,
      )
      
      expect(screen.getByLabelText('Initiales Cash-Polster (€)')).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('RefillThresholdConfig', () => {
    it('renders with value', () => {
      render(<RefillThresholdConfig value={6000} onChange={vi.fn()} />)
      
      expect(screen.getByText('Auffüll-Schwellenwert (€)')).toBeInTheDocument()
      expect(screen.getByDisplayValue('6000')).toBeInTheDocument()
    })

    it('calls onChange when input changes', () => {
      const onChange = vi.fn()
      render(<RefillThresholdConfig value={5000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('5000')
      fireEvent.change(input, { target: { value: '8000' } })
      
      expect(onChange).toHaveBeenCalledWith(8000)
    })

    it('handles empty input by setting to 0', () => {
      const onChange = vi.fn()
      render(<RefillThresholdConfig value={5000} onChange={onChange} />)
      
      const input = screen.getByDisplayValue('5000')
      fireEvent.change(input, { target: { value: '' } })
      
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('displays helper text', () => {
      render(<RefillThresholdConfig value={5000} onChange={vi.fn()} />)
      
      expect(
        screen.getByText(/Überschreiten die jährlichen Gewinne diesen Betrag/),
      ).toBeInTheDocument()
    })

    it('uses custom inputId when provided', () => {
      render(
        <RefillThresholdConfig 
          value={5000} 
          onChange={vi.fn()} 
          inputId="custom-threshold-id"
        />,
      )
      
      expect(screen.getByLabelText('Auffüll-Schwellenwert (€)')).toHaveAttribute('id', 'custom-threshold-id')
    })
  })

  describe('RefillPercentageConfig', () => {
    it('renders with percentage value', () => {
      render(<RefillPercentageConfig value={0.6} onChange={vi.fn()} />)
      
      expect(screen.getByText('Auffüll-Anteil (%)')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    it('renders with percentage value', () => {
      render(<RefillPercentageConfig value={0.6} onChange={vi.fn()} />)
      
      expect(screen.getByText('Auffüll-Anteil (%)')).toBeInTheDocument()
      expect(screen.getAllByText('60%').length).toBeGreaterThan(0)
    })

    it('renders slider with correct value', () => {
      render(<RefillPercentageConfig value={0.5} onChange={vi.fn()} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuenow', '50')
    })

    it('displays helper text', () => {
      render(<RefillPercentageConfig value={0.5} onChange={vi.fn()} />)
      
      expect(
        screen.getByText(/Anteil der Überschussgewinne/),
      ).toBeInTheDocument()
    })

    it('displays correct min and max labels', () => {
      render(<RefillPercentageConfig value={0.5} onChange={vi.fn()} />)
      
      const labels = screen.getAllByText('10%')
      expect(labels.length).toBeGreaterThan(0)
      
      const maxLabels = screen.getAllByText('100%')
      expect(maxLabels.length).toBeGreaterThan(0)
    })

    it('formats percentage value correctly', () => {
      const { rerender } = render(<RefillPercentageConfig value={0.5} onChange={vi.fn()} />)
      expect(screen.getAllByText('50%').length).toBeGreaterThan(0)
      
      rerender(<RefillPercentageConfig value={0.75} onChange={vi.fn()} />)
      expect(screen.getAllByText('75%').length).toBeGreaterThan(0)
      
      rerender(<RefillPercentageConfig value={1.0} onChange={vi.fn()} />)
      expect(screen.getAllByText('100%').length).toBeGreaterThan(0)
    })
  })
})
