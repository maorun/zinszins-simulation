interface ScenarioStatisticsProps {
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
  duration: number
  formatPercent: (value: number) => string
}

/**
 * Component to display scenario statistics (cumulative inflation, average, purchasing power)
 */
export const ScenarioStatistics = ({
  cumulativeInflation,
  averageInflation,
  purchasingPowerImpact,
  duration,
  formatPercent,
}: ScenarioStatisticsProps) => {
  return (
    <>
      {cumulativeInflation !== null && (
        <p>
          <strong>Kumulative Inflation:</strong>
          {' '}
          {formatPercent(cumulativeInflation)}
        </p>
      )}

      {averageInflation !== null && (
        <p>
          <strong>Durchschnittliche jährliche Inflation:</strong>
          {' '}
          {formatPercent(averageInflation)}
        </p>
      )}

      {purchasingPowerImpact !== null && (
        <p>
          <strong>Kaufkraftverlust:</strong>
          {' '}
          100.000 € haben nach
          {' '}
          {duration}
          {' '}
          Jahren eine reale Kaufkraft von ca.
          {' '}
          {purchasingPowerImpact.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          {' '}
          €
        </p>
      )}
    </>
  )
}
