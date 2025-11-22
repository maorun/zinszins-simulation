/**
 * Tests for Factor Investing Configuration Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FactorInvestingConfiguration } from './FactorInvestingConfiguration'
import { createDefaultFactorPortfolioConfig } from '../../../helpers/factor-investing'

describe('FactorInvestingConfiguration', () => {
  it('should render with factor investing disabled', () => {
    const config = createDefaultFactorPortfolioConfig()
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Faktor-Investing')).toBeInTheDocument()
    expect(screen.queryByText('Verfügbare Faktoren')).not.toBeInTheDocument()
  })

  it('should show configuration when enabled', async () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Verfügbare Faktoren')).toBeInTheDocument()
    expect(screen.getByText('Value-Faktor')).toBeInTheDocument()
    expect(screen.getByText('Growth-Faktor')).toBeInTheDocument()
    expect(screen.getByText('Small-Cap-Faktor')).toBeInTheDocument()
    expect(screen.getByText('Momentum-Faktor')).toBeInTheDocument()
  })

  it('should toggle factor investing on and off', async () => {
    const config = createDefaultFactorPortfolioConfig()
    const onChange = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    // Find and click the main toggle switch
    const switches = screen.getAllByRole('switch')
    const mainSwitch = switches[0] // First switch should be the main enable/disable

    await user.click(mainSwitch)

    expect(onChange).toHaveBeenCalledWith({ enabled: true })

    // Re-render with enabled state
    const enabledConfig = { ...config, enabled: true }
    rerender(<FactorInvestingConfiguration config={enabledConfig} onChange={onChange} />)

    expect(screen.getByText('Verfügbare Faktoren')).toBeInTheDocument()
  })

  it('should enable a specific factor', async () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    // Find Value factor switch (should be the second switch, first is main toggle)
    const switches = screen.getAllByRole('switch')
    const valueSwitch = switches[1]

    await user.click(valueSwitch)

    expect(onChange).toHaveBeenCalledWith({
      factors: expect.objectContaining({
        value: expect.objectContaining({
          enabled: true,
        }),
      }),
    })
  })

  it('should display factor statistics when factors are active', () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    config.factors.value.enabled = true
    config.factors.value.exposure = 1.0
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Faktor-Portfolio Zusammenfassung')).toBeInTheDocument()
    expect(screen.getByText('Aktive Faktoren:')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // 1 active factor
  })

  it('should display validation warnings for conflicting factors', () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    config.factors.value.enabled = true
    config.factors.value.exposure = 0.7
    config.factors.growth.enabled = true
    config.factors.growth.exposure = 0.6
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Validierungswarnungen')).toBeInTheDocument()
    // Text appears in both validation warning and info section, so use getAllByText
    const conflictTexts = screen.getAllByText(/gegensätzliche Faktoren/)
    expect(conflictTexts.length).toBeGreaterThan(0)
  })

  it('should display info section with hints', () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Hinweise zum Faktor-Investing:')).toBeInTheDocument()
    expect(screen.getByText(/Fama-French Forschung/)).toBeInTheDocument()
  })

  it('should show factor descriptions and research basis', () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    // Check that factor descriptions are visible
    expect(
      screen.getByText(/Investiert in Unternehmen mit niedrigen Bewertungskennzahlen/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Fokussiert auf Unternehmen mit hohem Gewinnwachstum/)).toBeInTheDocument()
  })

  it('should display historical premium and volatility for each factor', () => {
    const config = createDefaultFactorPortfolioConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<FactorInvestingConfiguration config={config} onChange={onChange} />)

    // Check for historical premiums
    const premiumElements = screen.getAllByText(/Historische Prämie:/)
    expect(premiumElements.length).toBeGreaterThan(0)

    // Check for additional volatility
    const volatilityElements = screen.getAllByText(/Zusätzliche Volatilität:/)
    expect(volatilityElements.length).toBeGreaterThan(0)
  })
})
