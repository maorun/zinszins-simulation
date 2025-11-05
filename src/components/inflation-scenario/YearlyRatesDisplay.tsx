interface YearlyRatesDisplayProps {
  yearlyRates: Record<number, number>
  formatPercent: (value: number) => string
  label: string
}

/**
 * Component to display yearly rates (inflation or return modifiers) in a grid
 */
export const YearlyRatesDisplay = ({
  yearlyRates,
  formatPercent,
  label,
}: YearlyRatesDisplayProps) => {
  const years = Object.keys(yearlyRates).map(Number).sort((a, b) => a - b)

  return (
    <div>
      <strong>{label}</strong>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {years.map((yearOffset) => {
          const rate = yearlyRates[yearOffset]
          return (
            <div key={yearOffset} className="text-xs">
              Jahr
              {' '}
              {yearOffset + 1}
              :
              {' '}
              {formatPercent(rate ?? 0)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
