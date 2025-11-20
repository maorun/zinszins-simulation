import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaxLossHarvestingSection } from './TaxLossHarvestingSection'

describe('TaxLossHarvestingSection', () => {
  const defaultConfig = {
    enabled: false,
    realizedStockLosses: 0,
    realizedOtherLosses: 0,
    lossCarryForward: 0,
  }

  describe('rendering', () => {
    it('should render the section with title and description', () => {
      const onConfigChange = vi.fn()
      render(<TaxLossHarvestingSection config={defaultConfig} onConfigChange={onConfigChange} />)

      expect(screen.getByText(/Verlustverrechnung \(Tax-Loss Harvesting\)/)).toBeInTheDocument()
      expect(screen.getByText(/Realisierte Verluste zum Ausgleich von Kapitalerträgen nutzen/)).toBeInTheDocument()
    })

    it('should render enable switch', () => {
      const onConfigChange = vi.fn()
      render(<TaxLossHarvestingSection config={defaultConfig} onConfigChange={onConfigChange} />)

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
      expect(switchElement).not.toBeChecked()
    })

    it('should not render input fields when disabled', () => {
      const onConfigChange = vi.fn()
      render(<TaxLossHarvestingSection config={defaultConfig} onConfigChange={onConfigChange} />)

      expect(screen.queryByLabelText(/Realisierte Aktienverluste/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Realisierte sonstige Verluste/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Verlustvortrag aus Vorjahren/)).not.toBeInTheDocument()
    })

    it('should render input fields when enabled', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      expect(screen.getByLabelText(/Realisierte Aktienverluste/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Realisierte sonstige Verluste/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Verlustvortrag aus Vorjahren/)).toBeInTheDocument()
    })

    it('should render German tax rules info box when enabled', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      expect(screen.getByText(/Deutsche Verlustverrechnungsregeln:/)).toBeInTheDocument()
      expect(screen.getByText(/können nur mit Aktiengewinnen verrechnet werden/)).toBeInTheDocument()
      expect(screen.getByText(/können mit allen Kapitalerträgen verrechnet werden/)).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('should call onConfigChange when enabling the section', () => {
      const onConfigChange = vi.fn()
      render(<TaxLossHarvestingSection config={defaultConfig} onConfigChange={onConfigChange} />)

      const switchElement = screen.getByRole('switch')
      fireEvent.click(switchElement)

      expect(onConfigChange).toHaveBeenCalledWith({
        ...defaultConfig,
        enabled: true,
      })
    })

    it('should call onConfigChange when disabling the section', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const switchElement = screen.getByRole('switch')
      fireEvent.click(switchElement)

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        enabled: false,
      })
    })

    it('should update stock losses when input changes', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const stockLossesInput = screen.getByLabelText(/Realisierte Aktienverluste/)
      fireEvent.change(stockLossesInput, { target: { value: '5000' } })

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        realizedStockLosses: 5000,
      })
    })

    it('should update other losses when input changes', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const otherLossesInput = screen.getByLabelText(/Realisierte sonstige Verluste/)
      fireEvent.change(otherLossesInput, { target: { value: '3000' } })

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        realizedOtherLosses: 3000,
      })
    })

    it('should update loss carry-forward when input changes', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const carryForwardInput = screen.getByLabelText(/Verlustvortrag aus Vorjahren/)
      fireEvent.change(carryForwardInput, { target: { value: '2000' } })

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        lossCarryForward: 2000,
      })
    })

    it('should prevent negative stock losses', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true, realizedStockLosses: 1000 }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const stockLossesInput = screen.getByLabelText(/Realisierte Aktienverluste/)
      fireEvent.change(stockLossesInput, { target: { value: '-500' } })

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        realizedStockLosses: 0,
      })
    })

    it('should prevent negative other losses', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true, realizedOtherLosses: 1000 }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const otherLossesInput = screen.getByLabelText(/Realisierte sonstige Verluste/)
      fireEvent.change(otherLossesInput, { target: { value: '-300' } })

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        realizedOtherLosses: 0,
      })
    })

    it('should prevent negative loss carry-forward', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true, lossCarryForward: 2000 }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const carryForwardInput = screen.getByLabelText(/Verlustvortrag aus Vorjahren/)
      fireEvent.change(carryForwardInput, { target: { value: '-100' } })

      expect(onConfigChange).toHaveBeenCalledWith({
        ...enabledConfig,
        lossCarryForward: 0,
      })
    })
  })

  describe('value display', () => {
    it('should display current stock losses value', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = {
        enabled: true,
        realizedStockLosses: 5000,
        realizedOtherLosses: 0,
        lossCarryForward: 0,
      }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const stockLossesInput = screen.getByLabelText(/Realisierte Aktienverluste/) as HTMLInputElement
      expect(stockLossesInput.value).toBe('5000')
    })

    it('should display current other losses value', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: 3000,
        lossCarryForward: 0,
      }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const otherLossesInput = screen.getByLabelText(/Realisierte sonstige Verluste/) as HTMLInputElement
      expect(otherLossesInput.value).toBe('3000')
    })

    it('should display current loss carry-forward value', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = {
        enabled: true,
        realizedStockLosses: 0,
        realizedOtherLosses: 0,
        lossCarryForward: 2000,
      }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const carryForwardInput = screen.getByLabelText(/Verlustvortrag aus Vorjahren/) as HTMLInputElement
      expect(carryForwardInput.value).toBe('2000')
    })
  })

  describe('accessibility', () => {
    it('should have unique IDs for all form fields', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const stockLossesInput = screen.getByLabelText(/Realisierte Aktienverluste/)
      const otherLossesInput = screen.getByLabelText(/Realisierte sonstige Verluste/)
      const carryForwardInput = screen.getByLabelText(/Verlustvortrag aus Vorjahren/)

      expect(stockLossesInput.id).toBeTruthy()
      expect(otherLossesInput.id).toBeTruthy()
      expect(carryForwardInput.id).toBeTruthy()
      expect(stockLossesInput.id).not.toBe(otherLossesInput.id)
      expect(stockLossesInput.id).not.toBe(carryForwardInput.id)
      expect(otherLossesInput.id).not.toBe(carryForwardInput.id)
    })

    it('should have proper labels associated with inputs', () => {
      const onConfigChange = vi.fn()
      const enabledConfig = { ...defaultConfig, enabled: true }
      render(<TaxLossHarvestingSection config={enabledConfig} onConfigChange={onConfigChange} />)

      const stockLossesInput = screen.getByLabelText(/Realisierte Aktienverluste/)
      const otherLossesInput = screen.getByLabelText(/Realisierte sonstige Verluste/)
      const carryForwardInput = screen.getByLabelText(/Verlustvortrag aus Vorjahren/)

      expect(stockLossesInput).toBeInTheDocument()
      expect(otherLossesInput).toBeInTheDocument()
      expect(carryForwardInput).toBeInTheDocument()
    })
  })
})
