import { useEffect } from 'react'
import type { CareCostConfiguration } from '../../../../helpers/care-cost-simulation'

export function useCareCostSync(
  planningMode: 'individual' | 'couple',
  careCostConfiguration: CareCostConfiguration,
  setCareCostConfiguration: (updater: (prevConfig: CareCostConfiguration) => CareCostConfiguration) => void,
) {
  useEffect(() => {
    if (careCostConfiguration.planningMode !== planningMode) {
      setCareCostConfiguration((prevConfig) => ({
        ...prevConfig,
        planningMode,
        coupleConfig: planningMode === 'individual' ? undefined : prevConfig.coupleConfig,
      }))
    }
  }, [planningMode, careCostConfiguration.planningMode, setCareCostConfiguration])
}
