import { Info } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

interface StatutoryInsuranceConfigProps {
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
}

function EmployerContributionSetting({
  includeEmployerContribution,
  onIncludeEmployerContributionChange,
}: Pick<StatutoryInsuranceConfigProps, 'includeEmployerContribution' | 'onIncludeEmployerContributionChange'>) {
  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Switch
          checked={includeEmployerContribution}
          onCheckedChange={onIncludeEmployerContributionChange}
          id="include-employer-contribution"
        />
        <Label htmlFor="include-employer-contribution">Arbeitgeberanteil in Entnahme-Phase berücksichtigen</Label>
      </div>
      <div className="text-xs text-muted-foreground">
        Standard: Arbeitgeberanteil muss in der Entnahme-Phase selbst getragen werden. Deaktivieren Sie diese Option,
        wenn nur der Arbeitnehmeranteil gezahlt wird.
      </div>
    </div>
  )
}

function StatutoryRates({
  statutoryHealthInsuranceRate,
  statutoryCareInsuranceRate,
}: Pick<StatutoryInsuranceConfigProps, 'statutoryHealthInsuranceRate' | 'statutoryCareInsuranceRate'>) {
  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Info className="h-4 w-4" />
        Gesetzliche Beitragssätze (Deutschland 2024)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="statutory-health-rate">Krankenversicherung: {statutoryHealthInsuranceRate.toFixed(2)}%</Label>
          <div className="text-xs text-muted-foreground">
            Gesetzlich festgelegt: 14,6% (7,3% Arbeitnehmer + 7,3% Arbeitgeber)
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="statutory-care-rate">Pflegeversicherung: {statutoryCareInsuranceRate.toFixed(2)}%</Label>
          <div className="text-xs text-muted-foreground">Gesetzlich festgelegt: 3,05% (+ 0,6% für Kinderlose)</div>
        </div>
      </div>
    </div>
  )
}

function IncomeLimits({
  statutoryMinimumIncomeBase,
  statutoryMaximumIncomeBase,
  onStatutoryMinimumIncomeBaseChange,
  onStatutoryMaximumIncomeBaseChange,
}: Pick<
  StatutoryInsuranceConfigProps,
  | 'statutoryMinimumIncomeBase'
  | 'statutoryMaximumIncomeBase'
  | 'onStatutoryMinimumIncomeBaseChange'
  | 'onStatutoryMaximumIncomeBaseChange'
>) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-sm">Beitragsbemessungsgrenzen</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="statutory-min-income">Mindestbeitragsbemessungsgrundlage (jährlich)</Label>
          <Input
            id="statutory-min-income"
            type="number"
            min="0"
            step="100"
            value={statutoryMinimumIncomeBase}
            onChange={e => onStatutoryMinimumIncomeBaseChange(Number(e.target.value))}
          />
          <div className="text-xs text-muted-foreground">Mindestbeitrag wird auch bei geringerem Einkommen erhoben</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="statutory-max-income">Beitragsbemessungsgrenze (jährlich)</Label>
          <Input
            id="statutory-max-income"
            type="number"
            min="0"
            step="1000"
            value={statutoryMaximumIncomeBase}
            onChange={e => onStatutoryMaximumIncomeBaseChange(Number(e.target.value))}
          />
          <div className="text-xs text-muted-foreground">Maximale Beitragsbemessungsgrundlage (2024: 62.550€)</div>
        </div>
      </div>
    </div>
  )
}

export function StatutoryInsuranceConfig(props: StatutoryInsuranceConfigProps) {
  return (
    <div className="space-y-6">
      <EmployerContributionSetting
        includeEmployerContribution={props.includeEmployerContribution}
        onIncludeEmployerContributionChange={props.onIncludeEmployerContributionChange}
      />
      <StatutoryRates
        statutoryHealthInsuranceRate={props.statutoryHealthInsuranceRate}
        statutoryCareInsuranceRate={props.statutoryCareInsuranceRate}
      />
      <IncomeLimits
        statutoryMinimumIncomeBase={props.statutoryMinimumIncomeBase}
        statutoryMaximumIncomeBase={props.statutoryMaximumIncomeBase}
        onStatutoryMinimumIncomeBaseChange={props.onStatutoryMinimumIncomeBaseChange}
        onStatutoryMaximumIncomeBaseChange={props.onStatutoryMaximumIncomeBaseChange}
      />
    </div>
  )
}
