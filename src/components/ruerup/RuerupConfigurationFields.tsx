import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useFormId } from '../../utils/unique-id'
import type { RuerupRenteConfig } from '../../../helpers/ruerup-rente'
import { formatCurrency } from '../../utils/currency'

interface RuerupConfigurationFieldsProps {
  config: RuerupRenteConfig
  contributionYear: number
  maxAmountSingle: number
  maxAmountMarried: number
  onChange: (updates: Partial<RuerupRenteConfig>) => void
}

function AnnualContributionField({
  config,
  contributionYear,
  maxAmountSingle,
  maxAmountMarried,
  onChange,
}: RuerupConfigurationFieldsProps) {
  const annualContributionId = useFormId('ruerup', 'annual-contribution')
  return (
    <div className="space-y-2">
      <Label htmlFor={annualContributionId}>Jährlicher Beitrag (€)</Label>
      <Input
        id={annualContributionId}
        type="number"
        value={config.annualContribution}
        onChange={e => onChange({ annualContribution: Number(e.target.value) })}
        min={0}
        step={1000}
      />
      <p className="text-xs text-gray-600">
        Höchstbetrag {contributionYear}:{' '}
        {formatCurrency(config.civilStatus === 'single' ? maxAmountSingle : maxAmountMarried)}
      </p>
    </div>
  )
}

function CivilStatusField({ config, onChange }: Pick<RuerupConfigurationFieldsProps, 'config' | 'onChange'>) {
  const civilStatusId = useFormId('ruerup', 'civil-status')
  return (
    <div className="space-y-2">
      <Label htmlFor={civilStatusId}>Familienstand</Label>
      <select
        id={civilStatusId}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={config.civilStatus}
        onChange={e => onChange({ civilStatus: e.target.value as 'single' | 'married' })}
      >
        <option value="single">Ledig / Single</option>
        <option value="married">Verheiratet / Married</option>
      </select>
    </div>
  )
}

export function RuerupConfigurationFields(props: RuerupConfigurationFieldsProps) {
  const { config, onChange } = props
  const pensionStartYearId = useFormId('ruerup', 'pension-start-year')
  const monthlyPensionId = useFormId('ruerup', 'monthly-pension')
  const pensionIncreaseRateId = useFormId('ruerup', 'pension-increase-rate')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnnualContributionField {...props} />
      <CivilStatusField config={config} onChange={onChange} />

      <div className="space-y-2">
        <Label htmlFor={pensionStartYearId}>Rentenbeginn (Jahr)</Label>
        <Input
          id={pensionStartYearId}
          type="number"
          value={config.pensionStartYear}
          onChange={e => onChange({ pensionStartYear: Number(e.target.value) })}
          min={2025}
          max={2070}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={monthlyPensionId}>Erwartete monatliche Rente (€)</Label>
        <Input
          id={monthlyPensionId}
          type="number"
          value={config.expectedMonthlyPension}
          onChange={e => onChange({ expectedMonthlyPension: Number(e.target.value) })}
          min={0}
          step={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={pensionIncreaseRateId}>Rentenanpassung p.a. (%)</Label>
        <Input
          id={pensionIncreaseRateId}
          type="number"
          value={config.pensionIncreaseRate * 100}
          onChange={e => onChange({ pensionIncreaseRate: Number(e.target.value) / 100 })}
          min={0}
          max={5}
          step={0.1}
        />
      </div>
    </div>
  )
}
