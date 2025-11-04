/**
 * Warning box with important disclaimer about Black Swan events
 */
export function WarningBox() {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h6 className="font-semibold mb-2 text-yellow-900">⚠️ Wichtiger Hinweis</h6>
      <p className="text-sm text-gray-700">
        Black Swan Ereignisse sind per Definition selten und extrem. Diese Szenarien dienen
        ausschließlich zur Stresstestung Ihres Portfolios und sollten nicht als
        Vorhersage zukünftiger Marktentwicklungen verstanden werden.
      </p>
    </div>
  )
}
