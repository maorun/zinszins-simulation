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

interface HealthCareInsuranceFormValues {
  enabled: boolean
  healthInsuranceRatePreRetirement: number
  careInsuranceRatePreRetirement: number
  healthInsuranceRateRetirement: number
  careInsuranceRateRetirement: number
  retirementStartYear: number
  useFixedAmounts: boolean
  fixedHealthInsuranceMonthly?: number
  fixedCareInsuranceMonthly?: number
  healthInsuranceIncomeThreshold?: number
  careInsuranceIncomeThreshold?: number
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
}

interface HealthCareInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onHealthInsuranceRatePreRetirementChange: (rate: number) => void
  onCareInsuranceRatePreRetirementChange: (rate: number) => void
  onHealthInsuranceRateRetirementChange: (rate: number) => void
  onCareInsuranceRateRetirementChange: (rate: number) => void
  onRetirementStartYearChange: (year: number) => void
  onUseFixedAmountsChange: (useFixed: boolean) => void
  onFixedHealthInsuranceMonthlyChange: (amount: number) => void
  onFixedCareInsuranceMonthlyChange: (amount: number) => void
  onHealthInsuranceIncomeThresholdChange: (threshold: number) => void
  onCareInsuranceIncomeThresholdChange: (threshold: number) => void
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
}

interface HealthCareInsuranceConfigurationProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  currentYear?: number
}

