import { Card, CardContent } from '../ui/card'

interface HistoricalDataPreviewProps {
  historicalReturns: Record<string, number>
  nestingLevel: number
}

export function HistoricalDataPreview({
  historicalReturns,
  nestingLevel,
}: HistoricalDataPreviewProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  if (!historicalReturns || Object.keys(historicalReturns).length === 0) {
    return null
  }

  return (
    <Card nestingLevel={nestingLevel}>
      <CardContent nestingLevel={nestingLevel} className="pt-4">
        <div className="space-y-3">
          <div className="font-medium">Historische Renditen (Auswahl)</div>
          <div className="max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(historicalReturns)
                .slice(-8) // Show last 8 years
                .map(([year, returnValue]) => (
                  <div key={year} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {year}
                      :
                    </span>
                    <span className={`font-medium ${
                      returnValue >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                    >
                      {formatPercent(returnValue)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Die Simulation verwendet die tatsächlichen historischen
            Jahresrenditen für den gewählten Zeitraum.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
