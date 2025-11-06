import { useState, useMemo } from 'react'
import {
  getAvailableInflationScenarios,
  applyInflationScenario,
  applyReturnModifiers,
  calculateCumulativeInflation,
  calculateAverageInflation,
  calculatePurchasingPowerImpact,
  type InflationScenarioId,
  type InflationScenario,
} from '../../../helpers/inflation-scenarios'
import { generateFormId } from '../../utils/unique-id'

interface UseInflationScenarioLogicParams {
  simulationStartYear: number
  onScenarioChange?: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void
}

interface UseInflationScenarioStateParams {
  simulationStartYear: number
}

const useInflationScenarioState = ({ simulationStartYear }: UseInflationScenarioStateParams) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<InflationScenarioId | 'none'>('none')
  const [scenarioYear, setScenarioYear] = useState(simulationStartYear + 5)

  const enabledRadioId = useMemo(() => generateFormId('inflation-scenario', 'enabled'), [])
  const disabledRadioId = useMemo(() => generateFormId('inflation-scenario', 'disabled'), [])
  const scenarioYearSliderId = useMemo(() => generateFormId('inflation-scenario', 'year'), [])

  return {
    isEnabled,
    setIsEnabled,
    selectedScenarioId,
    setSelectedScenarioId,
    scenarioYear,
    setScenarioYear,
    enabledRadioId,
    disabledRadioId,
    scenarioYearSliderId,
  }
}

const useScenarioData = (selectedScenarioId: InflationScenarioId | 'none') => {
  const availableScenarios = useMemo(() => getAvailableInflationScenarios(), [])

  const selectedScenario = useMemo(() => {
    if (selectedScenarioId === 'none') return null
    return availableScenarios.find(s => s.id === selectedScenarioId) || null
  }, [selectedScenarioId, availableScenarios])

  const cumulativeInflation = useMemo(
    () => (selectedScenario ? calculateCumulativeInflation(selectedScenario) : null),
    [selectedScenario],
  )

  const averageInflation = useMemo(
    () => (selectedScenario ? calculateAverageInflation(selectedScenario) : null),
    [selectedScenario],
  )

  const purchasingPowerImpact = useMemo(
    () => (selectedScenario ? calculatePurchasingPowerImpact(selectedScenario, 100000) : null),
    [selectedScenario],
  )

  return {
    availableScenarios,
    selectedScenario,
    cumulativeInflation,
    averageInflation,
    purchasingPowerImpact,
  }
}

const createChangeNotifier = (
  onScenarioChange?: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void,
) => {
  return (scenario: InflationScenario | null, year: number, enabled: boolean) => {
    if (!enabled || !scenario) {
      onScenarioChange?.(null, null, '')
    } else {
      const inflationRates = applyInflationScenario(year, scenario)
      const returnModifiers = applyReturnModifiers(year, scenario)
      onScenarioChange?.(inflationRates, returnModifiers, scenario.name)
    }
  }
}

/**
 * Custom hook to manage inflation scenario state and logic
 */
export const useInflationScenarioLogic = ({
  simulationStartYear,
  onScenarioChange,
}: UseInflationScenarioLogicParams) => {
  const state = useInflationScenarioState({ simulationStartYear })
  const data = useScenarioData(state.selectedScenarioId)
  const notifyChange = createChangeNotifier(onScenarioChange)

  const handleEnabledChange = (value: string) => {
    const enabled = value === 'enabled'
    state.setIsEnabled(enabled)
    notifyChange(data.selectedScenario, state.scenarioYear, enabled)
  }

  const handleScenarioChange = (scenarioId: InflationScenarioId) => {
    state.setSelectedScenarioId(scenarioId)
    const scenario = data.availableScenarios.find(s => s.id === scenarioId)
    if (scenario) {
      notifyChange(scenario, state.scenarioYear, state.isEnabled)
    }
  }

  const handleYearChange = (year: number) => {
    state.setScenarioYear(year)
    notifyChange(data.selectedScenario, year, state.isEnabled)
  }

  return {
    ...state,
    ...data,
    handleEnabledChange,
    handleScenarioChange,
    handleYearChange,
  }
}
