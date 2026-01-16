import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PortfolioTrackerSection } from './PortfolioTrackerSection'

// Mock the helper functions
vi.mock('../../../helpers/tax-loss-harvesting-tracker', () => ({
  createPortfolioPosition: vi.fn((id, name, symbol, assetClass, date, purchasePrice, currentPrice, quantity, totalCost, isStockFund) => ({
    id,
    name,
    symbol,
    assetClass,
    acquisitionDate: date,
    purchasePrice,
    currentPrice,
    quantity,
    totalCost,
    currentValue: currentPrice * quantity,
    unrealizedGainLoss: (currentPrice * quantity) - totalCost,
    unrealizedGainLossPercent: ((currentPrice * quantity) - totalCost) / totalCost * 100,
    isStockFund,
  })),
  identifyLossHarvestingOpportunities: vi.fn(() => []),
  getDefaultTransactionCostConfig: vi.fn(() => ({ percentageFee: 0.25, fixedFee: 0, minTransactionAmount: 500 })),
  getDefaultWashSaleConfig: vi.fn(() => ({ daysBefore: 30, daysAfter: 30, enabled: true })),
}))

describe('PortfolioTrackerSection', () => {
  const defaultProps = {
    taxRate: 0.26375,
    teilfreistellungsquote: 30,
  }

  it('renders disabled by default', () => {
    render(<PortfolioTrackerSection {...defaultProps} />)
    
    expect(screen.getByText('📊 Portfolio Tax Loss Harvesting Tracker')).toBeInTheDocument()
    expect(screen.queryByText('Portfolio-Position hinzufügen')).not.toBeInTheDocument()
  })

  it('enables tracker when switch is toggled', async () => {
    render(<PortfolioTrackerSection {...defaultProps} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio-Position hinzufügen')).toBeInTheDocument()
    })
  })

  it('shows portfolio form when add button is clicked', async () => {
    render(<PortfolioTrackerSection {...defaultProps} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio-Position hinzufügen')).toBeInTheDocument()
    })
    
    const addButton = screen.getByText('Portfolio-Position hinzufügen')
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('Neue Position hinzufügen')).toBeInTheDocument()
    })
  })

  it('hides add button when form is open', async () => {
    render(<PortfolioTrackerSection {...defaultProps} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      const addButton = screen.getByText('Portfolio-Position hinzufügen')
      fireEvent.click(addButton)
    })
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Portfolio-Position hinzufügen/i })).not.toBeInTheDocument()
    })
  })

  it('closes form when cancel button is clicked', async () => {
    render(<PortfolioTrackerSection {...defaultProps} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    await waitFor(() => {
      const addButton = screen.getByText('Portfolio-Position hinzufügen')
      fireEvent.click(addButton)
    })
    
    const cancelButton = screen.getByText('Abbrechen')
    fireEvent.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Neue Position hinzufügen')).not.toBeInTheDocument()
      expect(screen.getByText('Portfolio-Position hinzufügen')).toBeInTheDocument()
    })
  })
})
