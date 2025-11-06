import type { ChartView } from './ChartControls'

export interface InteractiveFeaturesGuideProps {
  chartView: ChartView
}

/**
 * Displays interactive features guide for the chart
 */
export function InteractiveFeaturesGuide({ chartView }: InteractiveFeaturesGuideProps) {
  return (
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="font-medium text-blue-800 mb-2">
        🎛️ <strong>Interaktive Funktionen:</strong>
      </p>
      <div className="space-y-1 text-blue-700">
        <p>
          •<strong>Real-Werte:</strong> Schalter für inflationsbereinigte Darstellung
        </p>
        <p>
          •<strong>Steuern:</strong> Ein-/Ausblenden der Steuerbelastung
        </p>
        <p>
          •<strong>Ansichten:</strong> Übersicht oder Detail-Modus mit Zoom
        </p>
        {chartView === 'detailed' && (
          <p>
            •<strong>Zoom:</strong> Nutzen Sie den Slider unten für Zeitraum-Auswahl
          </p>
        )}
      </div>
    </div>
  )
}
