/**
 * Info box explaining what Black Swan events are
 */
export function InfoBox() {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Was sind Black Swan Ereignisse?</h5>
      <p className="text-sm text-gray-700 mb-2">
        Black Swan Ereignisse sind extreme, seltene Markteinbrüche wie die Dotcom-Blase (2000-2003), die Finanzkrise
        (2008-2009) oder die COVID-19 Pandemie (2020). Diese Szenarien helfen Ihnen, die Widerstandsfähigkeit Ihres
        Portfolios in Krisenzeiten zu testen.
      </p>
      <p className="text-sm text-blue-800 font-medium">
        💡 Hinweis: Black Swan Ereignisse funktionieren am besten mit dem "Variable Renditen" Modus. Wechseln Sie zur
        Rendite-Konfiguration und wählen Sie "Variable Renditen", um Black Swan Szenarien in die Simulation zu
        integrieren.
      </p>
    </div>
  )
}
