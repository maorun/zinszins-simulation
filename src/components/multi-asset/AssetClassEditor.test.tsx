import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetClassEditor } from './AssetClassEditor'
import type { AssetClass } from '../../../helpers/multi-asset-portfolio'

describe('AssetClassEditor', () => {
  const mockOnChange = vi.fn()

  const defaultConfig = {
    enabled: true,
    targetAllocation: 0.6,
    expectedReturn: 0.07,
    volatility: 0.15,
  }

  it('should render enabled asset class with controls', () => {
    render(
      <AssetClassEditor
        assetClass={'stocks' as AssetClass}
        name="Aktien (ETF)"
        description="Globale Aktien-ETFs"
        config={defaultConfig}
        onChange={mockOnChange}
      />,
    )

    // Check name and description are displayed
    expect(screen.getByText('Aktien (ETF)')).toBeInTheDocument()
    expect(screen.getByText('Globale Aktien-ETFs')).toBeInTheDocument()

    // Check percentage displays
    expect(screen.getByText(/Zielallokation:.*60\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Erwartete Rendite:.*7\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/Volatilität:.*15\.0%/)).toBeInTheDocument()
  })

  it('should render disabled asset class without controls', () => {
    const disabledConfig = { ...defaultConfig, enabled: false }

    render(
      <AssetClassEditor
        assetClass={'stocks' as AssetClass}
        name="Aktien (ETF)"
        description="Globale Aktien-ETFs"
        config={disabledConfig}
        onChange={mockOnChange}
      />,
    )

    // Name and description should still be visible
    expect(screen.getByText('Aktien (ETF)')).toBeInTheDocument()
    expect(screen.getByText('Globale Aktien-ETFs')).toBeInTheDocument()

    // Controls should not be visible
    expect(screen.queryByText(/Zielallokation:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Erwartete Rendite:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Volatilität:/)).not.toBeInTheDocument()
  })

  it('should call onChange when enabling/disabling', async () => {
    const user = userEvent.setup()

    render(
      <AssetClassEditor
        assetClass={'stocks' as AssetClass}
        name="Aktien (ETF)"
        description="Globale Aktien-ETFs"
        config={defaultConfig}
        onChange={mockOnChange}
      />,
    )

    // Find and click the switch to disable
    const switchButton = screen.getByRole('switch')
    await user.click(switchButton)

    // Check that onChange was called with the correct parameters
    expect(mockOnChange).toHaveBeenCalledWith('stocks', { enabled: false })
  })

  it('should display correct styling for enabled vs disabled state', () => {
    const { container: enabledContainer } = render(
      <AssetClassEditor
        assetClass={'stocks' as AssetClass}
        name="Aktien (ETF)"
        description="Globale Aktien-ETFs"
        config={defaultConfig}
        onChange={mockOnChange}
      />,
    )

    // Enabled should have blue border
    const enabledDiv = enabledContainer.querySelector('.border-blue-200')
    expect(enabledDiv).toBeInTheDocument()

    const { container: disabledContainer } = render(
      <AssetClassEditor
        assetClass={'bonds' as AssetClass}
        name="Anleihen"
        description="Staatsanleihen"
        config={{ ...defaultConfig, enabled: false }}
        onChange={mockOnChange}
      />,
    )

    // Disabled should have gray border
    const disabledDiv = disabledContainer.querySelector('.border-gray-200')
    expect(disabledDiv).toBeInTheDocument()
  })
})
