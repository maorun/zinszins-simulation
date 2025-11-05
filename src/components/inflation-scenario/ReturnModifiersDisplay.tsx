interface ReturnModifiersDisplayProps {
  yearlyReturnModifiers: Record<number, number>
  formatPercent: (value: number) => string
}

/**
 * Component to display yearly return modifiers for stagflation scenarios
 */
export const ReturnModifiersDisplay = ({
  yearlyReturnModifiers,
  formatPercent,
}: ReturnModifiersDisplayProps) => {
  return (
    <div>
      <strong>Rendite-Anpassungen (Stagflation):</strong>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {Object.entries(yearlyReturnModifiers).map(([yearOffset, modifier]) => (
          <div key={yearOffset} className="text-xs">
            Jahr
            {' '}
            {Number(yearOffset) + 1}
            :
            {' '}
            {formatPercent(modifier)}
            {' '}
            Rendite
          </div>
        ))}
      </div>
    </div>
  )
}
