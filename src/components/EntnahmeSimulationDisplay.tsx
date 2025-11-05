import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy } from '../utils/config-storage'
import { WithdrawalComparisonDisplay } from './WithdrawalComparisonDisplay'
import { SegmentedWithdrawalComparisonDisplay } from './SegmentedWithdrawalComparisonDisplay'
import InteractiveChart from './InteractiveChart'
import { convertWithdrawalResultToSimulationResult, hasWithdrawalInflationAdjustedValues } from '../utils/chart-data-converter'
import { WithdrawalYearCard } from './WithdrawalYearCard'
import { WithdrawalStrategySummary } from './WithdrawalStrategySummary'
import { formatDuration } from '../utils/duration-formatter'

// Type for segmented comparison results
type SegmentedComparisonResult = {
  strategy: SegmentedComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
  result: WithdrawalResult // Full withdrawal result for detailed analysis
}

// Type for comparison results
type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

// Type for withdrawal row data in the array
// This is a looser type to accommodate various withdrawal configurations
type WithdrawalRowData = Record<string, unknown> & {
  year: number
  startkapital: number
  endkapital: number
  entnahme: number
  zinsen: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
}

interface EntnahmeSimulationDisplayProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: WithdrawalRowData[]
    withdrawalResult: WithdrawalResult
    duration: number | null
  } | null
  formValue: WithdrawalFormValue
  useComparisonMode: boolean
  comparisonResults: ComparisonResult[]
  useSegmentedComparisonMode?: boolean
  segmentedComparisonResults?: SegmentedComparisonResult[]
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}

function NoDataMessage() {
  return (
    <div>
      <p>
        Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne
        definiert sind und eine Simulation durchgeführt wurde.
      </p>
    </div>
  )
}

function SimulationHeader({ withdrawalData, formValue }: {
  withdrawalData: EntnahmeSimulationDisplayProps['withdrawalData']
  formValue: WithdrawalFormValue
}) {
  if (!withdrawalData) return null

  return (
    <div className="mb-5">
      <h4>Entnahme-Simulation</h4>
      <WithdrawalStrategySummary
        startingCapital={withdrawalData.startingCapital}
        formValue={formValue}
      />
      <p>
        <strong>Vermögen reicht für:</strong>
        {' '}
        {formatDuration(withdrawalData.duration)}
      </p>
    </div>
  )
}

function SimulationChart({ withdrawalResult }: { withdrawalResult: WithdrawalResult }) {
  if (!withdrawalResult || Object.keys(withdrawalResult).length === 0) return null

  return (
    <div className="mb-6">
      <InteractiveChart
        simulationData={convertWithdrawalResultToSimulationResult(withdrawalResult)}
        showRealValues={hasWithdrawalInflationAdjustedValues(withdrawalResult)}
        className="mb-4"
      />
    </div>
  )
}

function WithdrawalYearCards({ withdrawalData, formValue, onCalculationInfoClick }: {
  withdrawalData: NonNullable<EntnahmeSimulationDisplayProps['withdrawalData']>
  formValue: WithdrawalFormValue
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}) {
  const allYears = withdrawalData.withdrawalArray.map(row => row.year).filter(year => year != null)

  return (
    <div className="flex flex-col gap-4">
      {withdrawalData.withdrawalArray.map((rowData, index) => (
        <WithdrawalYearCard
          key={index}
          rowData={rowData}
          formValue={formValue}
          allYears={allYears}
          onCalculationInfoClick={onCalculationInfoClick}
        />
      ))}
    </div>
  )
}

export function EntnahmeSimulationDisplay({
  withdrawalData,
  formValue,
  useComparisonMode,
  comparisonResults,
  useSegmentedComparisonMode = false,
  segmentedComparisonResults = [],
  onCalculationInfoClick,
}: EntnahmeSimulationDisplayProps) {
  if (!withdrawalData) {
    return <NoDataMessage />
  }

  if (useSegmentedComparisonMode) {
    return (
      <SegmentedWithdrawalComparisonDisplay
        withdrawalData={withdrawalData}
        segmentedComparisonResults={segmentedComparisonResults}
      />
    )
  }

  if (useComparisonMode) {
    return (
      <WithdrawalComparisonDisplay
        withdrawalData={withdrawalData}
        formValue={formValue}
        comparisonResults={comparisonResults}
      />
    )
  }

  return (
    <div>
      <SimulationHeader withdrawalData={withdrawalData} formValue={formValue} />
      <SimulationChart withdrawalResult={withdrawalData.withdrawalResult} />
      <WithdrawalYearCards
        withdrawalData={withdrawalData}
        formValue={formValue}
        onCalculationInfoClick={onCalculationInfoClick}
      />
    </div>
  )
}
