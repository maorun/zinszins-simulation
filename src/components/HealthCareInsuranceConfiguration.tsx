import { useEffect } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { ChevronDown, Info } from 'lucide-react'
import { useNestingLevel } from '../lib/nesting-utils'
import { formatCurrency } from '../utils/currency'
import { calculateRetirementStartYear } from '../../helpers/statutory-pension'

interface HealthCareInsuranceFormValues {
  enabled: boolean
  insuranceType: 'statutory' | 'private'
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  retirementStartYear: number
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
}

interface HealthCareInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onInsuranceTypeChange: (type: 'statutory' | 'private') => void
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryHealthInsuranceRateChange: (rate: number) => void
  onStatutoryCareInsuranceRateChange: (rate: number) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
  onRetirementStartYearChange: (year: number) => void
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
}

interface HealthCareInsuranceConfigurationProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  currentYear?: number
  // Birth year information for automatic retirement calculation
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
}

export function HealthCareInsuranceConfiguration({
  values,
  onChange,
  currentYear: _currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
}: HealthCareInsuranceConfigurationProps) {
  const nestingLevel = useNestingLevel()

  // Auto-calculate retirement start year when birth year changes
  useEffect(() => {
    const calculatedStartYear = calculateRetirementStartYear(
      planningMode,
      birthYear,
      spouseBirthYear,
      67, // Default retirement age
      67, // Default retirement age for spouse
    )

    if (calculatedStartYear && calculatedStartYear !== values.retirementStartYear) {
      onChange.onRetirementStartYearChange(calculatedStartYear)
    }
  }, [birthYear, spouseBirthYear, planningMode, values.retirementStartYear, onChange])

  if (!values.enabled) {
    return (
      <Collapsible defaultOpen={false}>
        <Card nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0"
              asChild
            >
              <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center gap-2">
                    🏥 Kranken- und Pflegeversicherung
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent nestingLevel={nestingLevel}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={values.enabled}
                    onCheckedChange={onChange.onEnabledChange}
                    id="health-care-insurance-enabled"
                  />
                  <Label htmlFor="health-care-insurance-enabled">
                    Kranken- und Pflegeversicherung berücksichtigen
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Aktivieren Sie diese Option, um Kranken- und Pflegeversicherungsbeiträge in die
                  Entnahmeplanung einzubeziehen. Berücksichtigt unterschiedliche Versicherungsarten und
                  Beitragssätze.
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0"
            asChild
          >
            <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  🏥 Kranken- und Pflegeversicherung
                  <span className="text-sm font-normal text-muted-foreground">
                    (
                    {values.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
                    )
                  </span>
                </CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={values.enabled}
                  onCheckedChange={onChange.onEnabledChange}
                  id="health-care-insurance-enabled-full"
                />
                <Label htmlFor="health-care-insurance-enabled-full">
                  Kranken- und Pflegeversicherung berücksichtigen
                </Label>
              </div>

              {/* Insurance Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Versicherungsart</Label>
                <RadioTileGroup
                  value={values.insuranceType}
                  onValueChange={value => onChange.onInsuranceTypeChange(value as 'statutory' | 'private')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <RadioTile value="statutory" label="Gesetzliche Krankenversicherung">
                    Prozentuale Beiträge basierend auf Einkommen mit festen Sätzen
                  </RadioTile>
                  <RadioTile value="private" label="Private Krankenversicherung">
                    Feste monatliche Beiträge mit Inflationsanpassung
                  </RadioTile>
                </RadioTileGroup>
              </div>

              {/* Automatic Retirement Start Year Display */}
              <div className="space-y-2">
                <Label>Rentenbeginn (automatisch berechnet)</Label>
                <div className="p-3 border rounded-lg bg-green-50">
                  {planningMode === 'individual' ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Basierend auf Geburtsjahr aus Globaler Planung:</span>
                        <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
                      </div>
                      <div className="text-lg font-bold text-green-800">
                        Rentenbeginn:
                        {' '}
                        {birthYear ? values.retirementStartYear : '—'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Person 1:</span>
                          <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Person 2:</span>
                          <div className="font-medium">{spouseBirthYear || 'Nicht festgelegt'}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-800">
                        Rentenbeginn (frühester):
                        {' '}
                        {(birthYear && spouseBirthYear) ? values.retirementStartYear : '—'}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    Jahr ab dem die Rentnerregelungen gelten (berechnet mit Renteneintrittsalter 67)
                  </div>
                  {!birthYear || (planningMode === 'couple' && !spouseBirthYear) ? (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 mt-2">
                      Bitte Geburtsjahr(e) in der Globalen Planung festlegen
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Statutory Insurance Configuration */}
              {values.insuranceType === 'statutory' && (
                <div className="space-y-6">
                  {/* Employer Contribution Setting */}
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={values.includeEmployerContribution}
                        onCheckedChange={onChange.onIncludeEmployerContributionChange}
                        id="include-employer-contribution"
                      />
                      <Label htmlFor="include-employer-contribution">
                        Arbeitgeberanteil in Entnahme-Phase berücksichtigen
                      </Label>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Standard: Arbeitgeberanteil muss in der Entnahme-Phase selbst getragen werden.
                      Deaktivieren Sie diese Option, wenn nur der Arbeitnehmeranteil gezahlt wird.
                    </div>
                  </div>

                  {/* Statutory Rates */}
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Gesetzliche Beitragssätze (Deutschland 2024)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="statutory-health-rate">
                          Krankenversicherung:
                          {' '}
                          {values.statutoryHealthInsuranceRate.toFixed(2)}
                          %
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          Gesetzlich festgelegt: 14,6% (7,3% Arbeitnehmer + 7,3% Arbeitgeber)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="statutory-care-rate">
                          Pflegeversicherung:
                          {' '}
                          {values.statutoryCareInsuranceRate.toFixed(2)}
                          %
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          Gesetzlich festgelegt: 3,05% (+ 0,6% für Kinderlose)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Income Limits */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm">Beitragsbemessungsgrenzen</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="statutory-min-income">
                          Mindestbeitragsbemessungsgrundlage (jährlich)
                        </Label>
                        <Input
                          id="statutory-min-income"
                          type="number"
                          min="0"
                          step="100"
                          value={values.statutoryMinimumIncomeBase}
                          onChange={e => onChange.onStatutoryMinimumIncomeBaseChange(Number(e.target.value))}
                        />
                        <div className="text-xs text-muted-foreground">
                          Mindestbeitrag wird auch bei geringerem Einkommen erhoben
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="statutory-max-income">
                          Beitragsbemessungsgrenze (jährlich)
                        </Label>
                        <Input
                          id="statutory-max-income"
                          type="number"
                          min="0"
                          step="1000"
                          value={values.statutoryMaximumIncomeBase}
                          onChange={e => onChange.onStatutoryMaximumIncomeBaseChange(Number(e.target.value))}
                        />
                        <div className="text-xs text-muted-foreground">
                          Maximale Beitragsbemessungsgrundlage (2024: 62.550€)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Private Insurance Configuration */}
              {values.insuranceType === 'private' && (
                <div className="space-y-6">
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-sm">Private Versicherungsbeiträge</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="private-health-monthly">
                          Krankenversicherung (monatlich)
                        </Label>
                        <Input
                          id="private-health-monthly"
                          type="number"
                          min="0"
                          step="10"
                          value={values.privateHealthInsuranceMonthly}
                          onChange={e => onChange.onPrivateHealthInsuranceMonthlyChange(Number(e.target.value))}
                          placeholder="z.B. 450"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="private-care-monthly">
                          Pflegeversicherung (monatlich)
                        </Label>
                        <Input
                          id="private-care-monthly"
                          type="number"
                          min="0"
                          step="5"
                          value={values.privateCareInsuranceMonthly}
                          onChange={e => onChange.onPrivateCareInsuranceMonthlyChange(Number(e.target.value))}
                          placeholder="z.B. 60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="private-inflation-rate">
                          Jährliche Steigerung:
                          {' '}
                          {values.privateInsuranceInflationRate.toFixed(1)}
                          %
                        </Label>
                        <Slider
                          id="private-inflation-rate"
                          min={0}
                          max={5}
                          step={0.1}
                          value={[values.privateInsuranceInflationRate]}
                          onValueChange={([value]) => onChange.onPrivateInsuranceInflationRateChange(value)}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                          Typisch: 2-4% jährliche Beitragssteigerung
                        </div>
                      </div>
                    </div>

                    {values.privateHealthInsuranceMonthly > 0 && values.privateCareInsuranceMonthly > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Gesamt pro Monat:</strong>
                        {' '}
                        {formatCurrency(values.privateHealthInsuranceMonthly + values.privateCareInsuranceMonthly)}
                        {' '}
                        <strong>pro Jahr:</strong>
                        {' '}
                        {formatCurrency(
                          (values.privateHealthInsuranceMonthly + values.privateCareInsuranceMonthly) * 12,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Care Insurance for Childless */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={values.additionalCareInsuranceForChildless}
                    onCheckedChange={onChange.onAdditionalCareInsuranceForChildlessChange}
                    id="additional-care-insurance"
                  />
                  <Label htmlFor="additional-care-insurance">
                    Zusätzlicher Pflegeversicherungsbeitrag für Kinderlose
                  </Label>
                </div>

                {values.additionalCareInsuranceForChildless && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="additional-care-age">
                      Ab Alter:
                      {' '}
                      {values.additionalCareInsuranceAge}
                      {' '}
                      Jahre
                    </Label>
                    <Slider
                      id="additional-care-age"
                      min={18}
                      max={35}
                      step={1}
                      value={[values.additionalCareInsuranceAge]}
                      onValueChange={([value]) => onChange.onAdditionalCareInsuranceAgeChange(value)}
                      className="w-32"
                    />
                    <div className="text-xs text-muted-foreground">
                      Zusätzlich 0,6% Pflegeversicherung ab diesem Alter
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
