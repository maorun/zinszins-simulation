import { formatCurrency } from '../utils/currency'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalFormValue, ComparisonStrategy } from '../utils/config-storage'
import { useComparisonData } from '../hooks/useComparisonData'
import { ComparisonMetrics } from './ComparisonMetrics'
import { ComparisonTable } from './ComparisonTable'

// Type for comparison results
type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

// Type for withdrawal array elements (year-indexed object with withdrawal result data)
// Using a flexible type that allows dynamic properties
type WithdrawalArrayElement = {
  endkapital?: number
  entnahme?: number
  jahr?: number
  year?: number
  [key: string]: unknown
}

interface WithdrawalComparisonDisplayProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: WithdrawalArrayElement[]
    withdrawalResult: WithdrawalResult
    duration: number | null
  }
  formValue: WithdrawalFormValue
  comparisonResults: ComparisonResult[]
}

export function WithdrawalComparisonDisplay({
  withdrawalData,
  formValue,
  comparisonResults,
}: WithdrawalComparisonDisplayProps) {
  // Use custom hook for data preparation
  const { baseStrategyData } = useComparisonData({ withdrawalData, formValue })

  return (
    <div>
      <h4>Strategien-Vergleich</h4>
      <p>
        <strong>Startkapital bei Entnahme:</strong>
        {' '}
        {formatCurrency(withdrawalData.startingCapital)}
      </p>

      {/* Base strategy summary */}
      <ComparisonMetrics
        displayName={baseStrategyData.displayName}
        rendite={baseStrategyData.rendite}
        endkapital={baseStrategyData.endkapital}
        duration={baseStrategyData.duration}
        withdrawalAmount={baseStrategyData.withdrawalAmount}
        withdrawalLabel={baseStrategyData.withdrawalLabel}
      />

      {/* Comparison strategies results */}
      <h5>🔍 Vergleichs-Strategien</h5>
      {comparisonResults.length > 0
        ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {comparisonResults.map(
                (result: ComparisonResult, _index: number) => (
                  <div
                    key={result.strategy.id}
                    style={{
                      border: '1px solid #e5e5ea',
                      borderRadius: '6px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h6 style={{ margin: '0 0 10px 0', color: '#666' }}>
                      {result.strategy.name}
                      {' '}
                      (
                      {result.strategy.rendite}
                      %
                      Rendite)
                    </h6>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                      'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '10px',
                        fontSize: '14px',
                      }}
                    >
                      <div>
                        <strong>Endkapital:</strong>
                        {' '}
                        {formatCurrency(result.finalCapital)}
                      </div>
                      <div>
                        <strong>Gesamt-Entnahme:</strong>
                        {' '}
                        {formatCurrency(result.totalWithdrawal)}
                      </div>
                      <div>
                        <strong>Ø Jährlich:</strong>
                        {' '}
                        {formatCurrency(result.averageAnnualWithdrawal)}
                      </div>
                      <div>
                        <strong>Dauer:</strong>
                        {' '}
                        {typeof result.duration === 'number'
                          ? `${result.duration} Jahre`
                          : result.duration}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )
        : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Keine Vergleichs-Strategien konfiguriert. Fügen Sie
              Strategien über den Konfigurationsbereich hinzu.
            </p>
          )}

      {/* Comparison summary table */}
      <ComparisonTable
        baseStrategyName={baseStrategyData.displayName}
        baseStrategyRendite={baseStrategyData.rendite}
        baseStrategyEndkapital={baseStrategyData.endkapital}
        baseStrategyAverageWithdrawal={baseStrategyData.averageAnnualWithdrawal}
        baseStrategyDuration={baseStrategyData.durationYears}
        comparisonResults={comparisonResults}
      />
    </div>
  )
}
