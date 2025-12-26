import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { generateFormId } from '../utils/unique-id'
import type { ESGFilterConfig } from '../../helpers/esg-scoring'

interface ESGFilterConfigurationProps {
  config: ESGFilterConfig
  onConfigChange: (config: ESGFilterConfig) => void
}

interface ScoreSliderProps {
  id: string
  label: string
  value: number | undefined
  onChange: (value: number[]) => void
  onAdd?: () => void
  onRemove?: () => void
}

function ScoreSlider({ id, label, value, onChange, onAdd, onRemove }: ScoreSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {value !== undefined ? `${value.toFixed(1)} / 10` : 'Nicht gesetzt'}
          </span>
          {value !== undefined && onRemove && (
            <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">
              Entfernen
            </button>
          )}
        </div>
      </div>
      {value !== undefined ? (
        <Slider id={id} min={1} max={10} step={0.5} value={[value]} onValueChange={onChange} className="w-full" />
      ) : (
        onAdd && (
          <button type="button" onClick={onAdd} className="text-xs text-blue-600 hover:underline">
            Schwellenwert hinzufügen
          </button>
        )
      )}
    </div>
  )
}

function WeightSlider({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number[]) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
      </div>
      <Slider id={id} min={0} max={100} step={5} value={[value * 100]} onValueChange={onChange} className="w-full" />
    </div>
  )
}

function ESGWeightsSection({
  ids,
  config,
  onWeightChange,
}: {
  ids: { envWeight: string; socialWeight: string; govWeight: string }
  config: ESGFilterConfig
  onWeightChange: (pillar: 'environmental' | 'social' | 'governance', value: number[]) => void
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="font-medium text-sm">ESG-Pfeiler Gewichtungen</h4>
      <p className="text-xs text-muted-foreground">
        Passen Sie an, wie wichtig Ihnen die einzelnen Nachhaltigkeitsaspekte sind (müssen zusammen 100% ergeben)
      </p>
      <WeightSlider
        id={ids.envWeight}
        label="🌍 Umwelt (Environmental)"
        value={config.environmentalWeight}
        onChange={(v) => onWeightChange('environmental', v)}
      />
      <WeightSlider
        id={ids.socialWeight}
        label="👥 Soziales (Social)"
        value={config.socialWeight}
        onChange={(v) => onWeightChange('social', v)}
      />
      <WeightSlider
        id={ids.govWeight}
        label="⚖️ Unternehmensführung (Governance)"
        value={config.governanceWeight}
        onChange={(v) => onWeightChange('governance', v)}
      />
    </div>
  )
}

function ESGPillarThresholdsSection({
  ids,
  config,
  onThresholdChange,
}: {
  ids: { envScore: string; socialScore: string; govScore: string }
  config: ESGFilterConfig
  onThresholdChange: (pillar: 'environmental' | 'social' | 'governance', value: number[] | null) => void
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="font-medium text-sm">Optionale Mindest-Scores pro Pfeiler</h4>
      <p className="text-xs text-muted-foreground">
        Setzen Sie zusätzliche Mindestanforderungen für einzelne ESG-Aspekte (optional)
      </p>
      <ScoreSlider
        id={ids.envScore}
        label="🌍 Umwelt-Score"
        value={config.minimumEnvironmentalScore}
        onChange={(v) => onThresholdChange('environmental', v)}
        onAdd={() => onThresholdChange('environmental', [5])}
        onRemove={() => onThresholdChange('environmental', null)}
      />
      <ScoreSlider
        id={ids.socialScore}
        label="👥 Sozial-Score"
        value={config.minimumSocialScore}
        onChange={(v) => onThresholdChange('social', v)}
        onAdd={() => onThresholdChange('social', [5])}
        onRemove={() => onThresholdChange('social', null)}
      />
      <ScoreSlider
        id={ids.govScore}
        label="⚖️ Governance-Score"
        value={config.minimumGovernanceScore}
        onChange={(v) => onThresholdChange('governance', v)}
        onAdd={() => onThresholdChange('governance', [5])}
        onRemove={() => onThresholdChange('governance', null)}
      />
    </div>
  )
}

function ESGInfoBox() {
  return (
    <div className="rounded-lg bg-blue-50 p-4 text-sm">
      <h4 className="font-medium mb-2">💡 ESG-Kriterien nach EU-Standards</h4>
      <ul className="space-y-1 text-xs text-gray-700">
        <li>
          • <strong>Environmental:</strong> Klimaschutz, Ressourcennutzung, Umweltverschmutzung
        </li>
        <li>
          • <strong>Social:</strong> Arbeitsbedingungen, Gemeinwohl, Menschenrechte
        </li>
        <li>
          • <strong>Governance:</strong> Unternehmensführung, Ethik, Transparenz
        </li>
      </ul>
      <p className="mt-2 text-xs text-gray-600">
        Die Scores basieren auf EU-Taxonomie und SFDR (Sustainable Finance Disclosure Regulation). Höhere
        ESG-Anforderungen können die Diversifikation und erwartete Rendite beeinflussen.
      </p>
    </div>
  )
}

