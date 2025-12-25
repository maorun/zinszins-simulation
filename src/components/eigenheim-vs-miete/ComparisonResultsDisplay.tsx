import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import type { ComparisonSummary } from '../../../helpers/eigenheim-vs-miete'

interface ComparisonResultsDisplayProps {
  summary: ComparisonSummary
  comparisonYears: number
  formatCurrency: (amount: number) => string
}

export function ComparisonResultsDisplay({ summary, comparisonYears, formatCurrency }: ComparisonResultsDisplayProps) {
  return (
    <div className="space-y-4 pt-6 border-t">
      <h3 className="text-lg font-medium">Ergebnisse nach {comparisonYears} Jahren</h3>

      <SummaryCards summary={summary} formatCurrency={formatCurrency} />
      <RecommendationAlert summary={summary} formatCurrency={formatCurrency} />
      <MonthlyCostComparison summary={summary} formatCurrency={formatCurrency} />
    </div>
  )
}

function SummaryCards({ summary, formatCurrency }: Pick<ComparisonResultsDisplayProps, 'summary' | 'formatCurrency'>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <OwnershipCard summary={summary} formatCurrency={formatCurrency} />
      <RentalCard summary={summary} formatCurrency={formatCurrency} />
      <DifferenceCard summary={summary} formatCurrency={formatCurrency} />
    </div>
  )
}

function OwnershipCard({ summary, formatCurrency }: Pick<ComparisonResultsDisplayProps, 'summary' | 'formatCurrency'>) {
  return (
    <Card className={summary.netWorthDifference > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">Eigenheim</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(summary.finalHomeEquity)}</p>
            <p className="text-xs text-gray-600">Eigenkapital</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Gesamtkosten: {formatCurrency(summary.totalOwnershipCosts)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RentalCard({ summary, formatCurrency }: Pick<ComparisonResultsDisplayProps, 'summary' | 'formatCurrency'>) {
  return (
    <Card className={summary.netWorthDifference < 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">Miete</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(summary.finalRentalInvestments)}</p>
            <p className="text-xs text-gray-600">Vermögen</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Gesamtkosten: {formatCurrency(summary.totalRentalCosts)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DifferenceCard({ summary, formatCurrency }: Pick<ComparisonResultsDisplayProps, 'summary' | 'formatCurrency'>) {
  return (
    <Card className="border-purple-300 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">Differenz</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {summary.netWorthDifference > 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
            <p className={`text-2xl font-bold ${summary.netWorthDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(summary.netWorthDifference))}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {summary.breakEvenYear !== null ? (
              <p className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Break-Even: Jahr {summary.breakEvenYear}
              </p>
            ) : (
              <p>Kein Break-Even in diesem Zeitraum</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecommendationAlert({ summary, formatCurrency }: Pick<ComparisonResultsDisplayProps, 'summary' | 'formatCurrency'>) {
  const alertClass =
    summary.recommendation === 'ownership' ? 'bg-green-50 border-green-300' : summary.recommendation === 'rental' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'

  return (
    <Alert className={alertClass}>
      <AlertDescription>
        <strong>Empfehlung:</strong>{' '}
        {summary.recommendation === 'ownership' && (
          <>
            Basierend auf Ihren Annahmen ist <strong>Eigenheim</strong> die bessere finanzielle Entscheidung. Das Eigenkapital übertrifft das Miet-Vermögen
            um {formatCurrency(summary.netWorthDifference)}.
          </>
        )}
        {summary.recommendation === 'rental' && (
          <>
            Basierend auf Ihren Annahmen ist <strong>Miete</strong> die bessere finanzielle Entscheidung. Das investierte Vermögen übertrifft das Eigenkapital
            um {formatCurrency(Math.abs(summary.netWorthDifference))}.
          </>
        )}
        {summary.recommendation === 'similar' && (
          <>
            Beide Optionen sind <strong>finanziell ähnlich</strong>. Die Entscheidung sollte auf persönlichen Präferenzen basieren (Flexibilität vs. Eigentum).
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}

function MonthlyCostComparison({ summary, formatCurrency }: Pick<ComparisonResultsDisplayProps, 'summary' | 'formatCurrency'>) {
  return (
    <div className="text-sm text-gray-600">
      <p>
        <strong>Monatliche Kosten im ersten Jahr:</strong>
        {summary.firstYearMonthlyCostDifference > 0 ? (
          <> Eigenheim kostet {formatCurrency(summary.firstYearMonthlyCostDifference)} mehr pro Monat</>
        ) : (
          <> Miete kostet {formatCurrency(Math.abs(summary.firstYearMonthlyCostDifference))} mehr pro Monat</>
        )}
      </p>
    </div>
  )
}
