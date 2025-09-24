import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Info, ChevronDown } from 'lucide-react'
import { useNestingLevel } from '../lib/nesting-utils'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type {
  StatutoryHealthInsuranceConfig,
  PrivateHealthInsuranceConfig,
  HealthInsuranceType,
} from '../../helpers/health-insurance'

interface HealthInsuranceFormValues {
  enabled: boolean
  retirementStartYear: number
  childless: boolean
  employeeOnly: boolean
  preRetirementType: HealthInsuranceType
  retirementType: HealthInsuranceType
  preRetirement: {
    statutory?: StatutoryHealthInsuranceConfig
    private?: PrivateHealthInsuranceConfig
  }
  retirement: {
    statutory?: StatutoryHealthInsuranceConfig
    private?: PrivateHealthInsuranceConfig
  }
}

interface HealthInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onRetirementStartYearChange: (year: number) => void
  onChildlessChange: (childless: boolean) => void
  onEmployeeOnlyChange: (employeeOnly: boolean) => void
  onPreRetirementTypeChange: (type: HealthInsuranceType) => void
  onRetirementTypeChange: (type: HealthInsuranceType) => void
  onPreRetirementStatutoryChange: (config: Partial<StatutoryHealthInsuranceConfig>) => void
  onPreRetirementPrivateChange: (config: Partial<PrivateHealthInsuranceConfig>) => void
  onRetirementStatutoryChange: (config: Partial<StatutoryHealthInsuranceConfig>) => void
  onRetirementPrivateChange: (config: Partial<PrivateHealthInsuranceConfig>) => void
}

interface HealthInsuranceConfigurationProps {
  values: HealthInsuranceFormValues
  onChange: HealthInsuranceChangeHandlers
  currentYear?: number
}