function ESGFilterContent({
  ids,
  config,
  onConfigChange,
  onWeightChange,
  onThresholdChange,
}: {
  ids: Record<string, string>
  config: ESGFilterConfig
  onConfigChange: (config: ESGFilterConfig) => void
  onWeightChange: (pillar: 'environmental' | 'social' | 'governance', value: number[]) => void
  onThresholdChange: (pillar: 'environmental' | 'social' | 'governance', value: number[] | null) => void
}) {
  return (
    <>
      <ScoreSlider
        id={ids.overallScore}
        label="Minimaler Gesamt-ESG-Score"
        value={config.minimumOverallScore}
        onChange={(v) => onConfigChange({ ...config, minimumOverallScore: v[0] })}
      />
      <ESGWeightsSection
        ids={{ envWeight: ids.envWeight, socialWeight: ids.socialWeight, govWeight: ids.govWeight }}
        config={config}
        onWeightChange={onWeightChange}
      />
      <ESGPillarThresholdsSection
        ids={{ envScore: ids.envScore, socialScore: ids.socialScore, govScore: ids.govScore }}
        config={config}
        onThresholdChange={onThresholdChange}
      />
      <ESGInfoBox />
    </>
  )
}

function calculateWeightUpdates(
  pillar: 'environmental' | 'social' | 'governance',
  newWeight: number,
  config: ESGFilterConfig,
): Partial<ESGFilterConfig> {
  const remaining = 1 - newWeight

  if (pillar === 'environmental') {
    const ratio = config.socialWeight / (config.socialWeight + config.governanceWeight)
    return {
      environmentalWeight: newWeight,
      socialWeight: remaining * ratio,
      governanceWeight: remaining * (1 - ratio),
    }
  }

  if (pillar === 'social') {
    const ratio = config.environmentalWeight / (config.environmentalWeight + config.governanceWeight)
    return {
      environmentalWeight: remaining * ratio,
      socialWeight: newWeight,
      governanceWeight: remaining * (1 - ratio),
    }
  }

  const ratio = config.environmentalWeight / (config.environmentalWeight + config.socialWeight)
  return {
    environmentalWeight: remaining * ratio,
    socialWeight: remaining * (1 - ratio),
    governanceWeight: newWeight,
  }
}

/**
 * ESG Filter Configuration Component
 */
export function ESGFilterConfiguration({ config, onConfigChange }: ESGFilterConfigurationProps) {
  const ids = useMemo(
    () => ({
      enabledSwitch: generateFormId('esg-filter', 'enabled'),
      overallScore: generateFormId('esg-filter', 'overall-score'),
      envScore: generateFormId('esg-filter', 'env-score'),
      socialScore: generateFormId('esg-filter', 'social-score'),
      govScore: generateFormId('esg-filter', 'gov-score'),
      envWeight: generateFormId('esg-filter', 'env-weight'),
      socialWeight: generateFormId('esg-filter', 'social-weight'),
      govWeight: generateFormId('esg-filter', 'gov-weight'),
    }),
    [],
  )

  const handleWeightChange = (p: 'environmental' | 'social' | 'governance', v: number[]) => {
    onConfigChange({ ...config, ...calculateWeightUpdates(p, v[0] / 100, config) })
  }

  const handleThresholdChange = (p: 'environmental' | 'social' | 'governance', v: number[] | null) => {
    const k = p === 'environmental' ? 'minimumEnvironmentalScore' : p === 'social' ? 'minimumSocialScore' : 'minimumGovernanceScore'
    onConfigChange({ ...config, [k]: v ? v[0] : undefined })
  }

  return (
    <Card nestingLevel={2}>
      <ESGFilterCardHeader />
      <CardContent nestingLevel={2} className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor={ids.enabledSwitch} className="cursor-pointer">ESG-Filter aktivieren</Label>
          <Switch id={ids.enabledSwitch} checked={config.enabled} onCheckedChange={(e) => onConfigChange({ ...config, enabled: e })} />
        </div>
        {config.enabled && <ESGFilterContent ids={ids} config={config} onConfigChange={onConfigChange} onWeightChange={handleWeightChange} onThresholdChange={handleThresholdChange} />}
      </CardContent>
    </Card>
  )
}

function ESGFilterCardHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        🌱 ESG-Filter (Nachhaltigkeits-Filter)
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 cursor-help text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>
              Filtern Sie Anlageklassen nach ESG-Kriterien. Investitionen, die die Mindest-Scores nicht erfüllen, werden
              ausgeschlossen.
            </p>
          </TooltipContent>
        </Tooltip>
      </CardTitle>
      <CardDescription>Nachhaltigkeitskriterien nach EU-Standards (SFDR)</CardDescription>
    </CardHeader>
  )
}
