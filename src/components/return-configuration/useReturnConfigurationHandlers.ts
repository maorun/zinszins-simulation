import { useCallback } from 'react'
import type { ReturnMode } from '../../utils/random-returns'
import type { MultiAssetPortfolioConfig } from '../../../helpers/multi-asset-portfolio'

interface UseReturnConfigurationHandlersParams {
  setReturnMode: (mode: ReturnMode) => void
  setInflationAktivSparphase: (active: boolean) => void
  setInflationsrateSparphase: (rate: number) => void
  setInflationAnwendungSparphase: (mode: 'sparplan' | 'gesamtmenge') => void
  setMultiAssetConfig: (config: MultiAssetPortfolioConfig) => void
  performSimulation: () => void
}

/**
 * Creates a handler that updates state and performs simulation
 */
function createHandler<T>(setter: (value: T) => void, performSimulation: () => void) {
  return (value: T) => {
    setter(value)
    performSimulation()
  }
}

export const useReturnConfigurationHandlers = ({
  setReturnMode,
  setInflationAktivSparphase,
  setInflationsrateSparphase,
  setInflationAnwendungSparphase,
  setMultiAssetConfig,
  performSimulation,
}: UseReturnConfigurationHandlersParams) => {
  const handleReturnModeChange = useCallback(
    createHandler(setReturnMode, performSimulation),
    [setReturnMode, performSimulation],
  )

  const handleInflationAktivChange = useCallback(
    createHandler(setInflationAktivSparphase, performSimulation),
    [setInflationAktivSparphase, performSimulation],
  )

  const handleInflationsrateChange = useCallback(
    createHandler(setInflationsrateSparphase, performSimulation),
    [setInflationsrateSparphase, performSimulation],
  )

  const handleInflationAnwendungChange = useCallback(
    createHandler(setInflationAnwendungSparphase, performSimulation),
    [setInflationAnwendungSparphase, performSimulation],
  )

  const handleMultiAssetConfigChange = useCallback(
    createHandler(setMultiAssetConfig, performSimulation),
    [setMultiAssetConfig, performSimulation],
  )

  return {
    handleReturnModeChange,
    handleInflationAktivChange,
    handleInflationsrateChange,
    handleInflationAnwendungChange,
    handleMultiAssetConfigChange,
  }
}
