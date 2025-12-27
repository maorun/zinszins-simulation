import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'
import { formatCurrency } from '../../utils/currency'
import { generateFormId } from '../../utils/unique-id'

interface WealthTransferConfigurationProps {
  totalWealth: number
  timeHorizonYears: number
  optimizationGoal: 'minimize_tax' | 'equal_distribution' | 'custom'
  onTotalWealthChange: (value: number) => void
  onTimeHorizonYearsChange: (value: number) => void
  onOptimizationGoalChange: (value: 'minimize_tax' | 'equal_distribution' | 'custom') => void
}

function WealthInput({
  totalWealth,
  onTotalWealthChange,
  totalWealthId,
}: {
  totalWealth: number
  onTotalWealthChange: (value: number) => void
  totalWealthId: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={totalWealthId}>Zu übertragendes Vermögen</Label>
      <div className="flex items-center gap-2">
        <Input
          id={totalWealthId}
          type="number"
          value={totalWealth}
          onChange={(e) => onTotalWealthChange(Number(e.target.value))}
          min={0}
          step={10000}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatCurrency(totalWealth)}
        </span>
      </div>
    </div>
  )
}

export function WealthTransferConfiguration({
  totalWealth,
  timeHorizonYears,
  optimizationGoal,
  onTotalWealthChange,
  onTimeHorizonYearsChange,
  onOptimizationGoalChange,
}: WealthTransferConfigurationProps) {
  const totalWealthId = useMemo(() => generateFormId('wealth-transfer', 'total-wealth'), [])
  const timeHorizonId = useMemo(() => generateFormId('wealth-transfer', 'time-horizon'), [])
  const optimizationGoalId = useMemo(() => generateFormId('wealth-transfer', 'optimization-goal'), [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Vermögensübertragung konfigurieren</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <WealthInput
          totalWealth={totalWealth}
          onTotalWealthChange={onTotalWealthChange}
          totalWealthId={totalWealthId}
        />

        <div className="space-y-2">
          <Label htmlFor={timeHorizonId}>Planungshorizont (Jahre)</Label>
          <Input
            id={timeHorizonId}
            type="number"
            value={timeHorizonYears}
            onChange={(e) => onTimeHorizonYearsChange(Number(e.target.value))}
            min={10}
            max={50}
            step={5}
          />
          <p className="text-sm text-muted-foreground">
            Der Zeitraum, über den die Schenkungen verteilt werden können
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={optimizationGoalId}>Optimierungsziel</Label>
          <RadioTileGroup
            value={optimizationGoal}
            onValueChange={(value: string) =>
              onOptimizationGoalChange(value as 'minimize_tax' | 'equal_distribution' | 'custom')
            }
            name={optimizationGoalId}
          >
            <RadioTile value="minimize_tax" label="Steueroptimiert">
              Minimiert die Gesamtsteuerbelastung durch intelligente Nutzung der Freibeträge
            </RadioTile>
            <RadioTile value="equal_distribution" label="Gleichmäßige Verteilung">
              Verteilt das Vermögen gleichmäßig auf alle Familienmitglieder
            </RadioTile>
          </RadioTileGroup>
        </div>
      </CardContent>
    </Card>
  )
}
