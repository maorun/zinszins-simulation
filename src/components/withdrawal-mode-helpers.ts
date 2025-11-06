import { createDefaultWithdrawalSegment, type WithdrawalSegment } from '../utils/segmented-withdrawal'

interface HandleModeChangeParams {
  mode: string
  withdrawalSegments: WithdrawalSegment[]
  startOfIndependence: number
  globalEndOfLife: number
  updateConfig: (updates: Record<string, unknown>) => void
}

export function handleWithdrawalModeChange(params: HandleModeChangeParams): void {
  const { mode, withdrawalSegments, startOfIndependence, globalEndOfLife, updateConfig } = params

  const useComparison = mode === 'comparison'
  const useSegmented = mode === 'segmented'
  const useSegmentedComparison = mode === 'segmented-comparison'

  updateConfig({
    useComparisonMode: useComparison,
    useSegmentedWithdrawal: useSegmented,
    useSegmentedComparisonMode: useSegmentedComparison,
  })

  // Initialize segments when switching to segmented mode
  if (useSegmented && withdrawalSegments.length === 0) {
    initializeWithdrawalSegments({
      startOfIndependence,
      globalEndOfLife,
      updateConfig,
    })
  }
}

interface InitializeSegmentsParams {
  startOfIndependence: number
  globalEndOfLife: number
  updateConfig: (updates: Record<string, unknown>) => void
}

function initializeWithdrawalSegments(params: InitializeSegmentsParams): void {
  const { startOfIndependence, globalEndOfLife, updateConfig } = params

  // Create initial segment covering only the first 15 years, leaving room for additional segments
  const withdrawalStartYear = startOfIndependence + 1
  // 15 years or until end of life
  const initialSegmentEndYear = Math.min(withdrawalStartYear + 14, globalEndOfLife)
  const defaultSegment = createDefaultWithdrawalSegment('main', 'Frühphase', withdrawalStartYear, initialSegmentEndYear)
  updateConfig({ withdrawalSegments: [defaultSegment] })
}

interface CreateComparisonStrategyParams {
  comparisonStrategies: unknown[]
  updateConfig: (updates: Record<string, unknown>) => void
}

export function handleAddComparisonStrategy(params: CreateComparisonStrategyParams): void {
  const { comparisonStrategies, updateConfig } = params

  const newId = `strategy${Date.now()}`
  const newStrategy = {
    id: newId,
    name: '3% Regel',
    strategie: '3prozent',
    rendite: 5,
  }

  updateConfig({
    comparisonStrategies: [...comparisonStrategies, newStrategy],
  })
}

interface RemoveComparisonStrategyParams {
  id: string
  comparisonStrategies: Array<{ id: string }>
  updateConfig: (updates: Record<string, unknown>) => void
}

export function handleRemoveComparisonStrategy(params: RemoveComparisonStrategyParams): void {
  const { id, comparisonStrategies, updateConfig } = params

  updateConfig({
    comparisonStrategies: comparisonStrategies.filter((s) => s.id !== id),
  })
}
