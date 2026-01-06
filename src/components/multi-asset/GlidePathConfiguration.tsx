import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import {
  type GlidePathConfig,
  type GlidePathCurve,
  getGlidePathCurveDescription,
  validateGlidePathConfig,
} from '../../../helpers/glide-path'

interface GlidePathConfigurationProps {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
}

/** Render German formula toggle */
function GermanFormulaToggle({
  config,
  onChange,
  id,
}: {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
  id: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          Lebensalter-Faustformel verwenden
        </Label>
        <p className="text-xs text-gray-600">Aktienquote = {config.formulaOffset} - Lebensalter</p>
      </div>
      <Switch
        id={id}
        checked={config.useGermanFormula}
        onCheckedChange={(checked) => onChange({ useGermanFormula: checked })}
      />
    </div>
  )
}

/** Render formula offset field */
function FormulaOffsetField({
  config,
  onChange,
  id,
}: {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
  id: string
}) {
  if (!config.useGermanFormula) return null

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Formel-Offset
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min="50"
          max="120"
          step="5"
          value={config.formulaOffset}
          onChange={(e) => onChange({ formulaOffset: parseInt(e.target.value) })}
          className="text-sm w-24"
        />
      </div>
      <p className="text-xs text-gray-600">Standard: 100 (konservativ: 90, aggressiv: 110)</p>
    </div>
  )
}

function AgeFields({
  config,
  onChange,
  startAgeId,
  targetAgeId,
}: {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
  startAgeId: string
  targetAgeId: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={startAgeId} className="text-sm font-medium">Startalter</Label>
        <div className="flex items-center gap-2">
          <Input
            id={startAgeId}
            type="number"
            min="18"
            max="100"
            step="1"
            value={config.startAge}
            onChange={(e) => onChange({ startAge: parseInt(e.target.value) })}
            className="text-sm w-24"
          />
          <span className="text-sm text-gray-600">Jahre</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={targetAgeId} className="text-sm font-medium">Zielalter (Rente)</Label>
        <div className="flex items-center gap-2">
          <Input
            id={targetAgeId}
            type="number"
            min="18"
            max="100"
            step="1"
            value={config.targetAge}
            onChange={(e) => onChange({ targetAge: parseInt(e.target.value) })}
            className="text-sm w-24"
          />
          <span className="text-sm text-gray-600">Jahre</span>
        </div>
      </div>
    </div>
  )
}

function EquityFields({
  config,
  onChange,
  startEquityId,
  targetEquityId,
}: {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
  startEquityId: string
  targetEquityId: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={startEquityId} className="text-sm font-medium">Start-Aktienquote</Label>
        <div className="flex items-center gap-2">
          <Input
            id={startEquityId}
            type="number"
            min="0"
            max="100"
            step="5"
            value={(config.startEquityAllocation * 100).toFixed(0)}
            onChange={(e) => onChange({ startEquityAllocation: parseFloat(e.target.value) / 100 })}
            className="text-sm w-24"
          />
          <span className="text-sm text-gray-600">%</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={targetEquityId} className="text-sm font-medium">Ziel-Aktienquote</Label>
        <div className="flex items-center gap-2">
          <Input
            id={targetEquityId}
            type="number"
            min="0"
            max="100"
            step="5"
            value={(config.targetEquityAllocation * 100).toFixed(0)}
            onChange={(e) => onChange({ targetEquityAllocation: parseFloat(e.target.value) / 100 })}
            className="text-sm w-24"
          />
          <span className="text-sm text-gray-600">%</span>
        </div>
      </div>
    </div>
  )
}

/** Render age range and equity allocation fields */
function ConfigurationFields({
  config,
  onChange,
  startAgeId,
  targetAgeId,
  startEquityId,
  targetEquityId,
}: {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
  startAgeId: string
  targetAgeId: string
  startEquityId: string
  targetEquityId: string
}) {
  return (
    <>
      <AgeFields config={config} onChange={onChange} startAgeId={startAgeId} targetAgeId={targetAgeId} />
      {!config.useGermanFormula && (
        <EquityFields config={config} onChange={onChange} startEquityId={startEquityId} targetEquityId={targetEquityId} />
      )}
    </>
  )
}

