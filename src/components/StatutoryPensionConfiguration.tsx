import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { CollapsibleCard, CollapsibleCardHeader, CollapsibleCardContent } from './ui/collapsible-card'
import { Info, ChevronDown } from 'lucide-react'
import { useNestingLevel } from '../lib/nesting-utils'
import { useFormId } from '../utils/unique-id'
import {
  calculateRetirementStartYear,
  type CoupleStatutoryPensionConfig,
  type IndividualStatutoryPensionConfig,
  createDefaultCoupleStatutoryPensionConfig,
} from '../../helpers/statutory-pension'
import { PensionInputForm } from './statutory-pension/PensionInputForm'
import { usePensionCalculations } from '../hooks/usePensionCalculations'

/** Summary information component for statutory pension */
interface PensionSummaryProps {
  startYear: number
  monthlyAmount: number
  taxablePercentage: number
  nestingLevel: number
}

function PensionSummary({
  startYear,
  monthlyAmount,
  taxablePercentage,
  nestingLevel,
}: PensionSummaryProps) {
  return (
    <Card nestingLevel={nestingLevel + 1}>
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          Zusammenfassung
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Rentenbeginn:</span>
            {' '}
            {startYear}
          </div>
          <div>
            <span className="font-medium">Monatliche Rente:</span>
            {' '}
            {monthlyAmount.toLocaleString('de-DE')}
            {' '}
            €
          </div>
          <div>
            <span className="font-medium">Jährliche Rente:</span>
            {' '}
            {(monthlyAmount * 12).toLocaleString('de-DE')}
            {' '}
            €
          </div>
          <div>
            <span className="font-medium">Steuerpflichtiger Betrag:</span>
            {' '}
            {Math.round(monthlyAmount * 12 * taxablePercentage / 100).toLocaleString('de-DE')}
            {' '}
            €/Jahr
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatutoryPensionFormValues {
  enabled: boolean
  startYear: number
  monthlyAmount: number
  annualIncreaseRate: number
  taxablePercentage: number
  retirementAge?: number
  // Tax return data fields
  hasTaxReturnData: boolean
  taxYear: number
  annualPensionReceived: number
  taxablePortion: number
}

interface StatutoryPensionChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onStartYearChange: (year: number) => void
  onMonthlyAmountChange: (amount: number) => void
  onAnnualIncreaseRateChange: (rate: number) => void
  onTaxablePercentageChange: (percentage: number) => void
  onRetirementAgeChange: (age: number) => void
  onTaxReturnDataChange: (data: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
  }) => void
}

interface StatutoryPensionConfigurationProps {
  values: StatutoryPensionFormValues
  onChange: StatutoryPensionChangeHandlers
  currentYear?: number
  // Birth year information for retirement calculation
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
}

interface CoupleStatutoryPensionConfigurationProps {
  config: CoupleStatutoryPensionConfig | null
  onChange: (config: CoupleStatutoryPensionConfig | null) => void
  currentYear?: number
  // Birth year information for retirement calculation
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
}

