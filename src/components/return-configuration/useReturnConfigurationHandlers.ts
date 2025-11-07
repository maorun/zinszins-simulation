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
 * Hook for return mode and inflation handlers
 */
function useReturnModeHandlers(
  setReturnMode: (mode: ReturnMode) => void,
  performSimulation: () => void,
) {
  const handleReturnModeChange = useCallback(
    (mode: ReturnMode) => {
      setReturnMode(mode)
      performSimulation()
    },
    [setReturnMode, performSimulation],
  )

  return { handleReturnModeChange }
}

/**
 * Hook for inflation configuration handlers
 */
function useInflationHandlers(
  setInflationAktivSparphase: (active: boolean) => void,
  setInflationsrateSparphase: (rate: number) => void,
  setInflationAnwendungSparphase: (mode: 'sparplan' | 'gesamtmenge') => void,
  performSimulation: () => void,
) {
  const handleInflationAktivChange = useCallback(
    (active: boolean) => {
      setInflationAktivSparphase(active)
      performSimulation()
    },
    [setInflationAktivSparphase, performSimulation],
  )

  const handleInflationsrateChange = useCallback(
    (rate: number) => {
      setInflationsrateSparphase(rate)
      performSimulation()
    },
    [setInflationsrateSparphase, performSimulation],
  )

  const handleInflationAnwendungChange = useCallback(
    (mode: 'sparplan' | 'gesamtmenge') => {
      setInflationAnwendungSparphase(mode)
      performSimulation()
    },
    [setInflationAnwendungSparphase, performSimulation],
  )

  return { handleInflationAktivChange, handleInflationsrateChange, handleInflationAnwendungChange }
}

export const useReturnConfigurationHandlers = ({
  setReturnMode,
  setInflationAktivSparphase,
  setInflationsrateSparphase,
  setInflationAnwendungSparphase,
  setMultiAssetConfig,
  performSimulation,
}: UseReturnConfigurationHandlersParams) => {
  const { handleReturnModeChange } = useReturnModeHandlers(setReturnMode, performSimulation)

  const { handleInflationAktivChange, handleInflationsrateChange, handleInflationAnwendungChange } =
    useInflationHandlers(
      setInflationAktivSparphase,
      setInflationsrateSparphase,
      setInflationAnwendungSparphase,
      performSimulation,
    )

  const handleMultiAssetConfigChange = useCallback(
    (config: MultiAssetPortfolioConfig) => {
      setMultiAssetConfig(config)
      performSimulation()
    },
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
