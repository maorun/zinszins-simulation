import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { TeilverkaufComparisonResult } from '../../../helpers/immobilien-teilverkauf'
import { formatCurrencyWhole } from '../../utils/currency'

interface ComparisonResultsDisplayProps {
  result: TeilverkaufComparisonResult
}

interface StrategyCardProps {
  title: string
  isBest: boolean
  initialLiquidity: number
  costsLabel: string
  costsValue: number
  finalWealth: number
  isPositiveCosts?: boolean
}

function StrategyCard({
  title,
  isBest,
  initialLiquidity,
  costsLabel,
  costsValue,
  finalWealth,
  isPositiveCosts,
}: StrategyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span>{title}</span>
          {isBest && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <div className="text-xs text-muted-foreground">Anfängliche Liquidität</div>
          <div className="font-semibold">{formatCurrencyWhole(initialLiquidity)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{costsLabel}</div>
          <div className={`font-semibold ${isPositiveCosts ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrencyWhole(costsValue)}
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">Endvermögen</div>
          <div className="font-bold text-lg">{formatCurrencyWhole(finalWealth)}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ComparisonResultsDisplay({ result }: ComparisonResultsDisplayProps) {
  const strategies = [
    { name: 'Teilverkauf', wealth: result.teilverkauf.finalWealth },
    { name: 'Vollverkauf + Miete', wealth: result.fullSaleRent.finalWealth },
    { name: 'Leibrente', wealth: result.leibrente.finalWealth },
  ]

  const bestStrategy = strategies.reduce((prev, current) => (prev.wealth > current.wealth ? prev : current))

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-green-600" />
        Vergleichsergebnisse
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StrategyCard
          title="Teilverkauf"
          isBest={bestStrategy.name === 'Teilverkauf'}
          initialLiquidity={result.teilverkauf.initialLiquidity}
          costsLabel="Gesamtkosten"
          costsValue={result.teilverkauf.totalCosts}
          finalWealth={result.teilverkauf.finalWealth}
        />
        <StrategyCard
          title="Vollverkauf + Miete"
          isBest={bestStrategy.name === 'Vollverkauf + Miete'}
          initialLiquidity={result.fullSaleRent.initialLiquidity}
          costsLabel="Gezahlte Miete"
          costsValue={result.fullSaleRent.totalRentPaid}
          finalWealth={result.fullSaleRent.finalWealth}
        />
        <StrategyCard
          title="Leibrente"
          isBest={bestStrategy.name === 'Leibrente'}
          initialLiquidity={result.leibrente.initialLiquidity}
          costsLabel="Erhaltene Zahlungen"
          costsValue={result.leibrente.totalPaymentsReceived}
          finalWealth={result.leibrente.finalWealth}
          isPositiveCosts={true}
        />
      </div>

      <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>Empfehlung:</strong> {bestStrategy.name} bietet das höchste Endvermögen von{' '}
          {formatCurrencyWhole(bestStrategy.wealth)}. Berücksichtigen Sie jedoch auch nicht-finanzielle Faktoren wie
          Wohnsicherheit und emotionale Bindung an die Immobilie.
        </div>
      </div>
    </div>
  )
}
