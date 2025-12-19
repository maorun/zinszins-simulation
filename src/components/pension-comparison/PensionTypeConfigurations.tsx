import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useFormId } from '../../utils/unique-id'
import type { RiesterRenteConfig } from '../../../helpers/riester-rente'
import type { RuerupRenteConfig } from '../../../helpers/ruerup-rente'
import type { BetriebsrenteConfig } from '../../../helpers/betriebsrente'
import { formatCurrency } from '../../utils/currency'

// Riester Configuration Sub-component
export function RiesterConfiguration({
  config,
  onChange,
}: {
  config: RiesterRenteConfig
  onChange: (field: keyof RiesterRenteConfig, value: number | boolean) => void
}) {
  const contributionId = useFormId('riester', 'contribution')
  const pensionId = useFormId('riester', 'pension')
  const childrenId = useFormId('riester', 'children')

  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <Label htmlFor={contributionId}>Jährlicher Beitrag</Label>
        <Input
          id={contributionId}
          type="number"
          value={config.annualContribution}
          onChange={(e) => onChange('annualContribution', parseInt(e.target.value))}
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
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value))}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
      <div>
        <Label htmlFor={childrenId}>Anzahl Kinder</Label>
        <Input
          id={childrenId}
          type="number"
          value={config.numberOfChildren}
          onChange={(e) => onChange('numberOfChildren', parseInt(e.target.value))}
          min={0}
          max={10}
        />
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
          onChange={(e) => onChange('annualContribution', parseInt(e.target.value))}
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
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value))}
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
          onChange={(e) => onChange('annualEmployeeContribution', parseInt(e.target.value))}
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
          onChange={(e) => onChange('annualEmployerContribution', parseInt(e.target.value))}
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
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value))}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
    </div>
  )
}
