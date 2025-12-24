import { Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatCurrency } from '../utils/currency'
import { GiftTaxHints } from './GiftTaxHints'

interface OptimizationResult {
  suggestedGifts: Array<{ year: number; amount: number }>
  totalTax: number
  totalNet: number
  savings: number
}

interface GiftTaxResultsDisplayProps {
  result: OptimizationResult
}

function TaxSavingsSummary({ result }: GiftTaxResultsDisplayProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          Steuerersparnis durch Optimierung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Steuerersparnis</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(result.savings)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Steuer bei Optimierung</p>
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(result.totalTax)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Netto beim Beschenkten</p>
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(result.totalNet)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function GiftSchedule({ result }: GiftTaxResultsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Empfohlener Schenkungsplan</CardTitle>
        <CardDescription>
          Optimale Aufteilung über {result.suggestedGifts.length} Schenkung
          {result.suggestedGifts.length !== 1 ? 'en' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {result.suggestedGifts.map((gift, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">Schenkung {index + 1}</p>
                  <p className="text-sm text-gray-600">Jahr {gift.year}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(gift.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function GiftTaxResultsDisplay({ result }: GiftTaxResultsDisplayProps) {
  return (
    <>
      <TaxSavingsSummary result={result} />
      <GiftSchedule result={result} />
      <GiftTaxHints />
    </>
  )
}
