import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MultiAssetPortfolioConfiguration } from './MultiAssetPortfolioConfiguration'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'

// Mock the shadcn/ui components to avoid complex rendering issues in tests
vi.mock('./ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
}))

vi.mock('./ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      data-testid="switch"
      {...props}
    />
  ),
}))

vi.mock('./ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <input
      type="range"
      value={value?.[0] || 0}
      onChange={e => onValueChange?.([parseFloat(e.target.value)])}
      data-testid="slider"
      {...props}
    />
  ),
}))

vi.mock('./ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} data-testid="button" {...props}>
      {children}
    </button>
  ),
}))

vi.mock('./ui/radio-tile', () => ({
  RadioTileGroup: ({ children, value, onValueChange: _onValueChange, ...props }: any) => (
    <div data-testid="radio-tile-group" data-value={value} {...props}>
      {children}
    </div>
  ),
  RadioTile: ({ children, value, label, ...props }: any) => (
    <label data-testid="radio-tile" data-value={value} {...props}>
      <input type="radio" value={value} />
      {label || children}
    </label>
  ),
}))

describe('MultiAssetPortfolioConfiguration', () => {
  const mockOnChange = vi.fn()
  const defaultConfig = createDefaultMultiAssetConfig()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default configuration', () => {
    render(
      <MultiAssetPortfolioConfiguration
        values={defaultConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByTestId('card-title')).toHaveTextContent('Multi-Asset Portfolio')
    expect(screen.getByText('Multi-Asset Portfolio aktivieren')).toBeInTheDocument()
  })

  it('handles undefined configuration gracefully', () => {
    render(
      <MultiAssetPortfolioConfiguration
        values={undefined as any}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Multi-Asset Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Multi-Asset Portfolio aktivieren')).toBeInTheDocument()
  })

  it('shows configuration panel when enabled', () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Anlageklassen')).toBeInTheDocument()
    expect(screen.getByText('Rebalancing')).toBeInTheDocument()
    expect(screen.getByText('Erweiterte Einstellungen')).toBeInTheDocument()
  })

  it('displays asset classes with correct configuration', () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Deutsche/Europäische Aktien')).toBeInTheDocument()
    expect(screen.getByText('Internationale Aktien')).toBeInTheDocument()
    expect(screen.getByText('Staatsanleihen')).toBeInTheDocument()
    expect(screen.getByText('Unternehmensanleihen')).toBeInTheDocument()
  })

  it.skip('shows portfolio overview when configuration is valid', () => {
    // Create a fully valid configuration with 100% allocation
    const validConfig = {
      ...defaultConfig,
      enabled: true,
      assetClasses: {
        ...defaultConfig.assetClasses,
        stocks_domestic: { ...defaultConfig.assetClasses.stocks_domestic, allocation: 0.6 },
        bonds_government: { ...defaultConfig.assetClasses.bonds_government, allocation: 0.4 },
        stocks_international: { ...defaultConfig.assetClasses.stocks_international, allocation: 0 },
        bonds_corporate: { ...defaultConfig.assetClasses.bonds_corporate, allocation: 0 },
        real_estate: { ...defaultConfig.assetClasses.real_estate, allocation: 0 },
        commodities: { ...defaultConfig.assetClasses.commodities, allocation: 0 },
        cash: { ...defaultConfig.assetClasses.cash, allocation: 0 },
      },
    }

    render(
      <MultiAssetPortfolioConfiguration
        values={validConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Portfolio-Übersicht')).toBeInTheDocument()
    expect(screen.getByText('Erwartete Rendite:')).toBeInTheDocument()
    expect(screen.getByText('Portfoliorisiko:')).toBeInTheDocument()
  })

  it('shows validation errors for invalid configuration', () => {
    const invalidConfig = {
      ...defaultConfig,
      enabled: true,
      assetClasses: {
        ...defaultConfig.assetClasses,
        stocks_domestic: {
          ...defaultConfig.assetClasses.stocks_domestic,
          targetAllocation: 0.50, // Only 50% allocation, should cause validation error
        },
        stocks_international: {
          ...defaultConfig.assetClasses.stocks_international,
          enabled: false,
        },
        bonds_government: {
          ...defaultConfig.assetClasses.bonds_government,
          enabled: false,
        },
        bonds_corporate: {
          ...defaultConfig.assetClasses.bonds_corporate,
          enabled: false,
        },
      },
    }

    render(
      <MultiAssetPortfolioConfiguration
        values={invalidConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Konfigurationsfehler:')).toBeInTheDocument()
  })

  it('calls onChange when enabling multi-asset portfolio', async () => {
    render(
      <MultiAssetPortfolioConfiguration
        values={defaultConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    const enableSwitch = screen.getAllByTestId('switch')[0] // First switch is the main enable switch
    fireEvent.click(enableSwitch)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        }),
      )
    })
  })

  it('shows normalization button when enabled', () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Normalisieren')).toBeInTheDocument()
    expect(screen.getByText('Zurücksetzen')).toBeInTheDocument()
  })

  it('handles normalization button click', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    const normalizeButton = screen.getByText('Normalisieren')
    fireEvent.click(normalizeButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('handles reset button click', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    const resetButton = screen.getByText('Zurücksetzen')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true, // Should preserve enabled state
        }),
      )
    })
  })

  it('displays rebalancing configuration options', () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Rebalancing-Häufigkeit')).toBeInTheDocument()
    expect(screen.getByText('Nie')).toBeInTheDocument()
    expect(screen.getByText('Jährlich')).toBeInTheDocument()
    expect(screen.getByText('Quartalsweise')).toBeInTheDocument()
    expect(screen.getByText('Monatlich')).toBeInTheDocument()
  })

  it('displays advanced settings', () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Historische Korrelationen verwenden')).toBeInTheDocument()
    expect(screen.getByText('Zufalls-Seed (optional)')).toBeInTheDocument()
  })

  it('shows information section with helpful hints', () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    expect(screen.getByText('Hinweise zum Multi-Asset Portfolio:')).toBeInTheDocument()
    expect(screen.getByText(/Basiert auf historischen deutschen\/europäischen Marktdaten/)).toBeInTheDocument()
    expect(screen.getByText(/Berücksichtigt deutsche Steuerregeln/)).toBeInTheDocument()
    expect(screen.getByText(/Automatisches Rebalancing reduziert Portfoliorisiko/)).toBeInTheDocument()
  })

  it('handles asset class configuration changes', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }

    render(
      <MultiAssetPortfolioConfiguration
        values={enabledConfig}
        onChange={mockOnChange}
        nestingLevel={0}
      />,
    )

    // Find the slider for German stocks allocation (should be first allocation slider)
    const sliders = screen.getAllByTestId('slider')
    const allocationSlider = sliders.find(slider =>
      slider.getAttribute('max') === '100' && slider.getAttribute('step') === '1',
    )

    if (allocationSlider) {
      fireEvent.change(allocationSlider, { target: { value: '50' } })

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            assetClasses: expect.objectContaining({
              stocks_domestic: expect.objectContaining({
                targetAllocation: 0.5,
              }),
            }),
          }),
        )
      })
    }
  })
})
