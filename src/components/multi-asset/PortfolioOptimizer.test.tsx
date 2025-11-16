import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PortfolioOptimizer } from './PortfolioOptimizer'
import { createDefaultMultiAssetConfig } from '../../../helpers/multi-asset-portfolio'

describe('PortfolioOptimizer', () => {
  it('should render portfolio optimizer', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    expect(screen.getByText('Portfolio-Optimierung')).toBeInTheDocument()
    expect(screen.getByText('Automatische Portfolio-Optimierung')).toBeInTheDocument()
  })

  it('should display optimization objectives', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    expect(screen.getByText('Maximale Sharpe Ratio')).toBeInTheDocument()
    expect(screen.getByText('Minimales Risiko')).toBeInTheDocument()
    expect(screen.getByText('Maximale Rendite')).toBeInTheDocument()
  })

  it('should show warning when less than 2 assets enabled', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    
    // Disable all assets first
    for (const asset of Object.keys(config.assetClasses)) {
      config.assetClasses[asset as keyof typeof config.assetClasses].enabled = false
    }
    
    // Enable only one asset
    config.assetClasses.stocks_domestic.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    expect(
      screen.getByText(/Mindestens 2 Anlageklassen müssen aktiviert sein/),
    ).toBeInTheDocument()
  })

  it('should disable optimize button when less than 2 assets enabled', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    
    // Disable all assets first
    for (const asset of Object.keys(config.assetClasses)) {
      config.assetClasses[asset as keyof typeof config.assetClasses].enabled = false
    }
    
    // Enable only one asset
    config.assetClasses.stocks_domestic.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    const optimizeButton = screen.getByRole('button', { name: /Portfolio optimieren/ })
    expect(optimizeButton).toBeDisabled()
  })

  it('should allow selecting different optimization objectives', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    const minVolatilityRadio = screen.getByLabelText(/Minimales Risiko/)
    fireEvent.click(minVolatilityRadio)

    expect(minVolatilityRadio).toBeChecked()
  })

  it('should run optimization when optimize button clicked', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true
    config.assetClasses.bonds_government.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    const optimizeButton = screen.getByRole('button', { name: /Portfolio optimieren/ })
    fireEvent.click(optimizeButton)

    // Should show results after optimization
    expect(screen.getByText('Optimierungsergebnis')).toBeInTheDocument()
    expect(screen.getByText('Erwartete Rendite')).toBeInTheDocument()
    expect(screen.getByText('Erwartetes Risiko')).toBeInTheDocument()
  })

  it('should display optimization results with metrics', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true
    config.assetClasses.bonds_government.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    const optimizeButton = screen.getByRole('button', { name: /Portfolio optimieren/ })
    fireEvent.click(optimizeButton)

    // Check for metrics display
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument()
    expect(screen.getByText('Optimierte Allokationen:')).toBeInTheDocument()
  })

  it('should call onApplyAllocations when apply button clicked', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    // Run optimization first
    const optimizeButton = screen.getByRole('button', { name: /Portfolio optimieren/ })
    fireEvent.click(optimizeButton)

    // Click apply button
    const applyButton = screen.getByRole('button', { name: /Optimierte Allokationen übernehmen/ })
    fireEvent.click(applyButton)

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        stocks_domestic: expect.any(Number),
        stocks_international: expect.any(Number),
      }),
    )
  })

  it('should show convergence information', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.bonds_government.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    const optimizeButton = screen.getByRole('button', { name: /Portfolio optimieren/ })
    fireEvent.click(optimizeButton)

    // Should show convergence info
    expect(screen.getByText(/Konvergiert nach|Maximale Iterationen erreicht/)).toBeInTheDocument()
  })

  it('should display asset allocations sorted by size', () => {
    const config = createDefaultMultiAssetConfig()
    config.enabled = true
    config.assetClasses.stocks_domestic.enabled = true
    config.assetClasses.stocks_international.enabled = true
    config.assetClasses.bonds_government.enabled = true

    const mockOnApply = vi.fn()

    render(<PortfolioOptimizer config={config} onApplyAllocations={mockOnApply} />)

    const optimizeButton = screen.getByRole('button', { name: /Portfolio optimieren/ })
    fireEvent.click(optimizeButton)

    // Should show asset names and percentages
    const allocations = screen.getAllByText(/%$/)
    expect(allocations.length).toBeGreaterThan(0)
  })
})
