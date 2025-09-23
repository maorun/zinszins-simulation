import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Info, ChevronDown } from 'lucide-react'
import { useNestingLevel } from '../lib/nesting-utils'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type { HealthInsuranceConfig } from '../../helpers/health-insurance'
import { defaultHealthInsuranceConfig } from '../../helpers/health-insurance'

interface HealthInsuranceFormValues {
  enabled: boolean
  retirementStartYear: number
  childless: boolean
  preRetirement: {
    health: {
      usePercentage: boolean
      percentage?: number
      fixedAmount?: number
    }
    care: {
      usePercentage: boolean
      percentage?: number
      fixedAmount?: number
      childlessSupplement?: number
    }
  }
  retirement: {
    health: {
      usePercentage: boolean
      percentage?: number
      fixedAmount?: number
    }
    care: {
      usePercentage: boolean
      percentage?: number
      fixedAmount?: number
      childlessSupplement?: number
    }
  }
}

interface HealthInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onRetirementStartYearChange: (year: number) => void
  onChildlessChange: (childless: boolean) => void
  onPreRetirementHealthMethodChange: (usePercentage: boolean) => void
  onPreRetirementHealthPercentageChange: (percentage: number) => void
  onPreRetirementHealthFixedAmountChange: (amount: number) => void
  onPreRetirementCareMethodChange: (usePercentage: boolean) => void
  onPreRetirementCarePercentageChange: (percentage: number) => void
  onPreRetirementCareFixedAmountChange: (amount: number) => void
  onPreRetirementCareChildlessSupplementChange: (supplement: number) => void
  onRetirementHealthMethodChange: (usePercentage: boolean) => void
  onRetirementHealthPercentageChange: (percentage: number) => void
  onRetirementHealthFixedAmountChange: (amount: number) => void
  onRetirementCareMethodChange: (usePercentage: boolean) => void
  onRetirementCarePercentageChange: (percentage: number) => void
  onRetirementCareFixedAmountChange: (amount: number) => void
  onRetirementCareChildlessSupplementChange: (supplement: number) => void
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
                    onChange={(e) => onChange.onRetirementStartYearChange(Number(e.target.value))}
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
              </div>

              {/* Pre-Retirement Configuration */}
              <Card nestingLevel={nestingLevel + 1}>
                <CardHeader nestingLevel={nestingLevel + 1}>
                  <CardTitle>Vorrente (vor Renteneintritt)</CardTitle>
                </CardHeader>
                <CardContent nestingLevel={nestingLevel + 1}>
                  <div className="space-y-4">
                    {/* Health Insurance - Pre-Retirement */}
                    <div className="space-y-3">
                      <Label className="font-medium">Krankenversicherung</Label>
                      <RadioTileGroup
                        value={values.preRetirement.health.usePercentage ? 'percentage' : 'fixed'}
                        onValueChange={(value) => onChange.onPreRetirementHealthMethodChange(value === 'percentage')}
                      >
                        <RadioTile value="percentage" label="Prozentual">
                          Beitragssatz basierend auf Entnahme
                        </RadioTile>
                        <RadioTile value="fixed" label="Festbetrag">
                          Fester monatlicher Betrag
                        </RadioTile>
                      </RadioTileGroup>
                      
                      {values.preRetirement.health.usePercentage ? (
                        <div className="space-y-2">
                          <Label htmlFor="pre-health-percentage">
                            Beitragssatz (%)
                          </Label>
                          <Input
                            id="pre-health-percentage"
                            type="number"
                            step="0.1"
                            value={values.preRetirement.health.percentage || 14.6}
                            onChange={(e) => onChange.onPreRetirementHealthPercentageChange(Number(e.target.value))}
                            min={0}
                            max={25}
                          />
                          <div className="text-sm text-gray-500">
                            Standard: 14,6% (gesetzlich versichert)
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="pre-health-fixed">
                            Monatlicher Betrag (€)
                          </Label>
                          <Input
                            id="pre-health-fixed"
                            type="number"
                            value={values.preRetirement.health.fixedAmount || 400}
                            onChange={(e) => onChange.onPreRetirementHealthFixedAmountChange(Number(e.target.value))}
                            min={0}
                            max={2000}
                          />
                        </div>
                      )}
                    </div>

                    {/* Care Insurance - Pre-Retirement */}
                    <div className="space-y-3">
                      <Label className="font-medium">Pflegeversicherung</Label>
                      <RadioTileGroup
                        value={values.preRetirement.care.usePercentage ? 'percentage' : 'fixed'}
                        onValueChange={(value) => onChange.onPreRetirementCareMethodChange(value === 'percentage')}
                      >
                        <RadioTile value="percentage" label="Prozentual">
                          Beitragssatz basierend auf Entnahme
                        </RadioTile>
                        <RadioTile value="fixed" label="Festbetrag">
                          Fester monatlicher Betrag
                        </RadioTile>
                      </RadioTileGroup>
                      
                      {values.preRetirement.care.usePercentage ? (
                        <div className="space-y-2">
                          <Label htmlFor="pre-care-percentage">
                            Beitragssatz (%)
                          </Label>
                          <Input
                            id="pre-care-percentage"
                            type="number"
                            step="0.01"
                            value={values.preRetirement.care.percentage || 3.05}
                            onChange={(e) => onChange.onPreRetirementCarePercentageChange(Number(e.target.value))}
                            min={0}
                            max={5}
                          />
                          <div className="text-sm text-gray-500">
                            Standard: 3,05%
                          </div>
                          
                          {values.childless && (
                            <div className="space-y-2">
                              <Label htmlFor="pre-care-childless">
                                Kinderloser Zuschlag (%)
                              </Label>
                              <Input
                                id="pre-care-childless"
                                type="number"
                                step="0.01"
                                value={values.preRetirement.care.childlessSupplement || 0.6}
                                onChange={(e) => onChange.onPreRetirementCareChildlessSupplementChange(Number(e.target.value))}
                                min={0}
                                max={2}
                              />
                              <div className="text-sm text-gray-500">
                                Standard: 0,6%
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="pre-care-fixed">
                            Monatlicher Betrag (€)
                          </Label>
                          <Input
                            id="pre-care-fixed"
                            type="number"
                            value={values.preRetirement.care.fixedAmount || 120}
                            onChange={(e) => onChange.onPreRetirementCareFixedAmountChange(Number(e.target.value))}
                            min={0}
                            max={500}
                          />
                          
                          {values.childless && (
                            <div className="space-y-2">
                              <Label htmlFor="pre-care-childless-fixed">
                                Kinderloser Zuschlag monatlich (€)
                              </Label>
                              <Input
                                id="pre-care-childless-fixed"
                                type="number"
                                value={values.preRetirement.care.childlessSupplement || 30}
                                onChange={(e) => onChange.onPreRetirementCareChildlessSupplementChange(Number(e.target.value))}
                                min={0}
                                max={100}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                    {/* Health Insurance - Retirement */}
                    <div className="space-y-3">
                      <Label className="font-medium">Krankenversicherung</Label>
                      <RadioTileGroup
                        value={values.retirement.health.usePercentage ? 'percentage' : 'fixed'}
                        onValueChange={(value) => onChange.onRetirementHealthMethodChange(value === 'percentage')}
                      >
                        <RadioTile value="percentage" label="Prozentual">
                          Beitragssatz basierend auf Entnahme
                        </RadioTile>
                        <RadioTile value="fixed" label="Festbetrag">
                          Fester monatlicher Betrag
                        </RadioTile>
                      </RadioTileGroup>
                      
                      {values.retirement.health.usePercentage ? (
                        <div className="space-y-2">
                          <Label htmlFor="ret-health-percentage">
                            Beitragssatz (%)
                          </Label>
                          <Input
                            id="ret-health-percentage"
                            type="number"
                            step="0.1"
                            value={values.retirement.health.percentage || 7.3}
                            onChange={(e) => onChange.onRetirementHealthPercentageChange(Number(e.target.value))}
                            min={0}
                            max={15}
                          />
                          <div className="text-sm text-gray-500">
                            Standard: 7,3% (Rentner ohne Arbeitgeberanteil)
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="ret-health-fixed">
                            Monatlicher Betrag (€)
                          </Label>
                          <Input
                            id="ret-health-fixed"
                            type="number"
                            value={values.retirement.health.fixedAmount || 300}
                            onChange={(e) => onChange.onRetirementHealthFixedAmountChange(Number(e.target.value))}
                            min={0}
                            max={1500}
                          />
                        </div>
                      )}
                    </div>

                    {/* Care Insurance - Retirement */}
                    <div className="space-y-3">
                      <Label className="font-medium">Pflegeversicherung</Label>
                      <RadioTileGroup
                        value={values.retirement.care.usePercentage ? 'percentage' : 'fixed'}
                        onValueChange={(value) => onChange.onRetirementCareMethodChange(value === 'percentage')}
                      >
                        <RadioTile value="percentage" label="Prozentual">
                          Beitragssatz basierend auf Entnahme
                        </RadioTile>
                        <RadioTile value="fixed" label="Festbetrag">
                          Fester monatlicher Betrag
                        </RadioTile>
                      </RadioTileGroup>
                      
                      {values.retirement.care.usePercentage ? (
                        <div className="space-y-2">
                          <Label htmlFor="ret-care-percentage">
                            Beitragssatz (%)
                          </Label>
                          <Input
                            id="ret-care-percentage"
                            type="number"
                            step="0.01"
                            value={values.retirement.care.percentage || 3.05}
                            onChange={(e) => onChange.onRetirementCarePercentageChange(Number(e.target.value))}
                            min={0}
                            max={5}
                          />
                          <div className="text-sm text-gray-500">
                            Standard: 3,05%
                          </div>
                          
                          {values.childless && (
                            <div className="space-y-2">
                              <Label htmlFor="ret-care-childless">
                                Kinderloser Zuschlag (%)
                              </Label>
                              <Input
                                id="ret-care-childless"
                                type="number"
                                step="0.01"
                                value={values.retirement.care.childlessSupplement || 0.6}
                                onChange={(e) => onChange.onRetirementCareChildlessSupplementChange(Number(e.target.value))}
                                min={0}
                                max={2}
                              />
                              <div className="text-sm text-gray-500">
                                Standard: 0,6%
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="ret-care-fixed">
                            Monatlicher Betrag (€)
                          </Label>
                          <Input
                            id="ret-care-fixed"
                            type="number"
                            value={values.retirement.care.fixedAmount || 100}
                            onChange={(e) => onChange.onRetirementCareFixedAmountChange(Number(e.target.value))}
                            min={0}
                            max={400}
                          />
                          
                          {values.childless && (
                            <div className="space-y-2">
                              <Label htmlFor="ret-care-childless-fixed">
                                Kinderloser Zuschlag monatlich (€)
                              </Label>
                              <Input
                                id="ret-care-childless-fixed"
                                type="number"
                                value={values.retirement.care.childlessSupplement || 25}
                                onChange={(e) => onChange.onRetirementCareChildlessSupplementChange(Number(e.target.value))}
                                min={0}
                                max={80}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Information */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <Info className="inline w-4 h-4 mr-2" />
                  <strong>Hinweise:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Die Beiträge werden vom jährlichen Entnahmebetrag abgezogen</li>
                    <li>Bei prozentualer Berechnung: Beitrag = Entnahme × Beitragssatz</li>
                    <li>Bei Festbetrag: Konstanter monatlicher Betrag unabhängig von der Entnahme</li>
                    <li>Kinderlose zahlen einen Zuschlag zur Pflegeversicherung</li>
                    <li>In der Rente entfällt der Arbeitgeberanteil bei der Krankenversicherung</li>
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