export function CoupleStatutoryPensionConfiguration({
  config,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
}: CoupleStatutoryPensionConfigurationProps) {
  const nestingLevel = useNestingLevel()

  // Generate unique IDs for this component instance
  const enabledSwitchId = useFormId('statutory-pension', 'enabled', 'couple')
  const mainEnabledSwitchId = useFormId('statutory-pension', 'main-enabled', 'couple')

  // Initialize config if it doesn't exist
  const currentConfig = config || (() => {
    const defaultConfig = createDefaultCoupleStatutoryPensionConfig()
    defaultConfig.planningMode = planningMode
    if (planningMode === 'individual') {
      defaultConfig.individual = {
        enabled: false,
        startYear: calculateRetirementStartYear(planningMode, birthYear, spouseBirthYear) || 2041,
        monthlyAmount: 1500,
        annualIncreaseRate: 1.0,
        taxablePercentage: 80,
        retirementAge: 67,
      }
    }
    return defaultConfig
  })()

  // Helper function to update individual person config
  const updatePersonConfig = (personId: 1 | 2, updates: Partial<IndividualStatutoryPensionConfig>) => {
    if (!currentConfig.couple) return

    const updatedConfig = {
      ...currentConfig,
      couple: {
        ...currentConfig.couple,
        [`person${personId}`]: {
          ...currentConfig.couple[`person${personId}`],
          ...updates,
        },
      },
    }
    onChange(updatedConfig)
  }

  // Helper function to toggle overall enabled state
  const toggleEnabled = (enabled: boolean) => {
    const updatedConfig = {
      ...currentConfig,
      enabled,
    }
    onChange(updatedConfig)
  }

  if (!currentConfig.enabled) {
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
                    🏛️ Gesetzliche Renten-Konfiguration
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
                    checked={currentConfig.enabled}
                    onCheckedChange={toggleEnabled}
                    id={enabledSwitchId}
                  />
                  <Label htmlFor={enabledSwitchId}>
                    Gesetzliche Rente berücksichtigen
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Aktivieren Sie diese Option, um
                  {' '}
                  {planningMode === 'couple' ? 'die gesetzlichen Renten beider Partner' : 'Ihre gesetzliche Rente'}
                  {' '}
                  in die Entnahmeplanung einzubeziehen.
                  Dies ermöglicht eine realistische Berechnung Ihres privaten Entnahmebedarfs.
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  const renderIndividualMode = () => {
    if (!currentConfig.individual) return null

    // For individual mode, show single configuration
    return (
      <div className="space-y-4">
        <Card nestingLevel={nestingLevel + 1}>
          <CardHeader nestingLevel={nestingLevel + 1}>
            <CardTitle className="text-base">Rentenplanung</CardTitle>
          </CardHeader>
          <CardContent nestingLevel={nestingLevel + 1}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Monatliche Rente (brutto) €</Label>
                <Input
                  type="number"
                  value={currentConfig.individual.monthlyAmount}
                  onChange={(e) => {
                    const updatedConfig = {
                      ...currentConfig,
                      individual: {
                        ...currentConfig.individual!,
                        monthlyAmount: Number(e.target.value),
                      },
                    }
                    onChange(updatedConfig)
                  }}
                  min={0}
                  step={50}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCoupleMode = () => {
    if (!currentConfig.couple) return null

    const { person1, person2 } = currentConfig.couple

    return (
      <div className="space-y-4">
        {/* Overview Summary */}
        <Card nestingLevel={nestingLevel + 1}>
          <CardHeader nestingLevel={nestingLevel + 1}>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Renten-Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent nestingLevel={nestingLevel + 1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium text-blue-900">Person 1</div>
                <div>
                  <span className="text-gray-600">Geburtsjahr:</span>
                  <span className="font-medium ml-1">{birthYear || 'Nicht festgelegt'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rentenbeginn:</span>
                  <span className="font-medium ml-1">{person1.enabled ? person1.startYear : '—'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Monatliche Rente:</span>
                  <span className="font-medium ml-1">
                    {person1.enabled ? `${person1.monthlyAmount.toLocaleString('de-DE')} €` : '—'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-blue-900">Person 2</div>
                <div>
                  <span className="text-gray-600">Geburtsjahr:</span>
                  <span className="font-medium ml-1">{spouseBirthYear || 'Nicht festgelegt'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rentenbeginn:</span>
                  <span className="font-medium ml-1">{person2.enabled ? person2.startYear : '—'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Monatliche Rente:</span>
                  <span className="font-medium ml-1">
                    {person2.enabled ? `${person2.monthlyAmount.toLocaleString('de-DE')} €` : '—'}
                  </span>
                </div>
              </div>
            </div>
            {(!birthYear || !spouseBirthYear) && (
              <div className="mt-4 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                Bitte Geburtsjahre in der Globalen Planung festlegen für automatische Rentenberechnung
              </div>
            )}
          </CardContent>
        </Card>

        {/* Person 1 Configuration */}
        <CollapsibleCard>
          <CollapsibleCardHeader>
            👤 Person 1 - Rentenplanung
          </CollapsibleCardHeader>
          <CollapsibleCardContent>
            <PersonPensionConfiguration
              config={person1}
              onChange={updates => updatePersonConfig(1, updates)}
              currentYear={currentYear}
              birthYear={birthYear}
              personName="Person 1"
            />
          </CollapsibleCardContent>
        </CollapsibleCard>

        {/* Person 2 Configuration */}
        <CollapsibleCard>
          <CollapsibleCardHeader>
            👤 Person 2 - Rentenplanung
          </CollapsibleCardHeader>
          <CollapsibleCardContent>
            <PersonPensionConfiguration
              config={person2}
              onChange={updates => updatePersonConfig(2, updates)}
              currentYear={currentYear}
              birthYear={spouseBirthYear}
              personName="Person 2"
            />
          </CollapsibleCardContent>
        </CollapsibleCard>
      </div>
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
                  🏛️ Gesetzliche Renten-Konfiguration
                </CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentConfig.enabled}
                  onCheckedChange={toggleEnabled}
                  id={mainEnabledSwitchId}
                />
                <Label htmlFor={mainEnabledSwitchId} className="font-medium">
                  Gesetzliche Rente berücksichtigen
                </Label>
              </div>

              {planningMode === 'individual' ? renderIndividualMode() : renderCoupleMode()}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// Helper component for individual person pension configuration
interface PersonPensionConfigurationProps {
  config: IndividualStatutoryPensionConfig
  onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  currentYear: number
  birthYear?: number
  personName: string
}

function PersonPensionConfiguration({
  config,
  onChange,
  currentYear: _currentYear,
  birthYear,
  personName,
}: PersonPensionConfigurationProps) {
  const personEnabledId = useFormId('statutory-pension', 'enabled', personName)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={config.enabled}
          onCheckedChange={enabled => onChange({ enabled })}
          id={personEnabledId}
        />
        <Label htmlFor={personEnabledId}>
          Rente für
          {' '}
          {personName}
          {' '}
          berücksichtigen
        </Label>
      </div>

      {config.enabled && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monatliche Rente (brutto) €</Label>
              <Input
                type="number"
                value={config.monthlyAmount}
                onChange={e => onChange({ monthlyAmount: Number(e.target.value) })}
                min={0}
                step={50}
                className="w-40"
              />
              <div className="text-sm text-muted-foreground">
                Jährliche Rente:
                {' '}
                {(config.monthlyAmount * 12).toLocaleString('de-DE')}
                {' '}
                €
              </div>
            </div>

            <div className="space-y-2">
              <Label>Renteneintrittsalter</Label>
              <Input
                type="number"
                value={config.retirementAge || 67}
                onChange={(e) => {
                  const retirementAge = Number(e.target.value)
                  const startYear = birthYear ? birthYear + retirementAge : config.startYear
                  onChange({
                    retirementAge,
                    startYear,
                  })
                }}
                min={60}
                max={75}
                className="w-32"
              />
              <div className="text-sm text-muted-foreground">
                Rentenbeginn:
                {' '}
                {birthYear ? birthYear + (config.retirementAge || 67) : config.startYear}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jährliche Rentenanpassung (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[config.annualIncreaseRate]}
                onValueChange={vals => onChange({ annualIncreaseRate: vals[0] })}
                min={0}
                max={5}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0%</span>
                <span className="font-medium text-gray-900">
                  {config.annualIncreaseRate.toFixed(1)}
                  %
                </span>
                <span>5%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Steuerpflichtiger Anteil (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[config.taxablePercentage]}
                onValueChange={vals => onChange({ taxablePercentage: vals[0] })}
                min={50}
                max={100}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>50%</span>
                <span className="font-medium text-gray-900">
                  {config.taxablePercentage.toFixed(0)}
                  %
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function StatutoryPensionConfiguration({
  values,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
}: StatutoryPensionConfigurationProps) {
  const nestingLevel = useNestingLevel()

  // Generate unique IDs for this component instance
  const enabledSwitchId = useFormId('statutory-pension', 'enabled', 'withdrawal')
  const mainEnabledSwitchId = useFormId('statutory-pension', 'main-enabled', 'withdrawal')

  // Use pension calculations hook
  const { handleImportFromTaxReturn } = usePensionCalculations({
    values: {
      hasTaxReturnData: values.hasTaxReturnData,
      taxYear: values.taxYear,
      annualPensionReceived: values.annualPensionReceived,
      taxablePortion: values.taxablePortion,
      startYear: values.startYear,
      retirementAge: values.retirementAge,
    },
    onChange: {
      onStartYearChange: onChange.onStartYearChange,
      onMonthlyAmountChange: onChange.onMonthlyAmountChange,
      onTaxablePercentageChange: onChange.onTaxablePercentageChange,
    },
    birthYear,
    spouseBirthYear,
    planningMode,
  })

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
                    🏛️ Gesetzliche Renten-Konfiguration
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
                    id={enabledSwitchId}
                  />
                  <Label htmlFor={enabledSwitchId}>
                    Gesetzliche Rente berücksichtigen
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Aktivieren Sie diese Option, um Ihre gesetzliche Rente in die Entnahmeplanung einzubeziehen.
                  Dies ermöglicht eine realistische Berechnung Ihres privaten Entnahmebedarfs.
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
                  🏛️ Gesetzliche Renten-Konfiguration
                </CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={values.enabled}
                  onCheckedChange={onChange.onEnabledChange}
                  id={mainEnabledSwitchId}
                />
                <Label htmlFor={mainEnabledSwitchId} className="font-medium">
                  Gesetzliche Rente berücksichtigen
                </Label>
              </div>

              <PensionInputForm
                values={values}
                onChange={onChange}
                nestingLevel={nestingLevel}
                birthYear={birthYear}
                spouseBirthYear={spouseBirthYear}
                currentYear={currentYear}
                planningMode={planningMode}
                onImportFromTaxReturn={handleImportFromTaxReturn}
              />

              {/* Summary Information */}
              <PensionSummary
                startYear={values.startYear}
                monthlyAmount={values.monthlyAmount}
                taxablePercentage={values.taxablePercentage}
                nestingLevel={nestingLevel}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
