import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Info } from 'lucide-react'
import type { PensionPointsResult } from '../../../helpers/pension-points'

interface CalculationResultsProps {
  result: PensionPointsResult
  nestingLevel: number
  onApply?: () => void
}

function ResultsGrid({ result }: { result: PensionPointsResult }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Beitragsjahre</div>
          <div className="text-lg font-semibold">{result.contributionYears}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Rentenpunkte gesamt</div>
          <div className="text-lg font-semibold">{result.totalPensionPoints.toFixed(2)}</div>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Monatliche Rente</div>
            <div className="text-2xl font-bold text-blue-600">
              {result.monthlyPension.toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              €
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Jährliche Rente</div>
            <div className="text-2xl font-bold text-blue-600">
              {result.annualPension.toLocaleString('de-DE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              €
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t">
        Rentenwert: {result.pensionValue.toFixed(2)} € pro Rentenpunkt
      </div>
    </>
  )
}

export function CalculationResults({ result, nestingLevel, onApply }: CalculationResultsProps) {
  return (
    <Card nestingLevel={nestingLevel + 1} className="bg-blue-50">
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          Berechnungsergebnis
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="space-y-3">
          <ResultsGrid result={result} />

          {onApply && (
            <Button onClick={onApply} className="w-full">
              Berechnete Rente übernehmen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
