import { Info } from 'lucide-react'
import {
  calculateRetirementStartYear,
  createDefaultCoupleStatutoryPensionConfig,
  type IndividualStatutoryPensionConfig,
} from '../../helpers/statutory-pension'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'

export function CoupleStatutoryPensionConfiguration() {
  const nestingLevel = useNestingLevel()
  const currentYear = new Date().getFullYear()
  const {
    birthYear,
    planningMode,
    spouse,
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
  } = useSimulation()

  // Initialize config if it doesn't exist
  const currentConfig = coupleStatutoryPensionConfig || (() => {
    const defaultConfig = createDefaultCoupleStatutoryPensionConfig()
    defaultConfig.planningMode = planningMode
    if (planningMode === 'individual') {
      defaultConfig.individual = {
        enabled: false,
        startYear: calculateRetirementStartYear(planningMode, birthYear, spouse?.birthYear) || 2041,
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
    setCoupleStatutoryPensionConfig(updatedConfig)
  }

  // Helper function to toggle overall enabled state
  const toggleEnabled = (enabled: boolean) => {
    const updatedConfig = {
      ...currentConfig,
      enabled,
    }
    setCoupleStatutoryPensionConfig(updatedConfig)
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
                    setCoupleStatutoryPensionConfig(updatedConfig)
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
                  <span className="font-medium ml-1">{spouse?.birthYear || 'Nicht festgelegt'}</span>
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
            {(!birthYear || !spouse?.birthYear) && (
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
              birthYear={spouse?.birthYear}
              personName="Person 2"
            />
          </CollapsibleCardContent>
        </CollapsibleCard>
      </div>
    )
  }

  return (
    <CollapsibleCard title="Gesetzliche Renten-Konfiguration" navigationId="statutory-pension-configuration" navigationTitle="Gesetzliche Renten-Konfiguration" navigationIcon="🏛️">
      <CollapsibleCardHeader>
        🏛️ Gesetzliche Renten-Konfiguration
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentConfig.enabled}
            onCheckedChange={toggleEnabled}
            id="statutory-pension-enabled"
          />
          <Label htmlFor="statutory-pension-enabled" className="font-medium">
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
        {currentConfig.enabled && (
          planningMode === 'individual' ? renderIndividualMode() : renderCoupleMode()
        )}
      </CollapsibleCardContent>
    </CollapsibleCard>
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
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={config.enabled}
          onCheckedChange={enabled => onChange({ enabled })}
          id={`${personName.toLowerCase().replace(' ', '-')}-enabled`}
        />
        <Label htmlFor={`${personName.toLowerCase().replace(' ', '-')}-enabled`}>
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
