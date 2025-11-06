import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Info } from 'lucide-react'
import { useNestingLevel } from '../lib/nesting-utils'
import { useFormId } from '../utils/unique-id'
import type { CoupleStatutoryPensionConfig, IndividualStatutoryPensionConfig } from '../../helpers/statutory-pension'
import { usePensionCalculations } from '../hooks/usePensionCalculations'
import { DisabledPensionCard } from './statutory-pension/DisabledPensionCard'
import { PersonPensionFields } from './statutory-pension/PersonPensionFields'
import { EnabledPensionCard } from './statutory-pension/EnabledPensionCard'
import { CoupleConfigurationContent } from './statutory-pension/CoupleConfigurationContent'
import { PensionConfigurationContent } from './statutory-pension/PensionConfigurationContent'
import {
  useInitialConfig,
  createUpdatePersonConfig,
  createToggleEnabled,
} from './statutory-pension/useCoupleConfigHelpers'

/** Summary information component for statutory pension */
interface PensionSummaryProps {
  startYear: number
  monthlyAmount: number
  taxablePercentage: number
  nestingLevel: number
}

function PensionSummary({ startYear, monthlyAmount, taxablePercentage, nestingLevel }: PensionSummaryProps) {
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
            <span className="font-medium">Rentenbeginn:</span> {startYear}
          </div>
          <div>
            <span className="font-medium">Monatliche Rente:</span> {monthlyAmount.toLocaleString('de-DE')} €
          </div>
          <div>
            <span className="font-medium">Jährliche Rente:</span> {(monthlyAmount * 12).toLocaleString('de-DE')} €
          </div>
          <div>
            <span className="font-medium">Steuerpflichtiger Betrag:</span>{' '}
            {Math.round((monthlyAmount * 12 * taxablePercentage) / 100).toLocaleString('de-DE')} €/Jahr
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
  const currentConfig = useInitialConfig(config, planningMode, birthYear, spouseBirthYear)

  // Helper functions
  const updatePersonConfig = createUpdatePersonConfig(currentConfig, onChange)
  const toggleEnabled = createToggleEnabled(currentConfig, onChange)

  if (!currentConfig.enabled) {
    return (
      <DisabledPensionCard
        enabled={currentConfig.enabled}
        onToggle={toggleEnabled}
        switchId={enabledSwitchId}
        nestingLevel={nestingLevel}
        planningMode={planningMode}
      />
    )
  }

  return (
    <EnabledPensionCard
      enabled={currentConfig.enabled}
      onToggle={toggleEnabled}
      switchId={mainEnabledSwitchId}
      nestingLevel={nestingLevel}
    >
      <CoupleConfigurationContent
        currentConfig={currentConfig}
        planningMode={planningMode}
        onChange={onChange}
        updatePersonConfig={updatePersonConfig}
        birthYear={birthYear}
        spouseBirthYear={spouseBirthYear}
        currentYear={currentYear}
        nestingLevel={nestingLevel}
        PersonConfigComponent={PersonPensionConfiguration}
      />
    </EnabledPensionCard>
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
        <Switch checked={config.enabled} onCheckedChange={(enabled) => onChange({ enabled })} id={personEnabledId} />
        <Label htmlFor={personEnabledId}>Rente für {personName} berücksichtigen</Label>
      </div>

      {config.enabled && <PersonPensionFields config={config} onChange={onChange} birthYear={birthYear} />}
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
    values,
    onChange,
    birthYear,
    spouseBirthYear,
    planningMode,
  })

  if (!values.enabled) {
    return (
      <DisabledPensionCard
        enabled={values.enabled}
        onToggle={onChange.onEnabledChange}
        switchId={enabledSwitchId}
        nestingLevel={nestingLevel}
        planningMode="individual"
      />
    )
  }

  return (
    <EnabledPensionCard
      enabled={values.enabled}
      onToggle={onChange.onEnabledChange}
      switchId={mainEnabledSwitchId}
      nestingLevel={nestingLevel}
    >
      <PensionConfigurationContent
        values={values}
        onChange={onChange}
        nestingLevel={nestingLevel}
        birthYear={birthYear}
        spouseBirthYear={spouseBirthYear}
        currentYear={currentYear}
        planningMode={planningMode}
        onImportFromTaxReturn={handleImportFromTaxReturn}
        PensionSummaryComponent={PensionSummary}
      />
    </EnabledPensionCard>
  )
}
