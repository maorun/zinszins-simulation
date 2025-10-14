import { useState } from 'react'
import type { WithdrawalResult } from '../../../../helpers/withdrawal'
import type { SimulationData } from '../../helpers/config-types'

export function useSimulationDataState() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [withdrawalResults, setWithdrawalResults] = useState<WithdrawalResult | null>(null)

  return {
    simulationData,
    setSimulationData,
    isLoading,
    setIsLoading,
    withdrawalResults,
    setWithdrawalResults,
  }
}