/** Render curve selector */
function CurveSelector({
  config,
  onChange,
}: {
  config: GlidePathConfig
  onChange: (updates: Partial<GlidePathConfig>) => void
}) {
  if (config.useGermanFormula) return null

  const curves: Array<{ value: GlidePathCurve; label: string }> = [
    { value: 'linear', label: 'Linear' },
    { value: 'convex', label: 'Konvex (Vorsichtig)' },
    { value: 'concave', label: 'Konkav (Aggressiv)' },
  ]

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Anpassungskurve</Label>
      <RadioTileGroup
        value={config.curve}
        onValueChange={(value) => onChange({ curve: value as GlidePathCurve })}
      >
        {curves.map((curve) => (
          <RadioTile key={curve.value} value={curve.value} label={curve.label}>
            <p className="text-xs text-gray-600">{getGlidePathCurveDescription(curve.value)}</p>
          </RadioTile>
        ))}
      </RadioTileGroup>
    </div>
  )
}

/** Render information boxes */
function InformationBoxes({ config }: { config: GlidePathConfig }) {
  const errors = validateGlidePathConfig(config)
  const hasErrors = errors.length > 0

  return (
    <>
      {/* Information box */}
      <div className="rounded-md bg-blue-50 p-3 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Was ist ein Gleitpfad?</h4>
        <p className="text-sm text-blue-700">
          Ein Gleitpfad reduziert automatisch die Aktienquote mit zunehmendem Alter, um das Portfolio schrittweise
          konservativer zu gestalten. Die deutsche "Lebensalter-Faustformel" (Aktienquote = 100 - Lebensalter) ist
          eine bewährte Regel.
        </p>
      </div>

      {/* Validation errors */}
      {hasErrors && (
        <div className="rounded-md bg-red-50 p-3 border border-red-200">
          <h4 className="text-sm font-medium text-red-800 mb-2">Konfigurationsfehler:</h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current status */}
      {!hasErrors && (
        <div className="rounded-md bg-green-50 p-3 border border-green-200">
          <p className="text-sm text-green-700">
            ✓ Gleitpfad konfiguriert: Aktienquote wird von {config.startAge} bis {config.targetAge} Jahren angepasst
            {config.useGermanFormula && ` (Formel: ${config.formulaOffset} - Alter)`}
          </p>
        </div>
      )}
    </>
  )
}

/** Main glide path configuration component */
export function GlidePathConfiguration({ config, onChange }: GlidePathConfigurationProps) {
  // Generate unique IDs for form fields
  const enabledSwitchId = useMemo(() => generateFormId('glide-path', 'enabled'), [])
  const germanFormulaId = useMemo(() => generateFormId('glide-path', 'german-formula'), [])
  const formulaOffsetId = useMemo(() => generateFormId('glide-path', 'formula-offset'), [])
  const startAgeId = useMemo(() => generateFormId('glide-path', 'start-age'), [])
  const targetAgeId = useMemo(() => generateFormId('glide-path', 'target-age'), [])
  const startEquityId = useMemo(() => generateFormId('glide-path', 'start-equity'), [])
  const targetEquityId = useMemo(() => generateFormId('glide-path', 'target-equity'), [])

  return (
    <div className="space-y-4">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={enabledSwitchId} className="text-base font-medium">
            Dynamische Asset Allocation (Gleitpfad)
          </Label>
          <p className="text-sm text-gray-600">
            Automatische Anpassung der Aktienquote basierend auf dem Alter
          </p>
        </div>
        <Switch
          id={enabledSwitchId}
          checked={config.enabled}
          onCheckedChange={(checked) => onChange({ enabled: checked })}
        />
      </div>

      {config.enabled && (
        <>
          <InformationBoxes config={config} />

          {/* German formula toggle */}
          <GermanFormulaToggle config={config} onChange={onChange} id={germanFormulaId} />

          {/* Formula offset (only if German formula is enabled) */}
          <FormulaOffsetField config={config} onChange={onChange} id={formulaOffsetId} />

          {/* Age range and equity allocations */}
          <ConfigurationFields
            config={config}
            onChange={onChange}
            startAgeId={startAgeId}
            targetAgeId={targetAgeId}
            startEquityId={startEquityId}
            targetEquityId={targetEquityId}
          />

          {/* Curve selector (only if custom glide path) */}
          <CurveSelector config={config} onChange={onChange} />
        </>
      )}
    </div>
  )
}
