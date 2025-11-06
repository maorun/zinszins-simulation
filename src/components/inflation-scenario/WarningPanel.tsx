/**
 * Warning panel for inflation scenarios
 */
export const WarningPanel = () => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h6 className="font-semibold mb-2 text-yellow-900">⚠️ Wichtiger Hinweis</h6>
      <p className="text-sm text-gray-700">
        Inflationsszenarien sind Extremszenarien zur Stresstestung Ihres Portfolios. Sie sollten nicht als Vorhersage
        der tatsächlichen Inflationsentwicklung verstanden werden, sondern als Werkzeug zur Bewertung der Robustheit
        Ihrer Finanzplanung unter verschiedenen wirtschaftlichen Bedingungen.
      </p>
    </div>
  )
}
