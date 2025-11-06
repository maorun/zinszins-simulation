import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import type { HistoricalIndex } from '../../utils/historical-data'

interface IndexStatisticsProps {
  index: HistoricalIndex
  nestingLevel: number
}

export function IndexStatistics({ index, nestingLevel }: IndexStatisticsProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <Card nestingLevel={nestingLevel}>
      <CardContent nestingLevel={nestingLevel} className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium">
              Statistische Kennzahlen ({index.startYear}-{index.endYear})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Ø Rendite p.a.:</span>
              <span className="ml-2 font-medium">{formatPercent(index.averageReturn)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Volatilität:</span>
              <span className="ml-2 font-medium">{formatPercent(index.volatility)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Währung:</span>
              <span className="ml-2 font-medium">{index.currency}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Datenpunkte:</span>
              <span className="ml-2 font-medium">{index.data.length} Jahre</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
