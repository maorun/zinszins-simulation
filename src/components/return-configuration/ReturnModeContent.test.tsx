/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReturnModeContent from './ReturnModeContent'
import { SimulationProvider } from '../../contexts/SimulationContext'
import { createDefaultMultiAssetConfig } from '../../../helpers/multi-asset-portfolio'

describe('ReturnModeContent', () => {
  const mockMultiAssetConfig = createDefaultMultiAssetConfig()

  it('renders FixedReturnConfiguration when returnMode is fixed', () => {
    render(
      <SimulationProvider>
        <ReturnModeContent
          returnMode="fixed"
          multiAssetConfig={mockMultiAssetConfig}
          onMultiAssetConfigChange={vi.fn()}
        />
      </SimulationProvider>,
    )

    // FixedReturnConfiguration has a unique label
    expect(screen.getByText('Feste Rendite')).toBeInTheDocument()
  })

  it('renders RandomReturnConfiguration when returnMode is random', () => {
    render(
      <SimulationProvider>
        <ReturnModeContent
          returnMode="random"
          multiAssetConfig={mockMultiAssetConfig}
          onMultiAssetConfigChange={vi.fn()}
        />
      </SimulationProvider>,
    )

    // RandomReturnConfiguration has unique labels
    expect(screen.getByText('Durchschnittliche Rendite')).toBeInTheDocument()
  })

  it('renders VariableReturnConfiguration when returnMode is variable', () => {
    render(
      <SimulationProvider>
        <ReturnModeContent
          returnMode="variable"
          multiAssetConfig={mockMultiAssetConfig}
          onMultiAssetConfigChange={vi.fn()}
        />
      </SimulationProvider>,
    )

    // VariableReturnConfiguration has unique labels
    expect(screen.getByText('Variable Renditen pro Jahr')).toBeInTheDocument()
  })

  it('renders MultiAssetPortfolioConfiguration when returnMode is multiasset', () => {
    render(
      <SimulationProvider>
        <ReturnModeContent
          returnMode="multiasset"
          multiAssetConfig={mockMultiAssetConfig}
          onMultiAssetConfigChange={vi.fn()}
        />
      </SimulationProvider>,
    )

    // MultiAssetPortfolioConfiguration has unique content
    expect(screen.getByText('Multi-Asset Portfolio')).toBeInTheDocument()
  })
})
