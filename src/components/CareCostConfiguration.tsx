import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Button } from './ui/button'
import { Info, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import {
  type CareCostConfiguration,
  type CareLevel,
  DEFAULT_CARE_LEVELS,
  createDefaultCareCostConfiguration,
  calculateCareCostsForYear,
  getCareLevelDisplayName,
  validateCareCostConfiguration,
} from '../../helpers/care-cost-simulation'

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
  // Validate configuration
  const validationErrors = validateCareCostConfiguration(values)

  // Calculate preview costs for demonstration
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
        {/* Enable/Disable Care Cost Simulation */}
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
            {/* Start Year */}
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

            {/* Care Level Selection */}
            <div className="space-y-3">
              <Label>Erwarteter Pflegegrad</Label>
              <RadioTileGroup
                value={values.careLevel.toString()}
                onValueChange={value => onChange({ ...values, careLevel: Number(value) as CareLevel })}
              >
                {[1, 2, 3, 4, 5].map((level) => {
                  const careLevelInfo = DEFAULT_CARE_LEVELS[level as CareLevel]
                  return (
                    <RadioTile
                      key={level}
                      value={level.toString()}
                      label={careLevelInfo.name}
                    >
                      <div className="text-sm text-muted-foreground mt-1">
                        {careLevelInfo.description}
                      </div>
                      <div className="text-sm mt-2">
                        <div className="flex justify-between items-center">
                          <span>Pflegegeld:</span>
                          <span className="font-medium">
                            {careLevelInfo.careAllowance > 0
                              ? formatCurrency(careLevelInfo.careAllowance)
                              : 'Kein Pflegegeld'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Typische Kosten:</span>
                          <span className="font-medium">
                            {formatCurrency(careLevelInfo.typicalMonthlyCost)}
                            /Monat
                          </span>
                        </div>
                      </div>
                    </RadioTile>
                  )
                })}
              </RadioTileGroup>
            </div>

            {/* Custom Monthly Costs */}
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

            {/* Care Inflation Rate */}
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

            {/* Care Duration */}
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

            {/* Statutory Benefits */}
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

            {/* Private Care Insurance */}
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

            {/* Tax Deductibility */}
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

            {/* Couple Configuration */}
            {planningMode === 'couple' && (
              <Card nestingLevel={nestingLevel + 1} className="bg-blue-50 border-blue-200">
                <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    👫 Paar-Konfiguration
                  </CardTitle>
                </CardHeader>
                <CardContent nestingLevel={nestingLevel + 1} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={values.coupleConfig?.person2NeedsCare || false}
                      onCheckedChange={person2NeedsCare => onChange({
                        ...values,
                        coupleConfig: {
                          ...values.coupleConfig,
                          person2NeedsCare,
                          person2StartYear: person2NeedsCare
                            ? (values.coupleConfig?.person2StartYear || values.startYear + 2)
                            : undefined,
                          person2CareLevel: person2NeedsCare
                            ? (values.coupleConfig?.person2CareLevel || values.careLevel)
                            : undefined,
                        },
                      })}
                      id="person2-needs-care"
                    />
                    <Label htmlFor="person2-needs-care" className="text-sm">
                      Auch Person 2 wird pflegebedürftig
                    </Label>
                  </div>

                  {values.coupleConfig?.person2NeedsCare && (
                    <div className="space-y-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="person2-start-year">
                          Startjahr für Person 2
                        </Label>
                        <Input
                          id="person2-start-year"
                          type="number"
                          value={values.coupleConfig?.person2StartYear || ''}
                          onChange={e => onChange({
                            ...values,
                            coupleConfig: {
                              ...values.coupleConfig,
                              person2NeedsCare: true,
                              person2StartYear: Number(e.target.value),
                            },
                          })}
                          min={currentYear}
                          max={currentYear + 50}
                          step={1}
                          className="w-32"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Pflegegrad für Person 2</Label>
                        <RadioTileGroup
                          value={(values.coupleConfig?.person2CareLevel || values.careLevel).toString()}
                          onValueChange={value => onChange({
                            ...values,
                            coupleConfig: {
                              ...values.coupleConfig,
                              person2NeedsCare: true,
                              person2CareLevel: Number(value) as CareLevel,
                            },
                          })}
                        >
                          {[1, 2, 3, 4, 5].map(level => (
                            <RadioTile
                              key={level}
                              value={level.toString()}
                              label={`Pflegegrad ${level}`}
                            >
                              <div className="text-xs text-muted-foreground">
                                {DEFAULT_CARE_LEVELS[level as CareLevel].description}
                              </div>
                            </RadioTile>
                          ))}
                        </RadioTileGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="person2-duration">
                          Pflegedauer für Person 2 (Jahre, 0 = bis Lebensende)
                        </Label>
                        <Input
                          id="person2-duration"
                          type="number"
                          value={values.coupleConfig?.person2CareDurationYears || 0}
                          onChange={e => onChange({
                            ...values,
                            coupleConfig: {
                              ...values.coupleConfig,
                              person2NeedsCare: true,
                              person2CareDurationYears: Number(e.target.value),
                            },
                          })}
                          min={0}
                          max={50}
                          step={1}
                          className="w-32"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Card nestingLevel={nestingLevel + 1} className="bg-red-50 border-red-200">
                <CardContent nestingLevel={nestingLevel + 1} className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <div className="font-medium mb-1">Konfigurationsfehler:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost Preview */}
            {previewResult && previewResult.careNeeded && validationErrors.length === 0 && (
              <Card nestingLevel={nestingLevel + 1} className="bg-green-50 border-green-200">
                <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Kostenvorschau für
                    {' '}
                    {previewYear}
                  </CardTitle>
                </CardHeader>
                <CardContent nestingLevel={nestingLevel + 1}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Brutto-Pflegekosten:</span>
                      <br />
                      {formatCurrency(previewResult.monthlyCostsGross)}
                      /Monat
                    </div>
                    <div>
                      <span className="font-medium">Gesetzliche Leistungen:</span>
                      <br />
                      {formatCurrency(previewResult.monthlyStatutoryBenefits)}
                      /Monat
                    </div>
                    <div>
                      <span className="font-medium">Private Leistungen:</span>
                      <br />
                      {formatCurrency(previewResult.monthlyPrivateBenefits)}
                      /Monat
                    </div>
                    <div>
                      <span className="font-medium">Netto-Eigenanteil:</span>
                      <br />
                      <span className="text-lg font-semibold text-green-800">
                        {formatCurrency(previewResult.monthlyCostsNet)}
                        /Monat
                      </span>
                    </div>
                    <div className="md:col-span-2 pt-2 border-t border-green-300">
                      <span className="font-medium">Jährliche Netto-Kosten:</span>
                      <br />
                      <span className="text-lg font-semibold text-green-800">
                        {formatCurrency(previewResult.annualCostsNet)}
                      </span>
                      {previewResult.taxDeductionAmount > 0 && (
                        <>
                          <br />
                          <span className="text-sm text-muted-foreground">
                            Steuerabzug:
                            {' '}
                            {formatCurrency(previewResult.taxDeductionAmount)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Couple Results */}
                    {previewResult.coupleResults && (
                      <div className="md:col-span-2 pt-2 border-t border-green-300">
                        <div className="font-medium mb-2">Paar-Aufschlüsselung:</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Person 1:</span>
                            <br />
                            {previewResult.coupleResults.person1.needsCare
                              ? `${formatCurrency(previewResult.coupleResults.person1.monthlyCostsNet)}/Monat`
                              : 'Keine Pflege benötigt'}
                          </div>
                          <div>
                            <span className="font-medium">Person 2:</span>
                            <br />
                            {previewResult.coupleResults.person2.needsCare
                              ? `${formatCurrency(previewResult.coupleResults.person2.monthlyCostsNet)}/Monat`
                              : 'Keine Pflege benötigt'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reset to Defaults */}
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
