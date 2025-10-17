import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { formatCurrency } from '../../utils/currency'
import {
  type CareCostConfiguration,
  type CareLevel,
  DEFAULT_CARE_LEVELS,
  getCareLevelDisplayName,
} from '../../../helpers/care-cost-simulation'

interface BasicCareCostFieldsProps {
  values: CareCostConfiguration
  onChange: (config: CareCostConfiguration) => void
  currentYear: number
}

/**
 * Start year field component
 */
function StartYearField({
  value,
  onChange,
  currentYear,
}: {
  value: number
  onChange: (value: number) => void
  currentYear: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="care-start-year">
        Startjahr der Pflegebedürftigkeit
      </Label>
      <Input
        id="care-start-year"
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={currentYear}
        max={currentYear + 50}
        step={1}
        className="w-32"
      />
      <div className="text-sm text-muted-foreground">
        Jahr, in dem Pflegebedürftigkeit erwartet wird
      </div>
    </div>
  )
}

/**
 * Custom monthly costs field component
 */
function CustomMonthlyCostsField({
  value,
  careLevel,
  onChange,
}: {
  value: number | undefined
  careLevel: CareLevel
  onChange: (value: number | undefined) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="custom-monthly-costs">
        Individuelle monatliche Pflegekosten (optional)
      </Label>
      <Input
        id="custom-monthly-costs"
        type="number"
        value={value || ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
        min={0}
        step={50}
        placeholder={`Standard: ${formatCurrency(DEFAULT_CARE_LEVELS[careLevel].typicalMonthlyCost)}`}
      />
      <div className="text-sm text-muted-foreground">
        Überschreibt die typischen Kosten für
        {' '}
        {getCareLevelDisplayName(careLevel)}
      </div>
    </div>
  )
}

export function BasicCareCostFields({
  values,
  onChange,
  currentYear,
}: BasicCareCostFieldsProps) {
  return (
    <>
      <StartYearField
        value={values.startYear}
        onChange={startYear => onChange({ ...values, startYear })}
        currentYear={currentYear}
      />

      <CustomMonthlyCostsField
        value={values.customMonthlyCosts}
        careLevel={values.careLevel}
        onChange={customMonthlyCosts => onChange({ ...values, customMonthlyCosts })}
      />

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
