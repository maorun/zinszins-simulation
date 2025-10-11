import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { Button } from './ui/button'
import { formatCurrency } from '../utils/currency'
import {
  type CareCostConfiguration,
  createDefaultCareCostConfiguration,
  calculateCareCostsForYear,
  getCareLevelDisplayName,
  validateCareCostConfiguration,
  DEFAULT_CARE_LEVELS,
} from '../../helpers/care-cost-simulation'
import { CareLevelSelector } from './CareCostConfiguration/CareLevelSelector'
import { CoupleCareCostConfig } from './CareCostConfiguration/CoupleCareCostConfig'
import { CareCostPreview } from './CareCostConfiguration/CareCostPreview'
import { CareCostValidationErrors } from './CareCostConfiguration/CareCostValidationErrors'

interface CareCostConfigurationProps {
  /** Current care cost configuration */
  values: CareCostConfiguration
  /** Callback when configuration changes */
  onChange: (config: CareCostConfiguration) => void
  /** Current year for validation */
  currentYear?: number
  /** Birth year for calculations */
  birthYear?: number
  /** Spouse birth year for couple calculations */
  spouseBirthYear?: number
  /** Planning mode */
  planningMode: 'individual' | 'couple'
  /** Card nesting level for proper styling */
  nestingLevel?: number
}

export function CareCostConfiguration({
  values,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
  nestingLevel = 0,
}: CareCostConfigurationProps) {
  const validationErrors = validateCareCostConfiguration(values)
  const previewYear = Math.max(currentYear + 5, values.startYear)
  const previewResult = values.enabled
    ? calculateCareCostsForYear(values, previewYear, birthYear, spouseBirthYear)
    : null

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          🏥 Pflegekosten-Simulation
        </CardTitle>
      </CardHeader>

      <CardContent nestingLevel={nestingLevel} className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={values.enabled}
            onCheckedChange={enabled => onChange({ ...values, enabled })}
            id="care-cost-enabled"
          />
          <Label htmlFor="care-cost-enabled" className="text-sm font-medium">
            Pflegekosten-Simulation aktivieren
          </Label>
        </div>

        {values.enabled && (
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

            <CareLevelSelector
              careLevel={values.careLevel}
              onChange={careLevel => onChange({ ...values, careLevel })}
            />

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
              <Label>
                Inflationsrate für Pflegekosten:
                {values.careInflationRate}
                %
              </Label>
              <Slider
                value={[values.careInflationRate]}
                onValueChange={vals => onChange({ ...values, careInflationRate: vals[0] })}
                min={0}
                max={10}
                step={0.5}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0%</span>
                <span className="font-medium text-gray-900">
                  {values.careInflationRate}
                  %
                </span>
                <span>10%</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Jährliche Steigerung der Pflegekosten
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

            <div className="flex items-center space-x-2">
              <Switch
                checked={values.includeStatutoryBenefits}
                onCheckedChange={includeStatutoryBenefits =>
                  onChange({ ...values, includeStatutoryBenefits })}
                id="include-statutory-benefits"
              />
              <Label htmlFor="include-statutory-benefits" className="text-sm">
                Gesetzliche Pflegeleistungen berücksichtigen
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="private-care-benefit">
                Private Pflegeversicherung (monatlich)
              </Label>
              <Input
                id="private-care-benefit"
                type="number"
                value={values.privateCareInsuranceMonthlyBenefit}
                onChange={e => onChange({
                  ...values,
                  privateCareInsuranceMonthlyBenefit: Number(e.target.value),
                })}
                min={0}
                step={50}
                placeholder="z.B. 500"
              />
              <div className="text-sm text-muted-foreground">
                Zusätzliche monatliche Leistungen aus privater Pflegeversicherung
              </div>
            </div>

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
                  <Label htmlFor="max-tax-deduction">
                    Maximaler jährlicher Steuerabzug
                  </Label>
                  <Input
                    id="max-tax-deduction"
                    type="number"
                    value={values.maxAnnualTaxDeduction}
                    onChange={e => onChange({
                      ...values,
                      maxAnnualTaxDeduction: Number(e.target.value),
                    })}
                    min={0}
                    step={1000}
                  />
                  <div className="text-sm text-muted-foreground">
                    Außergewöhnliche Belastungen nach deutschem Steuerrecht
                  </div>
                </div>
              )}
            </div>

            {planningMode === 'couple' && (
              <CoupleCareCostConfig
                values={values}
                onChange={onChange}
                currentYear={currentYear}
                nestingLevel={nestingLevel}
              />
            )}

            <CareCostValidationErrors
              errors={validationErrors}
              nestingLevel={nestingLevel}
            />

            {previewResult && previewResult.careNeeded && validationErrors.length === 0 && (
              <CareCostPreview
                previewYear={previewYear}
                previewResult={previewResult}
                nestingLevel={nestingLevel}
              />
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange(createDefaultCareCostConfiguration())}
              >
                Auf Standardwerte zurücksetzen
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
