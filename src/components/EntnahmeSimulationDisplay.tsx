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
    return (
      <div>
        <p>
          Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne
          definiert sind und eine Simulation durchgeführt wurde.
        </p>
      </div>
    )
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

  // Regular single strategy simulation results
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
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

      {/* Interactive Chart for Withdrawal Phase */}
      {withdrawalData.withdrawalResult && Object.keys(withdrawalData.withdrawalResult).length > 0 && (
        <div className="mb-6">
          <InteractiveChart
            simulationData={convertWithdrawalResultToSimulationResult(withdrawalData.withdrawalResult)}
            showRealValues={hasWithdrawalInflationAdjustedValues(withdrawalData.withdrawalResult)}
            className="mb-4"
          />
        </div>
      )}

      {/* Card Layout for All Devices */}
      <div className="flex flex-col gap-4">
        {withdrawalData.withdrawalArray.map((rowData, index) => {
          const allYears = withdrawalData.withdrawalArray.map(row => row.year).filter(year => year != null)

          return (
            <WithdrawalYearCard
              key={index}
              rowData={rowData}
              formValue={formValue}
              allYears={allYears}
              onCalculationInfoClick={onCalculationInfoClick}
            />
          )
        })}
      </div>

    </div>
  )
}
