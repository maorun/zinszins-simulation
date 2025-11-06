import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import type { CareCostConfiguration } from '../../../helpers/care-cost-simulation'

interface InsuranceAndBenefitsFieldsProps {
  values: CareCostConfiguration
  onChange: (config: CareCostConfiguration) => void
}

/**
 * Tax deductible configuration
 */
function TaxDeductibleConfig({
  values,
  onChange,
}: {
  values: CareCostConfiguration
  onChange: (config: CareCostConfiguration) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={values.taxDeductible}
          onCheckedChange={taxDeductible => onChange({ ...values, taxDeductible })}
          id="tax-deductible"
        />
        <Label htmlFor="tax-deductible" className="text-sm">
          Pflegekosten steuerlich absetzbar
        </Label>
      </div>

      {values.taxDeductible && (
        <div className="space-y-2 ml-6">
          <Label htmlFor="max-tax-deduction">Maximaler jährlicher Steuerabzug</Label>
          <Input
            id="max-tax-deduction"
            type="number"
            value={values.maxAnnualTaxDeduction}
            onChange={e =>
              onChange({
                ...values,
                maxAnnualTaxDeduction: Number(e.target.value),
              })
            }
            min={0}
            step={1000}
          />
          <div className="text-sm text-muted-foreground">Außergewöhnliche Belastungen nach deutschem Steuerrecht</div>
        </div>
      )}
    </div>
  )
}

export function InsuranceAndBenefitsFields({ values, onChange }: InsuranceAndBenefitsFieldsProps) {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          checked={values.includeStatutoryBenefits}
          onCheckedChange={includeStatutoryBenefits => onChange({ ...values, includeStatutoryBenefits })}
          id="include-statutory-benefits"
        />
        <Label htmlFor="include-statutory-benefits" className="text-sm">
          Gesetzliche Pflegeleistungen berücksichtigen
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="private-care-benefit">Private Pflegeversicherung (monatlich)</Label>
        <Input
          id="private-care-benefit"
          type="number"
          value={values.privateCareInsuranceMonthlyBenefit}
          onChange={e =>
            onChange({
              ...values,
              privateCareInsuranceMonthlyBenefit: Number(e.target.value),
            })
          }
          min={0}
          step={50}
          placeholder="z.B. 500"
        />
        <div className="text-sm text-muted-foreground">
          Zusätzliche monatliche Leistungen aus privater Pflegeversicherung
        </div>
      </div>

      <TaxDeductibleConfig values={values} onChange={onChange} />
    </>
  )
}
