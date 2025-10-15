import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { formatCurrency } from '../../utils/currency'
import {
  type CareCostConfiguration,
  DEFAULT_CARE_LEVELS,
  getCareLevelDisplayName,
} from '../../../helpers/care-cost-simulation'

interface BasicCareCostFieldsProps {
  values: CareCostConfiguration
  onChange: (config: CareCostConfiguration) => void
  currentYear: number
}

export function BasicCareCostFields({
  values,
  onChange,
  currentYear,
}: BasicCareCostFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="care-start-year">
          Startjahr der Pflegebedürftigkeit
        </Label>
        <Input
          id="care-start-year"
          type="number"
          value={values.startYear}
          onChange={e => onChange({ ...values, startYear: Number(e.target.value) })}
          min={currentYear}
          max={currentYear + 50}
          step={1}
          className="w-32"
        />
        <div className="text-sm text-muted-foreground">
          Jahr, in dem Pflegebedürftigkeit erwartet wird
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-monthly-costs">
          Individuelle monatliche Pflegekosten (optional)
        </Label>
        <Input
          id="custom-monthly-costs"
          type="number"
          value={values.customMonthlyCosts || ''}
          onChange={e => onChange({
            ...values,
            customMonthlyCosts: e.target.value ? Number(e.target.value) : undefined,
          })}
          min={0}
          step={50}
          placeholder={`Standard: ${formatCurrency(DEFAULT_CARE_LEVELS[values.careLevel].typicalMonthlyCost)}`}
        />
        <div className="text-sm text-muted-foreground">
          Überschreibt die typischen Kosten für
          {' '}
          {getCareLevelDisplayName(values.careLevel)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="care-duration">
          Pflegedauer (Jahre, 0 = bis Lebensende)
        </Label>
        <Input
          id="care-duration"
          type="number"
          value={values.careDurationYears}
          onChange={e => onChange({ ...values, careDurationYears: Number(e.target.value) })}
          min={0}
          max={50}
          step={1}
          className="w-32"
        />
        <div className="text-sm text-muted-foreground">
          {values.careDurationYears === 0
            ? 'Pflegebedürftigkeit bis zum Lebensende'
            : `Pflegebedürftigkeit für ${values.careDurationYears} Jahre`}
        </div>
      </div>
    </>
  )
}
