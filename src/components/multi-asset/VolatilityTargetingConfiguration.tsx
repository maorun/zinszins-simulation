import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import {
  type VolatilityTargetingConfig,
  type VolatilityTargetingStrategy,
  getStrategyName,
  getStrategyDescription,
  validateVolatilityTargetingConfig,
} from '../../../helpers/volatility-targeting'

/** Props for volatility targeting parameters */
interface ParametersProps {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
  targetVolatilityId: string
  lookbackYearsId: string
  minRiskyAllocationId: string
  maxRiskyAllocationId: string
  smoothingFactorId: string
}

/** Render target volatility field */
function TargetVolatilityField({
  config,
  onChange,
  id,
}: {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
  id: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Ziel-Volatilität (jährlich)
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min="1"
          max="50"
          step="0.5"
          value={(config.targetVolatility * 100).toFixed(1)}
          onChange={e => onChange({ targetVolatility: parseFloat(e.target.value) / 100 })}
          className="text-sm w-24"
        />
        <span className="text-sm text-gray-600">%</span>
      </div>
      <p className="text-xs text-gray-600">Ziel-Volatilitätsniveau (z.B. 10% = ausgewogen)</p>
    </div>
  )
}

/** Render lookback period field */
function LookbackPeriodField({
  config,
  onChange,
  id,
}: {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
  id: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Lookback-Periode
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min="1"
          max="10"
          step="1"
          value={config.lookbackYears}
          onChange={e => onChange({ lookbackYears: parseInt(e.target.value) })}
          className="text-sm w-24"
        />
        <span className="text-sm text-gray-600">Jahre</span>
      </div>
      <p className="text-xs text-gray-600">Zeitraum zur Berechnung der realisierten Volatilität</p>
    </div>
  )
}

/** Render allocation limits fields */
function MinRiskyAllocationField({
  config,
  onChange,
  id,
}: {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
  id: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Minimale Risikoallokation
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min="0"
          max="100"
          step="5"
          value={(config.minRiskyAllocation * 100).toFixed(0)}
          onChange={e => onChange({ minRiskyAllocation: parseFloat(e.target.value) / 100 })}
          className="text-sm w-24"
        />
        <span className="text-sm text-gray-600">%</span>
      </div>
      <p className="text-xs text-gray-600">Mindestens so viel in riskanten Assets</p>
    </div>
  )
}

function MaxRiskyAllocationField({
  config,
  onChange,
  id,
}: {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
  id: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Maximale Risikoallokation
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min="0"
          max="100"
          step="5"
          value={(config.maxRiskyAllocation * 100).toFixed(0)}
          onChange={e => onChange({ maxRiskyAllocation: parseFloat(e.target.value) / 100 })}
          className="text-sm w-24"
        />
        <span className="text-sm text-gray-600">%</span>
      </div>
      <p className="text-xs text-gray-600">Maximal so viel in riskanten Assets</p>
    </div>
  )
}

/** Render smoothing factor field */
function SmoothingFactorField({
  config,
  onChange,
  id,
}: {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
  id: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Glättungsfaktor
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={config.smoothingFactor.toFixed(1)}
          onChange={e => onChange({ smoothingFactor: parseFloat(e.target.value) })}
          className="text-sm w-24"
        />
      </div>
      <p className="text-xs text-gray-600">Wie stark neuere Daten gewichtet werden (0-1)</p>
    </div>
  )
}

/** Render detailed configuration parameters */
function VolatilityTargetingParameters({
  config,
  onChange,
  targetVolatilityId,
  lookbackYearsId,
  minRiskyAllocationId,
  maxRiskyAllocationId,
  smoothingFactorId,
}: ParametersProps) {
  return (
    <>
      <TargetVolatilityField config={config} onChange={onChange} id={targetVolatilityId} />
      <LookbackPeriodField config={config} onChange={onChange} id={lookbackYearsId} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MinRiskyAllocationField config={config} onChange={onChange} id={minRiskyAllocationId} />
        <MaxRiskyAllocationField config={config} onChange={onChange} id={maxRiskyAllocationId} />
      </div>
      <SmoothingFactorField config={config} onChange={onChange} id={smoothingFactorId} />
    </>
  )
}

/** Render validation errors */
function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm font-medium text-red-900 mb-1">Konfigurationsfehler:</p>
      <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )
}

interface VolatilityTargetingConfigurationProps {
  /** Current volatility targeting configuration */
  config: VolatilityTargetingConfig
  /** Callback when configuration changes */
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
}

/** Render strategy selection */
function StrategySelection({
  config,
  onChange,
}: {
  config: VolatilityTargetingConfig
  onChange: (updates: Partial<VolatilityTargetingConfig>) => void
}) {
  const strategies: VolatilityTargetingStrategy[] = ['none', 'simple', 'inverse', 'risk_parity']
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Strategie</Label>
      <RadioTileGroup
        value={config.strategy}
        onValueChange={(value: string) => onChange({ strategy: value as VolatilityTargetingStrategy })}
      >
        {strategies.map(strategy => (
          <RadioTile key={strategy} value={strategy} label={getStrategyName(strategy)}>
            {getStrategyDescription(strategy)}
          </RadioTile>
        ))}
      </RadioTileGroup>
    </div>
  )
}

/**
 * Configuration UI for Volatility Targeting (Dynamic Allocation)
 * Allows users to configure dynamic portfolio allocation based on realized volatility
 */
export function VolatilityTargetingConfiguration({ config, onChange }: VolatilityTargetingConfigurationProps) {
  const enabledSwitchId = useMemo(() => generateFormId('volatility-targeting', 'enabled'), [])
  const targetVolatilityId = useMemo(() => generateFormId('volatility-targeting', 'target-volatility'), [])
  const lookbackYearsId = useMemo(() => generateFormId('volatility-targeting', 'lookback-years'), [])
  const minRiskyAllocationId = useMemo(() => generateFormId('volatility-targeting', 'min-risky-allocation'), [])
  const maxRiskyAllocationId = useMemo(() => generateFormId('volatility-targeting', 'max-risky-allocation'), [])
  const smoothingFactorId = useMemo(() => generateFormId('volatility-targeting', 'smoothing-factor'), [])

  const validationErrors = validateVolatilityTargetingConfig(config)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Volatilitäts-Targeting</h3>

      <div className="flex items-center gap-2">
        <Switch id={enabledSwitchId} checked={config.enabled} onCheckedChange={enabled => onChange({ enabled })} />
        <Label htmlFor={enabledSwitchId} className="text-sm">
          Dynamische Allokation aktivieren
        </Label>
      </div>
      <p className="text-xs text-gray-600">
        Passt die Portfolio-Allokation automatisch an die realisierte Volatilität an
      </p>

      {config.enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-gray-200">
          <StrategySelection config={config} onChange={onChange} />

          {config.strategy !== 'none' && (
            <VolatilityTargetingParameters
              config={config}
              onChange={onChange}
              targetVolatilityId={targetVolatilityId}
              lookbackYearsId={lookbackYearsId}
              minRiskyAllocationId={minRiskyAllocationId}
              maxRiskyAllocationId={maxRiskyAllocationId}
              smoothingFactorId={smoothingFactorId}
            />
          )}

          <ValidationErrors errors={validationErrors} />
        </div>
      )}
    </div>
  )
}
