import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyRiskConfiguration } from './CurrencyRiskConfiguration'
import type { Currency, HedgingStrategy } from '../../helpers/currency-risk'

describe('CurrencyRiskConfiguration', () => {
  const defaultProps = {
    enabled: false,
    currencyAllocations: [
      { currency: 'EUR' as Currency, allocation: 0.6 },
      { currency: 'USD' as Currency, allocation: 0.3 },
      { currency: 'GBP' as Currency, allocation: 0.1 },
    ],
    hedgingStrategy: 'unhedged' as HedgingStrategy,
    hedgingRatio: 0.5,
    hedgingCostPercent: 0.01,
    onEnabledChange: vi.fn(),
    onCurrencyAllocationChange: vi.fn(),
    onHedgingStrategyChange: vi.fn(),
    onHedgingRatioChange: vi.fn(),
    onHedgingCostChange: vi.fn(),
  }

  describe('Basic Rendering', () => {
    it('renders the component with switch disabled', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} />)

      expect(
        screen.getByText('Währungsrisiko berücksichtigen')
      ).toBeInTheDocument()
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('does not show configuration when disabled', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} />)

      expect(screen.queryByText('Währungsallokation')).not.toBeInTheDocument()
      expect(screen.queryByText('Währungsabsicherung')).not.toBeInTheDocument()
    })

    it('shows configuration when enabled', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByText('Währungsallokation')).toBeInTheDocument()
      expect(screen.getByText('Währungsabsicherung')).toBeInTheDocument()
    })

    it('renders all currency allocation sliders when enabled', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByText('Euro (EUR)')).toBeInTheDocument()
      expect(screen.getByText('US-Dollar (USD)')).toBeInTheDocument()
      expect(screen.getByText('Britisches Pfund (GBP)')).toBeInTheDocument()
    })
  })

  describe('Enable/Disable Functionality', () => {
    it('calls onEnabledChange when switch is toggled', async () => {
      const user = userEvent.setup()
      render(<CurrencyRiskConfiguration {...defaultProps} />)

      const switchElement = screen.getByRole('switch')
      await user.click(switchElement)

      expect(defaultProps.onEnabledChange).toHaveBeenCalledWith(true)
    })

    it('shows correct description text', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} />)

      expect(
        screen.getByText(/Aktiviert die Analyse und Verwaltung von Währungsrisiken/)
      ).toBeInTheDocument()
    })
  })

  describe('Currency Allocations', () => {
    it('displays current allocation percentages', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      // Check that allocation sections are rendered
      expect(screen.getByText('Euro (EUR)')).toBeInTheDocument()
      expect(screen.getByText('US-Dollar (USD)')).toBeInTheDocument()
      expect(screen.getByText('Britisches Pfund (GBP)')).toBeInTheDocument()
    })

    it('displays sum of allocations', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      // Sum should be 100% (0.6 + 0.3 + 0.1 = 1.0)
      expect(screen.getByText(/Summe:/)).toBeInTheDocument()
      const sumElements = screen.getAllByText(/100%/)
      expect(sumElements.length).toBeGreaterThan(0)
    })

    it('calculates sum correctly for different allocations', () => {
      const props = {
        ...defaultProps,
        enabled: true,
        currencyAllocations: [
          { currency: 'EUR' as Currency, allocation: 0.5 },
          { currency: 'USD' as Currency, allocation: 0.4 },
        ],
      }
      render(<CurrencyRiskConfiguration {...props} />)

      // Sum should be 90% (0.5 + 0.4 = 0.9)
      const sumElements = screen.getAllByText(/90%/)
      expect(sumElements.length).toBeGreaterThan(0)
    })
  })

  describe('Hedging Strategy Selection', () => {
    it('renders all hedging strategy options', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByText('Ungesichert')).toBeInTheDocument()
      expect(screen.getByText('Teilweise')).toBeInTheDocument()
      expect(screen.getByText('Vollständig')).toBeInTheDocument()
    })

    it('calls onHedgingStrategyChange when strategy is selected', async () => {
      const user = userEvent.setup()
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      const partialHedgedOption = screen.getByText('Teilweise')
      await user.click(partialHedgedOption)

      expect(defaultProps.onHedgingStrategyChange).toHaveBeenCalledWith('partial_hedged')
    })

    it('displays strategy descriptions', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(
        screen.getByText(/Keine Absicherung, volles Währungsrisiko/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Teilweise Absicherung des Währungsrisikos/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Vollständige Absicherung gegen Währungsschwankungen/)
      ).toBeInTheDocument()
    })
  })

  describe('Hedging Ratio Slider', () => {
    it('shows hedging ratio slider for partial hedging', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="partial_hedged"
        />
      )

      expect(screen.getByText('Absicherungsgrad')).toBeInTheDocument()
    })

    it('does not show hedging ratio slider for unhedged strategy', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="unhedged"
        />
      )

      expect(screen.queryByText('Absicherungsgrad')).not.toBeInTheDocument()
    })

    it('does not show hedging ratio slider for fully hedged strategy', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="fully_hedged"
        />
      )

      expect(screen.queryByText('Absicherungsgrad')).not.toBeInTheDocument()
    })

    it('displays current hedging ratio percentage', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="partial_hedged"
          hedgingRatio={0.7}
        />
      )

      const seventyPercent = screen.getAllByText('70%')
      expect(seventyPercent.length).toBeGreaterThan(0)
    })
  })

  describe('Hedging Cost Slider', () => {
    it('shows hedging cost slider for fully hedged strategy', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="fully_hedged"
        />
      )

      expect(screen.getByText('Absicherungskosten (% p.a.)')).toBeInTheDocument()
    })

    it('shows hedging cost slider for partial hedging', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="partial_hedged"
        />
      )

      expect(screen.getByText('Absicherungskosten (% p.a.)')).toBeInTheDocument()
    })

    it('does not show hedging cost slider for unhedged strategy', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="unhedged"
        />
      )

      expect(
        screen.queryByText('Absicherungskosten (% p.a.)')
      ).not.toBeInTheDocument()
    })

    it('displays current hedging cost percentage', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="fully_hedged"
          hedgingCostPercent={0.015}
        />
      )

      const costElements = screen.getAllByText('1.5%')
      expect(costElements.length).toBeGreaterThan(0)
    })
  })

  describe('Information Box', () => {
    it('displays information box when enabled', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByText('💡 Hinweis zur Währungsabsicherung')).toBeInTheDocument()
    })

    it('shows information about all hedging strategies', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByText(/Ungesichert:/)).toBeInTheDocument()
      expect(screen.getByText(/Teilweise gesichert:/)).toBeInTheDocument()
      expect(screen.getByText(/Vollständig gesichert:/)).toBeInTheDocument()
    })

    it('includes cost warning', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(
        screen.getByText(/Die Absicherungskosten reduzieren die Gesamtrendite/)
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty currency allocations', () => {
      const props = {
        ...defaultProps,
        enabled: true,
        currencyAllocations: [],
      }
      render(<CurrencyRiskConfiguration {...props} />)

      expect(screen.getByText(/Summe:/)).toBeInTheDocument()
      const zeroElements = screen.getAllByText(/0%/)
      expect(zeroElements.length).toBeGreaterThan(0)
    })

    it('handles single currency allocation', () => {
      const props = {
        ...defaultProps,
        enabled: true,
        currencyAllocations: [{ currency: 'EUR' as Currency, allocation: 1.0 }],
      }
      render(<CurrencyRiskConfiguration {...props} />)

      expect(screen.getByText('Euro (EUR)')).toBeInTheDocument()
      const hundredElements = screen.getAllByText(/100%/)
      expect(hundredElements.length).toBeGreaterThan(0)
    })

    it('handles zero hedging cost', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="fully_hedged"
          hedgingCostPercent={0}
        />
      )

      const zeroElements = screen.getAllByText('0.0%')
      expect(zeroElements.length).toBeGreaterThan(0)
    })

    it('handles maximum hedging cost', () => {
      render(
        <CurrencyRiskConfiguration
          {...defaultProps}
          enabled={true}
          hedgingStrategy="fully_hedged"
          hedgingCostPercent={0.05}
        />
      )

      const fiveElements = screen.getAllByText('5.0%')
      expect(fiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form elements', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByText('Währungsrisiko berücksichtigen')).toBeInTheDocument()
      expect(screen.getByText('Absicherungsstrategie')).toBeInTheDocument()
    })

    it('uses semantic HTML elements', () => {
      render(<CurrencyRiskConfiguration {...defaultProps} enabled={true} />)

      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('maintains unique IDs for form elements', () => {
      const { container } = render(
        <CurrencyRiskConfiguration {...defaultProps} enabled={true} />
      )

      const inputs = container.querySelectorAll('input')
      const ids = Array.from(inputs)
        .map((input) => input.id)
        .filter((id) => id)

      // Check that all IDs are unique
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('Integration', () => {
    it('updates multiple settings in sequence', async () => {
      const user = userEvent.setup()
      render(<CurrencyRiskConfiguration {...defaultProps} />)

      // Enable currency risk
      const switchElement = screen.getByRole('switch')
      await user.click(switchElement)
      expect(defaultProps.onEnabledChange).toHaveBeenCalledWith(true)
    })

    it('handles rapid state changes', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()
      const props = {
        ...defaultProps,
        enabled: true,
        onHedgingStrategyChange: mockOnChange,
      }
      render(<CurrencyRiskConfiguration {...props} />)

      const partialOption = screen.getByLabelText('Teilweise')
      const unhedgedOption = screen.getByLabelText('Ungesichert')

      await user.click(partialOption)
      await user.click(unhedgedOption)

      // RadioTile may trigger multiple calls due to both div and input clicks
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledWith('partial_hedged')
      expect(mockOnChange).toHaveBeenCalledWith('unhedged')
    })
  })
})
