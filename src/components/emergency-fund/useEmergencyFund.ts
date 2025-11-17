import { useCallback, useMemo } from 'react'
import { useSimulation } from '../../contexts/useSimulation'
import {
  calculateEmergencyFundStatus,
  getRecommendedMonths,
  type EmploymentType,
  type ReserveStrategy,
  type EmergencyFundConfig,
} from '../../../helpers/emergency-fund'

function useComputedValues(emergencyFundConfig: EmergencyFundConfig, simulationData: unknown) {
  const currentCapital = useMemo(() => {
    const data = simulationData as { data?: Array<{ gesamtkapitalNachSteuern?: number }> }
    if (!data?.data || data.data.length === 0) return 0
    const lastEntry = data.data[data.data.length - 1]
    return lastEntry?.gesamtkapitalNachSteuern || 0
  }, [simulationData])

  const fundStatus = useMemo(
    () => calculateEmergencyFundStatus(currentCapital, emergencyFundConfig),
    [currentCapital, emergencyFundConfig],
  )

  const recommendedMonths = useMemo(
    () => getRecommendedMonths(emergencyFundConfig.employmentType, emergencyFundConfig.reserveStrategy),
    [emergencyFundConfig.employmentType, emergencyFundConfig.reserveStrategy],
  )

  return { currentCapital, fundStatus, recommendedMonths }
}

/**
 * Custom hook for emergency fund logic
 * Handles all state management and calculations for emergency fund planning
 */
export function useEmergencyFund() {
  const { emergencyFundConfig, setEmergencyFundConfig, simulationData } = useSimulation()
  const { currentCapital, fundStatus, recommendedMonths } = useComputedValues(emergencyFundConfig, simulationData)

  const updateConfig = useCallback(
    (updates: Partial<EmergencyFundConfig>) => {
      setEmergencyFundConfig({ ...emergencyFundConfig, ...updates })
    },
    [emergencyFundConfig, setEmergencyFundConfig],
  )

  const handleToggleEnabled = useCallback((checked: boolean) => updateConfig({ enabled: checked }), [updateConfig])
  const handleMonthlyExpensesChange = useCallback(
    (value: number[]) => updateConfig({ monthlyExpenses: value[0] }),
    [updateConfig],
  )
  const handleTargetMonthsChange = useCallback(
    (value: number[]) => updateConfig({ targetMonths: value[0] }),
    [updateConfig],
  )
  const handleEmploymentTypeChange = useCallback(
    (value: string) => updateConfig({ employmentType: value as EmploymentType }),
    [updateConfig],
  )
  const handleReserveStrategyChange = useCallback(
    (value: string) => updateConfig({ reserveStrategy: value as ReserveStrategy }),
    [updateConfig],
  )
  const handleExcludeFromInvestmentChange = useCallback(
    (checked: boolean) => updateConfig({ excludeFromInvestment: checked }),
    [updateConfig],
  )

  return {
    config: emergencyFundConfig,
    fundStatus,
    currentCapital,
    recommendedMonths,
    handleToggleEnabled,
    handleMonthlyExpensesChange,
    handleTargetMonthsChange,
    handleEmploymentTypeChange,
    handleReserveStrategyChange,
    handleExcludeFromInvestmentChange,
  }
}
