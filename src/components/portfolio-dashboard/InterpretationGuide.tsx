import type { ReactElement } from 'react'

/**
 * Interpretation Guide Component
 * Provides explanations for all portfolio metrics
 */
export function InterpretationGuide(): ReactElement {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
      <h4 className="font-semibold text-gray-900 mb-2">📘 Interpretationshilfe</h4>
      <ul className="space-y-1 text-gray-700">
        <li className="flex items-start gap-2">
          <span className="font-medium text-gray-900">Sharpe Ratio:</span>
          <span>{'>'} 1,0 = gut, {'>'} 1,5 = sehr gut. Misst Überrendite pro Risikoeinheit.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-medium text-gray-900">Volatilität:</span>
          <span>Maß für Schwankungen. Niedrigere Werte bedeuten stabilere Renditen.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-medium text-gray-900">Max Drawdown:</span>
          <span>Größter Wertverlust vom Höchststand. Zeigt maximales historisches Risiko.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-medium text-gray-900">Sortino Ratio:</span>
          <span>Wie Sharpe Ratio, berücksichtigt aber nur Abwärtsvolatilität.</span>
        </li>
      </ul>
    </div>
  )
}
