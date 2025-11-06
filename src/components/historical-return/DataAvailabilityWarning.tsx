import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import type { HistoricalIndex } from '../../utils/historical-data'

interface DataAvailabilityWarningProps {
  index: HistoricalIndex
  simulationStartYear: number
  simulationEndYear: number
  nestingLevel: number
}

export function DataAvailabilityWarning({
  index,
  simulationStartYear,
  simulationEndYear,
  nestingLevel,
}: DataAvailabilityWarningProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <Card nestingLevel={nestingLevel} className="border-orange-200 bg-orange-50">
      <CardContent nestingLevel={nestingLevel} className="pt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-700">
            <div className="font-medium mb-1">Begrenzte Datenabdeckung</div>
            <p>
              Für den Simulationszeitraum ({simulationStartYear}-{simulationEndYear}) sind nur teilweise historische
              Daten verfügbar ({index.startYear}-{index.endYear}
              ). Fehlende Jahre werden mit der Durchschnittsrendite ({formatPercent(index.averageReturn)}) ersetzt.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
