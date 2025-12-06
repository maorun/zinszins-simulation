import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface EMRenteEstimationCardProps {
  nestingLevel: number
  estimateMonthlyPensionId: string
  onEstimate: (monthlyPension: number) => void
}

export function EMRenteEstimationCard({
  nestingLevel,
  estimateMonthlyPensionId,
  onEstimate,
}: EMRenteEstimationCardProps) {
  return (
    <Card nestingLevel={nestingLevel + 1}>
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-sm">Rentenpunkte schätzen</CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="space-y-2">
          <Label htmlFor={estimateMonthlyPensionId}>Bekannte monatliche Rente (€)</Label>
          <div className="flex gap-2">
            <Input
              id={estimateMonthlyPensionId}
              type="number"
              step="10"
              placeholder="z.B. 1500"
              onBlur={e => {
                const value = parseFloat(e.target.value)
                if (value > 0) {
                  onEstimate(value)
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Geben Sie eine bekannte Rentenhöhe ein, um die Rentenpunkte automatisch zu schätzen
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