export function HealthInsuranceConfiguration({
  values,
  onChange,
  currentYear = new Date().getFullYear(),
}: HealthInsuranceConfigurationProps) {
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="health-insurance-enabled">
                    Kranken- und Pflegeversicherung berücksichtigen
                  </Label>
                  <Switch
                    id="health-insurance-enabled"
                    checked={values.enabled}
                    onCheckedChange={onChange.onEnabledChange}
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <Info className="inline w-4 h-4 mr-2" />
                    Aktivieren Sie diese Option, um Kranken- und Pflegeversicherungsbeiträge
                    in der Entnahmephase zu berücksichtigen. Die Beiträge werden vom
                    Entnahmebetrag abgezogen.
                  </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="health-insurance-enabled">
                  Kranken- und Pflegeversicherung berücksichtigen
                </Label>
                <Switch
                  id="health-insurance-enabled"
                  checked={values.enabled}
                  onCheckedChange={onChange.onEnabledChange}
                />
              </div>

              {/* Global Configuration */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="retirement-start-year">
                    Renteneintritt (Jahr)
                  </Label>
                  <Input
                    id="retirement-start-year"
                    type="number"
                    value={values.retirementStartYear}
                    onChange={e => onChange.onRetirementStartYearChange(Number(e.target.value))}
                    min={currentYear}
                    max={currentYear + 50}
                  />
                  <div className="text-sm text-gray-500">
                    Ab diesem Jahr gelten die reduzierten Rentner-Beitragssätze
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="childless">
                    Kinderlos (Zuschlag zur Pflegeversicherung)
                  </Label>
                  <Switch
                    id="childless"
                    checked={values.childless}
                    onCheckedChange={onChange.onChildlessChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="employee-only">
                      Nur Arbeitnehmeranteil zahlen
                    </Label>
                    <div className="text-sm text-gray-500">
                      Standard: Vollbeitrag (als Privatier). Aktivieren für Arbeitnehmeranteil.
                    </div>
                  </div>
                  <Switch
                    id="employee-only"
                    checked={values.employeeOnly}
                    onCheckedChange={onChange.onEmployeeOnlyChange}
                  />
                </div>
              </div>

              {/* Pre-Retirement Configuration */}
              <Card nestingLevel={nestingLevel + 1}>
                <CardHeader nestingLevel={nestingLevel + 1}>
                  <CardTitle>Vorrente (vor Renteneintritt)</CardTitle>
                </CardHeader>
                <CardContent nestingLevel={nestingLevel + 1}>
                  <div className="space-y-4">
                    {/* Insurance Type Selection */}
                    <div className="space-y-3">
                      <Label className="font-medium">Versicherungsart</Label>
                      <RadioTileGroup
                        value={values.preRetirementType}
                        onValueChange={value => onChange.onPreRetirementTypeChange(value as HealthInsuranceType)}
                        idPrefix="pre-retirement-insurance"
                      >
                        <RadioTile value="statutory" label="Gesetzliche Krankenversicherung">
                          Standard-Beitragssätze mit Beitragsbemessungsgrenzen
                        </RadioTile>
                        <RadioTile value="private" label="Private Krankenversicherung">
                          Feste monatliche Beiträge mit jährlichen Anpassungen
                        </RadioTile>
                      </RadioTileGroup>
                    </div>

                    {/* Statutory Insurance Configuration */}
                    {values.preRetirementType === 'statutory' && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">
                          Gesetzliche Krankenversicherung - Vorrente
                        </div>

                        <div className="flex flex-col space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                          <div className="space-y-2">
                            <Label htmlFor="pre-statutory-health-rate">
                              Krankenversicherung (%)
                            </Label>
                            <Input
                              id="pre-statutory-health-rate"
                              type="number"
                              step="0.1"
                              value={values.preRetirement.statutory?.healthRate || 14.6}
                              onChange={e => onChange.onPreRetirementStatutoryChange({
                                healthRate: Number(e.target.value),
                              })}
                              min={0}
                              max={20}
                            />
                            <div className="text-xs text-gray-500">
                              Standard: 14,6%
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pre-statutory-care-rate">
                              Pflegeversicherung (%)
                            </Label>
                            <Input
                              id="pre-statutory-care-rate"
                              type="number"
                              step="0.01"
                              value={values.preRetirement.statutory?.careRate || 3.05}
                              onChange={e => onChange.onPreRetirementStatutoryChange({
                                careRate: Number(e.target.value),
                              })}
                              min={0}
                              max={5}
                            />
                            <div className="text-xs text-gray-500">
                              Standard: 3,05%
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pre-statutory-ceiling">
                            Beitragsbemessungsgrenze (jährlich)
                          </Label>
                          <Input
                            id="pre-statutory-ceiling"
                            type="number"
                            value={values.preRetirement.statutory?.contributionAssessmentCeiling || 62100}
                            onChange={e => onChange.onPreRetirementStatutoryChange({
                              contributionAssessmentCeiling: Number(e.target.value),
                            })}
                            min={30000}
                            max={100000}
                          />
                          <div className="text-xs text-gray-500">
                            Standard: 62.100€ (2024)
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Private Insurance Configuration */}
                    {values.preRetirementType === 'private' && (
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-700">
                          Private Krankenversicherung - Vorrente
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pre-private-health-premium">
                              Krankenversicherung (monatlich)
                            </Label>
                            <Input
                              id="pre-private-health-premium"
                              type="number"
                              value={values.preRetirement.private?.monthlyHealthPremium || 400}
                              onChange={e => onChange.onPreRetirementPrivateChange({
                                monthlyHealthPremium: Number(e.target.value),
                              })}
                              min={100}
                              max={1500}
                            />
                            <div className="text-xs text-gray-500">
                              Euro pro Monat
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pre-private-care-premium">
                              Pflegeversicherung (monatlich)
                            </Label>
                            <Input
                              id="pre-private-care-premium"
                              type="number"
                              value={values.preRetirement.private?.monthlyCareRemium || 80}
                              onChange={e => onChange.onPreRetirementPrivateChange({
                                monthlyCareRemium: Number(e.target.value),
                              })}
                              min={20}
                              max={300}
                            />
                            <div className="text-xs text-gray-500">
                              Euro pro Monat
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="pre-private-adjustment">
                            Jährliche Anpassung:
                            {' '}
                            {(((values.preRetirement.private?.annualAdjustmentRate || 1.03) - 1) * 100).toFixed(1)}
                            %
                          </Label>
                          <Slider
                            id="pre-private-adjustment"
                            value={[((values.preRetirement.private?.annualAdjustmentRate || 1.03) - 1) * 100]}
                            onValueChange={([value]) => onChange.onPreRetirementPrivateChange({
                              annualAdjustmentRate: 1 + (value / 100),
                            })}
                            min={0}
                            max={8}
                            step={0.1}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>0%</span>
                            <span>8%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Standard: 3% (Beitragsanpassung pro Jahr)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Retirement Configuration */}
              <Card nestingLevel={nestingLevel + 1}>
                <CardHeader nestingLevel={nestingLevel + 1}>
                  <CardTitle>Rente (nach Renteneintritt)</CardTitle>
                </CardHeader>
                <CardContent nestingLevel={nestingLevel + 1}>
                  <div className="space-y-4">
                    {/* Insurance Type Selection */}
                    <div className="space-y-3">
                      <Label className="font-medium">Versicherungsart</Label>
                      <RadioTileGroup
                        value={values.retirementType}
                        onValueChange={value => onChange.onRetirementTypeChange(value as HealthInsuranceType)}
                        idPrefix="retirement-insurance"
                      >
                        <RadioTile value="statutory" label="Gesetzliche Krankenversicherung">
                          Standard-Beitragssätze mit Beitragsbemessungsgrenzen
                        </RadioTile>
                        <RadioTile value="private" label="Private Krankenversicherung">
                          Feste monatliche Beiträge mit jährlichen Anpassungen
                        </RadioTile>
                      </RadioTileGroup>
                    </div>

                    {/* Statutory Insurance Configuration */}
                    {values.retirementType === 'statutory' && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">
                          Gesetzliche Krankenversicherung - Rente
                        </div>

                        <div className="flex flex-col space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                          <div className="space-y-2">
                            <Label htmlFor="ret-statutory-health-rate">
                              Krankenversicherung (%)
                            </Label>
                            <Input
                              id="ret-statutory-health-rate"
                              type="number"
                              step="0.1"
                              value={values.retirement.statutory?.healthRate || 7.3}
                              onChange={e => onChange.onRetirementStatutoryChange({
                                healthRate: Number(e.target.value),
                              })}
                              min={0}
                              max={15}
                            />
                            <div className="text-xs text-gray-500">
                              Standard: 7,3% (ohne Arbeitgeberanteil)
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ret-statutory-care-rate">
                              Pflegeversicherung (%)
                            </Label>
                            <Input
                              id="ret-statutory-care-rate"
                              type="number"
                              step="0.01"
                              value={values.retirement.statutory?.careRate || 3.05}
                              onChange={e => onChange.onRetirementStatutoryChange({
                                careRate: Number(e.target.value),
                              })}
                              min={0}
                              max={5}
                            />
                            <div className="text-xs text-gray-500">
                              Standard: 3,05%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Private Insurance Configuration */}
                    {values.retirementType === 'private' && (
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-700">
                          Private Krankenversicherung - Rente
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ret-private-health-premium">
                              Krankenversicherung (monatlich)
                            </Label>
                            <Input
                              id="ret-private-health-premium"
                              type="number"
                              value={values.retirement.private?.monthlyHealthPremium || 450}
                              onChange={e => onChange.onRetirementPrivateChange({
                                monthlyHealthPremium: Number(e.target.value),
                              })}
                              min={150}
                              max={2000}
                            />
                            <div className="text-xs text-gray-500">
                              Euro pro Monat
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ret-private-care-premium">
                              Pflegeversicherung (monatlich)
                            </Label>
                            <Input
                              id="ret-private-care-premium"
                              type="number"
                              value={values.retirement.private?.monthlyCareRemium || 90}
                              onChange={e => onChange.onRetirementPrivateChange({
                                monthlyCareRemium: Number(e.target.value),
                              })}
                              min={30}
                              max={400}
                            />
                            <div className="text-xs text-gray-500">
                              Euro pro Monat
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="ret-private-adjustment">
                            Jährliche Anpassung:
                            {' '}
                            {(((values.retirement.private?.annualAdjustmentRate || 1.03) - 1) * 100).toFixed(1)}
                            %
                          </Label>
                          <Slider
                            id="ret-private-adjustment"
                            value={[((values.retirement.private?.annualAdjustmentRate || 1.03) - 1) * 100]}
                            onValueChange={([value]) => onChange.onRetirementPrivateChange({
                              annualAdjustmentRate: 1 + (value / 100),
                            })}
                            min={0}
                            max={8}
                            step={0.1}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>0%</span>
                            <span>8%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Standard: 3% (Beitragsanpassung pro Jahr)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Information */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <Info className="inline w-4 h-4 mr-2" />
                  <strong>Hinweise:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Gesetzliche KV:</strong>
                      {' '}
                      Beiträge basieren auf Entnahmebeträgen mit Mindest-/Höchstbeitrag
                    </li>
                    <li>
                      <strong>Private KV:</strong>
                      {' '}
                      Feste monatliche Beiträge unabhängig von der Entnahme
                    </li>
                    <li>
                      <strong>Kinderlose:</strong>
                      {' '}
                      Zahlen 0,6% Zuschlag zur Pflegeversicherung
                    </li>
                    <li>
                      <strong>Rentner-Beitragssätze:</strong>
                      {' '}
                      Reduzierte Sätze ab dem konfigurierten Renteneintritt
                    </li>
                    <li>
                      <strong>Alle Beiträge:</strong>
                      {' '}
                      Werden vom jährlichen Entnahmebetrag abgezogen
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
