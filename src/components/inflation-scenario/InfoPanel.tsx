/**
 * Information panel explaining what inflation scenarios are
 */
export const InfoPanel = () => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Was sind Inflationsszenarien?</h5>
      <p className="text-sm text-gray-700 mb-2">
        Inflationsszenarien helfen Ihnen, die Auswirkungen unterschiedlicher Inflationsentwicklungen auf Ihr Portfolio
        zu verstehen und die reale Kaufkraft zu planen.
      </p>
      <div className="text-sm text-gray-700 mb-2 space-y-1">
        <p className="font-medium text-blue-900">📊 Realistische Szenarien (für Altersvorsorge):</p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li><strong>Optimistisch (1,5% p.a.):</strong> Niedrige Inflation unter dem EZB-Ziel</li>
          <li><strong>Moderat (2,0% p.a.):</strong> Stabile Inflation am EZB-Ziel</li>
          <li><strong>Pessimistisch (3,5% p.a.):</strong> Anhaltend erhöhte Inflation</li>
          <li><strong>Historisch (2000-2023):</strong> Basierend auf tatsächlichen deutschen Inflationsraten</li>
        </ul>
      </div>
      <div className="text-sm text-gray-700 mb-2 space-y-1">
        <p className="font-medium text-blue-900">⚠️ Stress-Test Szenarien (für Krisenplanung):</p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li><strong>Hyperinflation (8-12%):</strong> Extreme Inflation wie in den 1970er Jahren</li>
          <li><strong>Deflation (-2% bis 0%):</strong> Fallende Preise wie in Japan</li>
          <li><strong>Stagflation (6-8%):</strong> Hohe Inflation + schwaches Wachstum</li>
        </ul>
      </div>
      <p className="text-sm text-blue-800 font-medium">
        💡 Hinweis: Diese Szenarien überschreiben die normale Inflationsrate für den gewählten Zeitraum. Sie können die
        Szenarien mit "Variable Renditen" kombinieren, um realistische Szenarien zu erstellen.
      </p>
    </div>
  )
}