export function HealthCareInsuranceConfiguration({
  values,
  onChange,
  currentYear = new Date().getFullYear(),
}: HealthCareInsuranceConfigurationProps) {
  const nestingLevel = useNestingLevel()

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
                  Aktivieren Sie diese Option, um Kranken- und Pflegeversicherungsbeiträge in die Entnahmeplanung einzubeziehen.
                  Berücksichtigt unterschiedliche Beitragssätze vor und während der Rente.
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
                    ({values.useFixedAmounts ? 'Feste Beiträge' : 'Prozentuale Beiträge'})
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

              {/* Calculation Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Berechnungsart</Label>
                <RadioTileGroup
                  value={values.useFixedAmounts ? 'fixed' : 'percentage'}
                  onValueChange={(value) => onChange.onUseFixedAmountsChange(value === 'fixed')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <RadioTile value="percentage" label="Prozentuale Beiträge">
                    Basierend auf Einkommen (Entnahme + Rente)
                  </RadioTile>
                  <RadioTile value="fixed" label="Feste monatliche Beiträge">
                    Feste Beträge unabhängig vom Einkommen
                  </RadioTile>
                </RadioTileGroup>
              </div>

              {/* Fixed Amounts Configuration */}
              {values.useFixedAmounts && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm">Feste monatliche Beiträge</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fixed-health-insurance">
                        Krankenversicherung (monatlich)
                      </Label>
                      <Input
                        id="fixed-health-insurance"
                        type="number"
                        min="0"
                        step="10"
                        value={values.fixedHealthInsuranceMonthly || ''}
                        onChange={(e) => onChange.onFixedHealthInsuranceMonthlyChange(Number(e.target.value))}
                        placeholder="z.B. 400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fixed-care-insurance">
                        Pflegeversicherung (monatlich)
                      </Label>
                      <Input
                        id="fixed-care-insurance"
                        type="number"
                        min="0"
                        step="10"
                        value={values.fixedCareInsuranceMonthly || ''}
                        onChange={(e) => onChange.onFixedCareInsuranceMonthlyChange(Number(e.target.value))}
                        placeholder="z.B. 150"
                      />
                    </div>
                  </div>

                  {values.fixedHealthInsuranceMonthly && values.fixedCareInsuranceMonthly && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Gesamt pro Monat:</strong> {formatCurrency((values.fixedHealthInsuranceMonthly + values.fixedCareInsuranceMonthly))}
                      {' '}
                      <strong>pro Jahr:</strong> {formatCurrency((values.fixedHealthInsuranceMonthly + values.fixedCareInsuranceMonthly) * 12)}
                    </div>
                  )}
                </div>
              )}

              {/* Percentage-Based Configuration */}
              {!values.useFixedAmounts && (
                <div className="space-y-6">
                  {/* Retirement Start Year */}
                  <div className="space-y-2">
                    <Label htmlFor="retirement-start-year">
                      Rentenbeginn (Jahr)
                    </Label>
                    <Input
                      id="retirement-start-year"
                      type="number"
                      min={currentYear}
                      max={currentYear + 50}
                      value={values.retirementStartYear}
                      onChange={(e) => onChange.onRetirementStartYearChange(Number(e.target.value))}
                    />
                    <div className="text-xs text-muted-foreground">
                      Ab diesem Jahr gelten die Renten-Beitragssätze (normalerweise niedriger)
                    </div>
                  </div>

                  {/* Pre-Retirement Rates */}
                  <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Beitragssätze vor Rentenbeginn (Vorrente)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="health-rate-pre">
                          Krankenversicherung: {values.healthInsuranceRatePreRetirement.toFixed(2)}%
                        </Label>
                        <Slider
                          id="health-rate-pre"
                          min={10}
                          max={20}
                          step={0.1}
                          value={[values.healthInsuranceRatePreRetirement]}
                          onValueChange={([value]) => onChange.onHealthInsuranceRatePreRetirementChange(value)}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                          Typisch: 14,6% (Arbeitnehmer + Arbeitgeber)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="care-rate-pre">
                          Pflegeversicherung: {values.careInsuranceRatePreRetirement.toFixed(2)}%
                        </Label>
                        <Slider
                          id="care-rate-pre"
                          min={2}
                          max={5}
                          step={0.05}
                          value={[values.careInsuranceRatePreRetirement]}
                          onValueChange={([value]) => onChange.onCareInsuranceRatePreRetirementChange(value)}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                          Typisch: 3,05% (+ 0,6% für Kinderlose)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retirement Rates */}
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Beitragssätze während der Rente
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="health-rate-retirement">
                          Krankenversicherung: {values.healthInsuranceRateRetirement.toFixed(2)}%
                        </Label>
                        <Slider
                          id="health-rate-retirement"
                          min={5}
                          max={15}
                          step={0.1}
                          value={[values.healthInsuranceRateRetirement]}
                          onValueChange={([value]) => onChange.onHealthInsuranceRateRetirementChange(value)}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                          Typisch: 7,3% (nur Rentneranteil)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="care-rate-retirement">
                          Pflegeversicherung: {values.careInsuranceRateRetirement.toFixed(2)}%
                        </Label>
                        <Slider
                          id="care-rate-retirement"
                          min={2}
                          max={5}
                          step={0.05}
                          value={[values.careInsuranceRateRetirement]}
                          onValueChange={([value]) => onChange.onCareInsuranceRateRetirementChange(value)}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">
                          Typisch: 3,05% (gleicher Satz wie vor Rente)
                        </div>
                      </div>
                    </div>
                  </div>

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
                          Ab Alter: {values.additionalCareInsuranceAge} Jahre
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

                  {/* Income Thresholds */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm">Beitragsbemessungsgrenzen (optional)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="health-threshold">
                          Krankenversicherung (jährlich)
                        </Label>
                        <Input
                          id="health-threshold"
                          type="number"
                          min="0"
                          step="1000"
                          value={values.healthInsuranceIncomeThreshold || ''}
                          onChange={(e) => onChange.onHealthInsuranceIncomeThresholdChange(Number(e.target.value))}
                          placeholder="z.B. 62550 (2024)"
                        />
                        <div className="text-xs text-muted-foreground">
                          Leer lassen für keine Obergrenze
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="care-threshold">
                          Pflegeversicherung (jährlich)
                        </Label>
                        <Input
                          id="care-threshold"
                          type="number"
                          min="0"
                          step="1000"
                          value={values.careInsuranceIncomeThreshold || ''}
                          onChange={(e) => onChange.onCareInsuranceIncomeThresholdChange(Number(e.target.value))}
                          placeholder="z.B. 62550 (2024)"
                        />
                        <div className="text-xs text-muted-foreground">
                          Leer lassen für keine Obergrenze
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}