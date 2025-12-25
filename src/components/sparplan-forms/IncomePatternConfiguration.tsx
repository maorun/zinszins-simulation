import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Info } from 'lucide-react'
import { generateFormId } from '../../utils/unique-id'
import type { IncomePattern } from '../../utils/sparplan-utils'

interface IncomePatternConfigurationProps {
  incomePattern?: IncomePattern
  onChange: (pattern: IncomePattern | undefined) => void
}

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

const QUARTER_NAMES = ['Q1 (Jan-März)', 'Q2 (Apr-Juni)', 'Q3 (Jul-Sep)', 'Q4 (Okt-Dez)']

/**
 * Pattern preset configurations
 */
const PRESETS = {
  seasonal: {
    type: 'monthly' as const,
    monthlyMultipliers: [
      1.3, 1.2, 1.1, // Q1: High
      1.0, 0.9, 0.8, // Q2: Normal to low
      0.7, 0.8, 0.9, // Q3: Low to normal
      1.0, 1.2, 1.4, // Q4: Normal to high
    ],
    description: 'Saisonales Geschäft (höher im Winter, niedriger im Sommer)',
  },
  quarterlyCycle: {
    type: 'quarterly' as const,
    quarterlyMultipliers: [0.8, 1.0, 1.3, 0.9],
    description: 'Quartalsweiser Zyklus',
  },
}

/**
 * Get initial pattern with defaults
 */
function getInitialPattern(incomePattern?: IncomePattern): IncomePattern {
  return (
    incomePattern || {
      enabled: false,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
      description: '',
    }
  )
}

/**
 * Custom hook for basic pattern state management
 */
function usePatternState(incomePattern: IncomePattern | undefined) {
  const [localPattern, setLocalPattern] = useState<IncomePattern>(() =>
    getInitialPattern(incomePattern),
  )

  const multipliers =
    localPattern.type === 'monthly'
      ? localPattern.monthlyMultipliers || Array(12).fill(1.0)
      : localPattern.quarterlyMultipliers || Array(4).fill(1.0)

  const periodNames = localPattern.type === 'monthly' ? MONTH_NAMES : QUARTER_NAMES

  return { localPattern, setLocalPattern, multipliers, periodNames }
}

/**
 * Update multiplier value in pattern
 */
function updateMultiplierValue(pattern: IncomePattern, index: number, numValue: number): IncomePattern {
  const updated = { ...pattern }
  if (pattern.type === 'monthly') {
    updated.monthlyMultipliers = [...(pattern.monthlyMultipliers || Array(12).fill(1.0))]
    updated.monthlyMultipliers[index] = numValue
  } else {
    updated.quarterlyMultipliers = [...(pattern.quarterlyMultipliers || Array(4).fill(1.0))]
    updated.quarterlyMultipliers[index] = numValue
  }
  return updated
}

/**
 * Custom hook for pattern handlers
 */
function usePatternHandlers(
  localPattern: IncomePattern,
  setLocalPattern: (pattern: IncomePattern) => void,
  onChange: (pattern: IncomePattern | undefined) => void,
) {
  const updatePattern = (updater: (pattern: IncomePattern) => IncomePattern) => {
    const updated = updater(localPattern)
    setLocalPattern(updated)
    onChange(updated.enabled ? updated : undefined)
  }

  const handleEnabledChange = (enabled: boolean) => {
    updatePattern(pattern => ({ ...pattern, enabled }))
  }

  const handleTypeChange = (type: 'monthly' | 'quarterly') => {
    updatePattern(pattern => ({ ...pattern, type }))
  }

  const handleMultiplierChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 1.0
    updatePattern(pattern => updateMultiplierValue(pattern, index, numValue))
  }

  const handleDescriptionChange = (description: string) => {
    updatePattern(pattern => ({ ...pattern, description }))
  }

  const resetToNormal = () => {
    updatePattern(pattern => ({
      ...pattern,
      monthlyMultipliers: pattern.type === 'monthly' ? Array(12).fill(1.0) : pattern.monthlyMultipliers,
      quarterlyMultipliers:
        pattern.type === 'quarterly' ? Array(4).fill(1.0) : pattern.quarterlyMultipliers,
    }))
  }

  const applyPreset = (preset: 'seasonal' | 'quarterly-cycle') => {
    const presetData = preset === 'seasonal' ? PRESETS.seasonal : PRESETS.quarterlyCycle
    updatePattern(pattern => ({ ...pattern, ...presetData }))
  }

  return {
    handleEnabledChange,
    handleTypeChange,
    handleMultiplierChange,
    handleDescriptionChange,
    resetToNormal,
    applyPreset,
  }
}

/**
 * Custom hook for managing income pattern state and handlers
 */
function useIncomePatternState(
  incomePattern: IncomePattern | undefined,
  onChange: (pattern: IncomePattern | undefined) => void,
) {
  const { localPattern, setLocalPattern, multipliers, periodNames } = usePatternState(incomePattern)
  const handlers = usePatternHandlers(localPattern, setLocalPattern, onChange)

  return {
    localPattern,
    multipliers,
    periodNames,
    ...handlers,
  }
}

/**
 * Component for configuring fluctuating income patterns for self-employed individuals
 * Allows users to define monthly or quarterly income variations
 */
export function IncomePatternConfiguration({
  incomePattern,
  onChange,
}: IncomePatternConfigurationProps) {
  const state = useIncomePatternState(incomePattern, onChange)
  const enabledSwitchId = useMemo(() => generateFormId('income-pattern', 'enabled'), [])
  const descriptionId = useMemo(() => generateFormId('income-pattern', 'description'), [])

  return (
    <IncomePatternCard
      state={state}
      enabledSwitchId={enabledSwitchId}
      descriptionId={descriptionId}
    />
  )
}

