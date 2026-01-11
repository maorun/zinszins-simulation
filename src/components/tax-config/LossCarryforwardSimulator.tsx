import { useState } from 'react'
import {
  compareStrategies,
  calculateOptimalTiming,
  validateSimulatorConfig,
  type LossCarryforwardSimulatorConfig,
  type LossRealizationStrategy,
  type ScenarioComparisonResult,
  type OptimalTimingRecommendation,
} from '../../../helpers/loss-carryforward-simulator'
import { LossSimulatorConfiguration } from './LossSimulatorConfiguration'
import { StrategyComparisonDisplay } from './StrategyComparisonDisplay'
import { OptimalTimingDisplay } from './OptimalTimingDisplay'
import { TimelineVisualization } from './TimelineVisualization'

/**
 * Props for LossCarryforwardSimulator component
 */
interface LossCarryforwardSimulatorProps {
  /** Current year for simulation start */
  currentYear: number
  /** Tax rate for calculations */
  taxRate: number
}

/**
 * Extended Loss Carryforward Strategy Simulator Component
 *
 * Provides comprehensive multi-year planning for loss carryforward
 * with strategy comparison and optimization recommendations.
 */
export function LossCarryforwardSimulator({ currentYear, taxRate }: LossCarryforwardSimulatorProps) {
  const [stockLosses, setStockLosses] = useState<number>(10000)
  const [otherLosses, setOtherLosses] = useState<number>(5000)
  const [planningYears, setPlanningYears] = useState<number>(5)
  const [maxStockGains, setMaxStockGains] = useState<number>(15000)
  const [maxOtherGains, setMaxOtherGains] = useState<number>(8000)
  const [comparisonResult, setComparisonResult] = useState<ScenarioComparisonResult | null>(null)
  const [timingRecommendations, setTimingRecommendations] = useState<OptimalTimingRecommendation[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const handleRunSimulation = () => {
    const config = buildSimulatorConfig({ stockLosses, otherLosses, planningYears, maxStockGains, maxOtherGains, currentYear, taxRate })
    const errors = validateSimulatorConfig({ ...config, strategy: 'optimized' as LossRealizationStrategy })
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors([])
    setComparisonResult(compareStrategies(config, ['immediate', 'gradual', 'optimized', 'aggressive', 'conservative']))
    setTimingRecommendations(calculateOptimalTiming(config))
  }
  return (
    <div className="space-y-6">
      <LossSimulatorConfiguration
        stockLosses={stockLosses}
        otherLosses={otherLosses}
        planningYears={planningYears}
        maxStockGains={maxStockGains}
        maxOtherGains={maxOtherGains}
        currentYear={currentYear}
        validationErrors={validationErrors}
        onStockLossesChange={setStockLosses}
        onOtherLossesChange={setOtherLosses}
        onPlanningYearsChange={setPlanningYears}
        onMaxStockGainsChange={setMaxStockGains}
        onMaxOtherGainsChange={setMaxOtherGains}
        onRunSimulation={handleRunSimulation}
      />
      <SimulationResults
        comparisonResult={comparisonResult}
        timingRecommendations={timingRecommendations}
        planningYears={planningYears}
      />
    </div>
  )
}

function SimulationResults({
  comparisonResult,
  timingRecommendations,
  planningYears,
}: {
  comparisonResult: ScenarioComparisonResult | null
  timingRecommendations: OptimalTimingRecommendation[]
  planningYears: number
}) {
  if (!comparisonResult) return null

  return (
    <>
      <StrategyComparisonDisplay comparisonResult={comparisonResult} planningYears={planningYears} />
      <OptimalTimingDisplay timingRecommendations={timingRecommendations} />
      <TimelineVisualization scenario={comparisonResult.recommendedScenario} />
    </>
  )
}

function buildSimulatorConfig({
  stockLosses,
  otherLosses,
  planningYears,
  maxStockGains,
  maxOtherGains,
  currentYear,
  taxRate,
}: {
  stockLosses: number
  otherLosses: number
  planningYears: number
  maxStockGains: number
  maxOtherGains: number
  currentYear: number
  taxRate: number
}): Omit<LossCarryforwardSimulatorConfig, 'strategy'> {
  const startYear = currentYear
  const endYear = currentYear + planningYears - 1
  const projectedMaxGains: Record<number, { stockGains: number; otherGains: number }> = {}

  for (let year = startYear; year <= endYear; year++) {
    projectedMaxGains[year] = { stockGains: maxStockGains, otherGains: maxOtherGains }
  }

  return {
    initialLosses: { stockLosses, otherLosses, year: startYear },
    projectedRealizedLosses: {},
    projectedMaxGains,
    taxRate,
    startYear,
    endYear,
  }
}
