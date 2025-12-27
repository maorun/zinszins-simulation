import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { GenerationAggregate } from '../../../helpers/generational-wealth-transfer'
import { formatCurrency } from '../../utils/currency'

interface GenerationBreakdownProps {
  generations: GenerationAggregate[]
  totalGifted: number
}

export function GenerationBreakdown({ generations, totalGifted }: GenerationBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Verteilung nach Generation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {generations.map((gen) => (
            <div key={gen.generation} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  Generation {gen.generation} ({gen.beneficiaryCount}{' '}
                  {gen.beneficiaryCount === 1 ? 'Person' : 'Personen'})
                </div>
                <div className="text-sm text-muted-foreground">
                  {((gen.totalGross / totalGifted) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Brutto</div>
                  <div className="font-medium">{formatCurrency(gen.totalGross)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Steuer</div>
                  <div className="font-medium text-red-600">{formatCurrency(gen.totalTax)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Netto</div>
                  <div className="font-medium text-green-600">{formatCurrency(gen.totalNet)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
