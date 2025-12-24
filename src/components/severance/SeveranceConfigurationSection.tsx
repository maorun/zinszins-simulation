import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import type { SeveranceConfig } from '../../../helpers/abfindung'
import { generateFormId } from '../../utils/unique-id'
import { SingleYearFields } from './SingleYearFields'
import { ComparisonYearsInput } from './ComparisonYearsInput'
import { ModeSelectionRadio } from './ModeSelectionRadio'
import { AdvancedSettingsCollapsible } from './AdvancedSettingsCollapsible'

interface SeveranceConfigurationSectionProps {
  config: SeveranceConfig
  onConfigChange: (config: SeveranceConfig) => void
  comparisonMode: 'single' | 'comparison'
  onComparisonModeChange: (mode: 'single' | 'comparison') => void
  comparisonYears: { [year: number]: number }
  onComparisonYearsChange: (years: { [year: number]: number }) => void
}

export function SeveranceConfigurationSection({
  config,
  onConfigChange,
  comparisonMode,
  onComparisonModeChange,
  comparisonYears,
  onComparisonYearsChange,
}: SeveranceConfigurationSectionProps) {
  const enabledId = useMemo(() => generateFormId('severance', 'enabled'), [])
  const severanceAmountId = useMemo(() => generateFormId('severance', 'severance-amount'), [])

  const handleConfigChange = (updates: Partial<SeveranceConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={enabledId} className="text-sm font-medium">
          Abfindungsrechner aktivieren
        </Label>
        <Switch id={enabledId} checked={config.enabled} onCheckedChange={enabled => handleConfigChange({ enabled })} />
      </div>

      {config.enabled && (
        <>
          <ModeSelectionRadio comparisonMode={comparisonMode} onComparisonModeChange={onComparisonModeChange} />

          <SeveranceAmountInput
            id={severanceAmountId}
            value={config.severanceAmount}
            onChange={value => handleConfigChange({ severanceAmount: value })}
          />

          {comparisonMode === 'single' ? (
            <SingleYearFields config={config} onConfigChange={handleConfigChange} />
          ) : (
            <ComparisonYearsInput comparisonYears={comparisonYears} onComparisonYearsChange={onComparisonYearsChange} />
          )}

          <AdvancedSettingsCollapsible config={config} onConfigChange={handleConfigChange} />
        </>
      )}
    </div>
  )
}

function SeveranceAmountInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Abfindungshöhe (brutto)
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id={id}
          type="number"
          min="0"
          step="1000"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground">€</span>
      </div>
    </div>
  )
}
