import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'

interface TransferSummaryProps {
  totalGifted: number
  totalTax: number
  totalNet: number
}

export function TransferSummary({ totalGifted, totalTax, totalNet }: TransferSummaryProps) {
  const taxSavingsPercent = totalGifted > 0 ? ((totalGifted - totalNet) / totalGifted) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Übertragungsplan - Zusammenfassung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Gesamtvermögen</div>
            <div className="text-2xl font-bold">{formatCurrency(totalGifted)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Steuern gesamt</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalTax)}</div>
            <div className="text-xs text-muted-foreground">
              {taxSavingsPercent.toFixed(1)}% Steuerbelastung
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Nettovermögen</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalNet)}</div>
          </div>
        </div>

        {totalTax === 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Perfekt! Durch die optimale Nutzung der Freibeträge über mehrere Perioden fallen
              keine Steuern an.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
