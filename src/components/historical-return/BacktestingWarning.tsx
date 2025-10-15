import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface BacktestingWarningProps {
  nestingLevel: number
}

export function BacktestingWarning({ nestingLevel }: BacktestingWarningProps) {
  return (
    <Card nestingLevel={nestingLevel} className="border-amber-200 bg-amber-50">
      <CardContent nestingLevel={nestingLevel} className="pt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <div className="font-semibold text-amber-800">
              Wichtiger Hinweis zum Backtesting
            </div>
            <div className="text-sm text-amber-700 space-y-1">
              <p>
                <strong>Die Vergangenheit lässt keine Rückschlüsse auf die Zukunft zu.</strong>
                Historische Daten dienen nur zu Bildungs- und Testzwecken.
              </p>
              <p>
                Vergangene Wertentwicklungen sind kein verlässlicher Indikator für künftige Ergebnisse.
                Märkte können sich fundamental ändern.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
