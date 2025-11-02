import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SegmentReturnConfigRenderer } from './SegmentReturnConfigRenderer'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { ReturnConfiguration } from '../../helpers/random-returns'

// Mock child components
vi.mock('./SegmentFixedReturnConfig', () => ({
  SegmentFixedReturnConfig: ({ fixedRate }: { fixedRate: number }) => (
    <div data-testid="fixed-config">
      Fixed Rate:
      {fixedRate}
    </div>
  ),
}))

vi.mock('./SegmentRandomReturnConfig', () => ({
  SegmentRandomReturnConfig: ({ segmentId }: { segmentId: string }) => (
    <div data-testid="random-config">
      Segment:
      {segmentId}
    </div>
  ),
}))

vi.mock('./SegmentVariableReturnConfig', () => ({
  SegmentVariableReturnConfig: ({
    startYear,
    endYear,
  }: {
    startYear: number
    endYear: number
  }) => (
    <div data-testid="variable-config">
      {startYear}
      {' '}
      -
      {endYear}
    </div>
  ),
}))

vi.mock('./MultiAssetPortfolioConfiguration', () => ({
  MultiAssetPortfolioConfiguration: () => (
    <div data-testid="multiasset-config">Multi-Asset Portfolio</div>
  ),
}))

describe('SegmentReturnConfigRenderer', () => {
  const mockOnReturnConfigChange = vi.fn()

  it('renders fixed return configuration when mode is fixed', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'fixed',
      fixedRate: 0.05,
    }

    render(
      <SegmentReturnConfigRenderer
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('fixed-config')).toBeInTheDocument()
    expect(screen.getByText(/Fixed Rate:/)).toBeInTheDocument()
  })

  it('renders random return configuration when mode is random', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'random',
      randomConfig: {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: undefined,
      },
    }

    render(
      <SegmentReturnConfigRenderer
        segmentId="segment-2"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('random-config')).toBeInTheDocument()
    expect(screen.getByText(/Segment:/)).toBeInTheDocument()
  })

  it('renders variable return configuration when mode is variable', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {},
      },
    }

    render(
      <SegmentReturnConfigRenderer
        segmentId="segment-3"
        startYear={2025}
        endYear={2045}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('variable-config')).toBeInTheDocument()
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('renders multiasset portfolio configuration when mode is multiasset', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'multiasset',
      multiAssetConfig: createDefaultMultiAssetConfig(),
    }

    render(
      <SegmentReturnConfigRenderer
        segmentId="segment-4"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.getByTestId('multiasset-config')).toBeInTheDocument()
    expect(screen.getByText('Multi-Asset Portfolio')).toBeInTheDocument()
  })

  it('does not render configurations for other modes', () => {
    const returnConfig: ReturnConfiguration = {
      mode: 'fixed',
      fixedRate: 0.05,
    }

    render(
      <SegmentReturnConfigRenderer
        segmentId="segment-1"
        startYear={2023}
        endYear={2040}
        returnConfig={returnConfig}
        onReturnConfigChange={mockOnReturnConfigChange}
      />,
    )

    expect(screen.queryByTestId('random-config')).not.toBeInTheDocument()
    expect(screen.queryByTestId('variable-config')).not.toBeInTheDocument()
    expect(screen.queryByTestId('multiasset-config')).not.toBeInTheDocument()
  })
})
