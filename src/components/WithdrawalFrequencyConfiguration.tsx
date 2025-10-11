import { Label } from './ui/label'
import { Switch } from './ui/switch'

type WithdrawalFrequency = 'yearly' | 'monthly'

interface WithdrawalFrequencyConfigurationProps {
  frequency: WithdrawalFrequency
  onFrequencyChange: (frequency: WithdrawalFrequency) => void
}

export function WithdrawalFrequencyConfiguration({
  frequency,
  onFrequencyChange,
}: WithdrawalFrequencyConfigurationProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Häufigkeit</Label>
      <div className="flex items-center space-x-3 mt-2">
        <span className="text-sm">Jährlich</span>
        <Switch
          checked={frequency === 'monthly'}
          onCheckedChange={(checked) => {
            onFrequencyChange(checked ? 'monthly' : 'yearly')
          }}
        />
        <span className="text-sm">Monatlich</span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {frequency === 'yearly'
          ? 'Entnahme erfolgt einmal jährlich am Anfang des Jahres'
          : 'Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen'}
      </div>
    </div>
  )
}
