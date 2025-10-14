type ChartView = 'overview' | 'detailed'

interface ChartInterpretationGuideProps {
  showInflationAdjusted: boolean
  showTaxes: boolean
  chartView: ChartView
}

export function ChartInterpretationGuide({
  showInflationAdjusted,
  showTaxes,
  chartView,
}: ChartInterpretationGuideProps) {
  return (
    <div className="mt-4 text-xs text-gray-600 space-y-2">
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

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="font-medium text-blue-800 mb-2">
          🎛️
          {' '}
          <strong>Interaktive Funktionen:</strong>
        </p>
        <div className="space-y-1 text-blue-700">
          <p>
            •
            <strong>Real-Werte:</strong>
            {' '}
            Schalter für inflationsbereinigte Darstellung
          </p>
          <p>
            •
            <strong>Steuern:</strong>
            {' '}
            Ein-/Ausblenden der Steuerbelastung
          </p>
          <p>
            •
            <strong>Ansichten:</strong>
            {' '}
            Übersicht oder Detail-Modus mit Zoom
          </p>
          {chartView === 'detailed' && (
            <p>
              •
              <strong>Zoom:</strong>
              {' '}
              Nutzen Sie den Slider unten für Zeitraum-Auswahl
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
