import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SegmentReturnConfiguration } from './SegmentReturnConfiguration'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { ReturnConfiguration } from '../utils/random-returns'

// Mock child components to keep tests focused
vi.mock('./SegmentFixedReturnConfig', () => ({
  SegmentFixedReturnConfig: () => <div data-testid="fixed-config">Fixed Config</div>,
}))

vi.mock('./SegmentRandomReturnConfig', () => ({
  SegmentRandomReturnConfig: () => <div data-testid="random-config">Random Config</div>,
}))

vi.mock('./SegmentVariableReturnConfig', () => ({
  SegmentVariableReturnConfig: () => (
    <div data-testid="variable-config">Variable Config</div>
  ),
}))

vi.mock('./MultiAssetPortfolioConfiguration', () => ({
  MultiAssetPortfolioConfiguration: () => (
    <div data-testid="multiasset-config">MultiAsset Config</div>
  ),
}))

describe('SegmentReturnConfiguration', () => {
  const mockOnReturnConfigChange = vi.fn()

  it('renders the component with fixed mode selected', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'fixed',
      fixedRate: 0.05,
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByText('Rendite-Modus')).toBeInTheDocument()
    expect(screen.getByTestId('fixed-config')).toBeInTheDocument()
  })

  it('switches to random mode when random tile is clicked', async () => {
    const user = userEvent.setup()
    const returnConfig: ReturnConfiguration = {
      mode: 'fixed',
      fixedRate: 0.05,
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    const randomTile = screen.getByText('Zufällige Rendite')
    await user.click(randomTile)

    expect(mockOnReturnConfigChange).toHaveBeenCalledWith({
      mode: 'random',
      randomConfig: {
        averageReturn: 0.05,
        standardDeviation: 0.12,
        seed: undefined,
      },
    })
  })

  it('switches to variable mode when variable tile is clicked', async () => {
    const user = userEvent.setup()
    const returnConfig: ReturnConfiguration = {
      mode: 'fixed',
      fixedRate: 0.05,
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    const variableTile = screen.getByText('Variable Rendite')
    await user.click(variableTile)

    expect(mockOnReturnConfigChange).toHaveBeenCalledWith({
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {},
      },
    })
  })

  it('switches to multiasset mode when multiasset tile is clicked', async () => {
    const user = userEvent.setup()
    const returnConfig: ReturnConfiguration = {
      mode: 'fixed',
      fixedRate: 0.05,
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    const multiassetTile = screen.getByText('Multi-Asset Portfolio')
    await user.click(multiassetTile)

    expect(mockOnReturnConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'multiasset',
        multiAssetConfig: expect.any(Object),
      }),
    )
  })

  it('preserves multiasset config when mode is multiasset', () => {
    const customConfig = createDefaultMultiAssetConfig()
    customConfig.enabled = true

    const returnConfig: ReturnConfiguration = {
      mode: 'multiasset',
      multiAssetConfig: customConfig,
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    // Verify it's in multiasset mode and displays the config
    expect(screen.getByTestId('multiasset-config')).toBeInTheDocument()
    const multiassetRadio = screen.getByRole('radio', { name: /Multi-Asset Portfolio/i })
    expect(multiassetRadio).toBeChecked()
  })

  it('renders random config when mode is random', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'random',
      randomConfig: {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: undefined,
      },
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('random-config')).toBeInTheDocument()
  })

  it('renders variable config when mode is variable', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {},
      },
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('variable-config')).toBeInTheDocument()
  })

  it('renders multiasset config when mode is multiasset', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'multiasset',
      multiAssetConfig: createDefaultMultiAssetConfig(),
    }

    render(
      <SegmentReturnConfiguration
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('multiasset-config')).toBeInTheDocument()
  })
})
