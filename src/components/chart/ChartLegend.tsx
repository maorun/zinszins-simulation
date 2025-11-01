export interface ChartLegendProps {
  showInflationAdjusted: boolean
  showTaxes: boolean
}

/**
 * Displays the legend explaining chart elements
 */
export function ChartLegend({
  showInflationAdjusted,
  showTaxes,
}: ChartLegendProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="font-medium text-gray-700 mb-2">
        💡
        {' '}
        <strong>Chart-Interpretation:</strong>
      </p>
      <div className="space-y-1">
        <p>
          •
          {' '}
          <span className="text-blue-600 font-medium">Blaue Fläche:</span>
          {' '}
          Ihre kumulierten Einzahlungen über Zeit
        </p>
        <p>
          •
          {' '}
          <span className="text-green-600 font-medium">Grüne Fläche:</span>
          {' '}
          Zinsen und Kapitalgewinne
          {' '}
          {showInflationAdjusted && '(inflationsbereinigt)'}
        </p>
        <p>
          •
          {' '}
          <span className="text-red-600 font-medium">Rote Linie:</span>
          {' '}
          Gesamtes Endkapital
          {' '}
          {showInflationAdjusted && '(inflationsbereinigt)'}
        </p>
        {showTaxes && (
          <p>
            •
            {' '}
            <span className="text-yellow-600 font-medium">Gelbe gestrichelte Linie:</span>
            {' '}
            Bezahlte Steuern
          </p>
        )}
      </div>
    </div>
  )
}
