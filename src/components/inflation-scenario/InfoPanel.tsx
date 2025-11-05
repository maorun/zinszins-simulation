/**
 * Information panel explaining what inflation scenarios are
 */
export const InfoPanel = () => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Was sind Inflationsszenarien?</h5>
      <p className="text-sm text-gray-700 mb-2">
        Inflationsszenarien helfen Ihnen, die Auswirkungen unterschiedlicher Inflationsentwicklungen
        auf Ihr Portfolio zu verstehen. Sie können Hyperinflation (anhaltend hohe Inflation),
        Deflation (fallende Preise) oder Stagflation (hohe Inflation bei schwachem Wachstum) simulieren.
      </p>
      <p className="text-sm text-blue-800 font-medium">
        💡 Hinweis: Diese Szenarien überschreiben die normale Inflationsrate für den
        gewählten Zeitraum. Sie können die Szenarien mit "Variable Renditen" kombinieren,
        um realistische Krisenszenarien zu erstellen.
      </p>
    </div>
  )
}
