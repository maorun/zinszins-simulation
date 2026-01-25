import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { useFormId } from '../../utils/unique-id'
import type { RiesterRenteConfig } from '../../../helpers/riester-rente'
import type { RuerupRenteConfig } from '../../../helpers/ruerup-rente'
import type { BetriebsrenteConfig } from '../../../helpers/betriebsrente'
import { formatCurrency } from '../../utils/currency'

// Wohn-Riester Info Box
function WohnRiesterInfo() {
  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
      <p className="font-medium text-blue-900 mb-1">ℹ️ Wohn-Riester</p>
      <p className="text-blue-800">
        Bei Wohn-Riester werden die Beiträge für den Erwerb von selbstgenutzem Wohneigentum verwendet.
        Die Besteuerung erfolgt im Ruhestand über das Wohnförderkonto (§ 92a/92b EStG).
      </p>
    </div>
  )
}

// Riester Contribution Field
function RiesterContributionField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useFormId('riester', 'contribution')
  return (
    <div>
      <Label htmlFor={id}>Jährlicher Beitrag</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={0}
        step={100}
      />
      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(value)} pro Jahr</p>
    </div>
  )
}

// Riester Pension Field
function RiesterPensionField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const id = useFormId('riester', 'pension')
  return (
    <div>
      <Label htmlFor={id}>Erwartete monatliche Rente</Label>
      <Input id={id} type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} min={0} step={50} />
      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(value)} pro Monat</p>
    </div>
  )
}

// Riester Configuration Sub-component
export function RiesterConfiguration({
  config,
  onChange,
}: {
  config: RiesterRenteConfig
  onChange: (field: keyof RiesterRenteConfig, value: number | boolean) => void
}) {
  const childrenId = useFormId('riester', 'children')
  const wohnRiesterId = useFormId('riester', 'wohn-riester')

  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <RiesterContributionField value={config.annualContribution} onChange={(v) => onChange('annualContribution', v)} />

      <div className="flex items-center space-x-2">
        <Switch id={wohnRiesterId} checked={config.useWohnRiester} onCheckedChange={(checked) => onChange('useWohnRiester', checked)} />
        <Label htmlFor={wohnRiesterId}>Wohn-Riester (Eigenheimrente)</Label>
      </div>
      
      {config.useWohnRiester && <WohnRiesterInfo />}
      {!config.useWohnRiester && <RiesterPensionField value={config.expectedMonthlyPension} onChange={(v) => onChange('expectedMonthlyPension', v)} />}

      <div>
        <Label htmlFor={childrenId}>Anzahl Kinder</Label>
        <Input id={childrenId} type="number" value={config.numberOfChildren} onChange={(e) => onChange('numberOfChildren', parseInt(e.target.value) || 0)} min={0} max={10} />
      </div>
    </div>
  )
}

// Rürup Configuration Sub-component
export function RuerupConfiguration({
  config,
  onChange,
}: {
  config: RuerupRenteConfig
  onChange: (field: keyof RuerupRenteConfig, value: number | boolean | string) => void
}) {
  const contributionId = useFormId('ruerup', 'contribution')
  const pensionId = useFormId('ruerup', 'pension')

  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <Label htmlFor={contributionId}>Jährlicher Beitrag</Label>
        <Input
          id={contributionId}
          type="number"
          value={config.annualContribution}
          onChange={(e) => onChange('annualContribution', parseInt(e.target.value) || 0)}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.annualContribution)} pro Jahr</p>
      </div>
      <div>
        <Label htmlFor={pensionId}>Erwartete monatliche Rente</Label>
        <Input
          id={pensionId}
          type="number"
          value={config.expectedMonthlyPension}
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value) || 0)}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
    </div>
  )
}

// Betriebsrente Configuration Sub-component
export function BetriebsrenteConfiguration({ config, onChange }: {
  config: BetriebsrenteConfig
  onChange: (field: keyof BetriebsrenteConfig, value: number | boolean | string) => void
}) {
  const contributionId = useFormId('betriebsrente', 'contribution')
  const pensionId = useFormId('betriebsrente', 'pension')
  const employerContributionId = useFormId('betriebsrente', 'employer-contribution')
  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <Label htmlFor={contributionId}>Jährlicher Arbeitnehmerbeitrag</Label>
        <Input
          id={contributionId}
          type="number"
          value={config.annualEmployeeContribution}
          onChange={(e) => onChange('annualEmployeeContribution', parseInt(e.target.value) || 0)}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.annualEmployeeContribution)} pro Jahr</p>
      </div>
      <div>
        <Label htmlFor={employerContributionId}>Jährlicher Arbeitgeberbeitrag</Label>
        <Input
          id={employerContributionId}
          type="number"
          value={config.annualEmployerContribution}
          onChange={(e) => onChange('annualEmployerContribution', parseInt(e.target.value) || 0)}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.annualEmployerContribution)} AG-Zuschuss</p>
      </div>
      <div>
        <Label htmlFor={pensionId}>Erwartete monatliche Rente</Label>
        <Input
          id={pensionId}
          type="number"
          value={config.expectedMonthlyPension}
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value) || 0)}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
    </div>
  )
}