/**
 * Main card component for income pattern configuration
 */
function IncomePatternCard({
  state,
  enabledSwitchId,
  descriptionId,
}: {
  state: ReturnType<typeof useIncomePatternState>
  enabledSwitchId: string
  descriptionId: string
}) {
  return (
    <Card className="w-full">
      <IncomePatternCardHeader />
      <IncomePatternCardContent
        state={state}
        enabledSwitchId={enabledSwitchId}
        descriptionId={descriptionId}
      />
    </Card>
  )
}

/**
 * Card header component
 */
function IncomePatternCardHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span>Schwankende Einkommen (Selbstständige)</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </CardTitle>
      <CardDescription>
        Für Selbstständige: Definieren Sie unregelmäßige Einkommensmuster (z.B. saisonale
        Schwankungen, Projektgeschäft)
      </CardDescription>
    </CardHeader>
  )
}

/**
 * Card content component
 */
function IncomePatternCardContent({
  state,
  enabledSwitchId,
  descriptionId,
}: {
  state: ReturnType<typeof useIncomePatternState>
  enabledSwitchId: string
  descriptionId: string
}) {
  const {
    localPattern,
    multipliers,
    periodNames,
    handleEnabledChange,
    handleTypeChange,
    handleMultiplierChange,
    handleDescriptionChange,
    resetToNormal,
    applyPreset,
  } = state

  return (
    <CardContent className="space-y-4">
      <EnabledSwitch
        id={enabledSwitchId}
        enabled={localPattern.enabled}
        onChange={handleEnabledChange}
      />

      {localPattern.enabled && (
        <>
          <PatternTypeSelector type={localPattern.type} onChange={handleTypeChange} />

          <PresetButtons onApplyPreset={applyPreset} onReset={resetToNormal} />

          <MultiplierInputs
            type={localPattern.type}
            multipliers={multipliers}
            periodNames={periodNames}
            onChange={handleMultiplierChange}
          />

          <DescriptionField
            id={descriptionId}
            value={localPattern.description || ''}
            onChange={handleDescriptionChange}
          />

          <InfoPanel />
        </>
      )}
    </CardContent>
  )
}

/**
 * Enable/Disable Switch Component
 */
function EnabledSwitch({
  id,
  enabled,
  onChange,
}: {
  id: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-base">
        Einkommensmuster aktivieren
      </Label>
      <Switch id={id} checked={enabled} onCheckedChange={onChange} />
    </div>
  )
}

/**
 * Pattern Type Selector Component
 */
function PatternTypeSelector({
  type,
  onChange,
}: {
  type: 'monthly' | 'quarterly'
  onChange: (type: 'monthly' | 'quarterly') => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Muster-Typ</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={type === 'monthly' ? 'default' : 'outline'}
          onClick={() => onChange('monthly')}
          className="flex-1"
        >
          Monatlich
        </Button>
        <Button
          type="button"
          variant={type === 'quarterly' ? 'default' : 'outline'}
          onClick={() => onChange('quarterly')}
          className="flex-1"
        >
          Quartalsweise
        </Button>
      </div>
    </div>
  )
}

/**
 * Preset Buttons Component
 */
function PresetButtons({
  onApplyPreset,
  onReset,
}: {
  onApplyPreset: (preset: 'seasonal' | 'quarterly-cycle') => void
  onReset: () => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Vorlagen</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onApplyPreset('seasonal')}
          className="flex-1"
          size="sm"
        >
          Saisonal
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onApplyPreset('quarterly-cycle')}
          className="flex-1"
          size="sm"
        >
          Quartalszyklus
        </Button>
        <Button type="button" variant="outline" onClick={onReset} className="flex-1" size="sm">
          Zurücksetzen
        </Button>
      </div>
    </div>
  )
}

/**
 * Multiplier Inputs Component
 */
function MultiplierInputs({
  type,
  multipliers,
  periodNames,
  onChange,
}: {
  type: 'monthly' | 'quarterly'
  multipliers: number[]
  periodNames: string[]
  onChange: (index: number, value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Multiplikatoren (1.0 = normal, 1.5 = +50%, 0.5 = -50%)
      </Label>
      <div
        className={`grid gap-3 ${type === 'monthly' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}
      >
        {multipliers.map((multiplier, index) => (
          <div key={index} className="space-y-1">
            <Label htmlFor={`multiplier-${index}`} className="text-xs">
              {periodNames[index]}
            </Label>
            <Input
              id={`multiplier-${index}`}
              type="number"
              step="0.1"
              min="0"
              max="3"
              value={multiplier.toFixed(1)}
              onChange={e => onChange(index, e.target.value)}
              className="h-8"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Description Field Component
 */
function DescriptionField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Beschreibung (optional)
      </Label>
      <Input
        id={id}
        type="text"
        placeholder="z.B. Saisongeschäft mit Sommerflaute"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

/**
 * Info Panel Component
 */
function InfoPanel() {
  return (
    <div className="rounded-md bg-muted p-3 text-sm">
      <p className="font-medium mb-1">ℹ️ Hinweis:</p>
      <p className="text-muted-foreground">
        Die Multiplikatoren werden auf den Basis-Betrag angewendet. Ein Wert von 1.0 bedeutet den
        normalen Betrag, 1.5 bedeutet 50% mehr, 0.5 bedeutet 50% weniger. Die tatsächliche
        Gesamtsumme kann vom Jahresbetrag abweichen.
      </p>
    </div>
  )
}
