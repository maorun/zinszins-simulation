import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  type BenchmarkConfig,
  type BenchmarkType,
  getBenchmarkName,
  validateBenchmarkConfig,
} from '../../helpers/benchmark'
import { generateFormId } from '../utils/unique-id'
import { NestingProvider } from '../lib/nesting-context'

interface BenchmarkConfigurationProps {
  benchmarkConfig: BenchmarkConfig
  onBenchmarkConfigChange: (config: BenchmarkConfig) => void
  /** Optional nesting level for nested contexts */
  nestingLevel?: number
}

/**
 * Information box about benchmark comparison
 */
function BenchmarkInfoBox() {
  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800">
        <strong>ℹ️ Benchmark-Vergleich:</strong> Vergleichen Sie die Performance Ihres Portfolios mit bekannten
        Marktindizes. Dies hilft Ihnen zu verstehen, ob Ihre Anlagestrategie besser oder schlechter als der Markt
        abschneidet.
      </p>
    </div>
  )
}

/**
 * Historical data information box
 */
function HistoricalDataInfo() {
  return (
    <div className="p-3 bg-green-50 rounded border border-green-200">
      <p className="text-xs text-green-800">
        <strong>📈 Historische Daten:</strong> Für Jahre 2000-2023 werden historische Renditen verwendet. Für
        zukünftige Jahre wird der langfristige Durchschnitt verwendet.
      </p>
    </div>
  )
}

/**
 * Validation errors display
 */
function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null

  return (
    <div className="p-3 bg-red-50 rounded border border-red-200">
      <p className="text-xs text-red-800 font-semibold mb-1">⚠️ Konfigurationsfehler:</p>
      <ul className="text-xs text-red-800 list-disc list-inside">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Benchmark options for radio selection
 */
const BENCHMARK_OPTIONS = [
  { value: 'msci-world', label: 'MSCI World (Globale Aktien)', id: 'bench-msci-world' },
  { value: 'dax', label: 'DAX (Deutsche Aktien)', id: 'bench-dax' },
  { value: 'msci-acwi', label: 'MSCI ACWI (Alle Märkte weltweit)', id: 'bench-msci-acwi' },
  { value: 'sp500', label: 'S&P 500 (US-Aktien)', id: 'bench-sp500' },
  { value: 'stoxx600', label: 'STOXX Europe 600 (Europäische Aktien)', id: 'bench-stoxx600' },
  { value: 'msci-em', label: 'MSCI Emerging Markets (Schwellenmärkte)', id: 'bench-msci-em' },
  { value: 'custom', label: 'Benutzerdefiniert', id: 'bench-custom' },
] as const

/**
 * Benchmark type selector with radio buttons
 */
function BenchmarkTypeSelector({
  benchmarkType,
  onBenchmarkTypeChange,
}: {
  benchmarkType: BenchmarkType
  onBenchmarkTypeChange: (type: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Benchmark auswählen</Label>
      <RadioGroup value={benchmarkType} onValueChange={onBenchmarkTypeChange}>
        <div className="space-y-2">
          {BENCHMARK_OPTIONS.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.id} />
              <Label htmlFor={option.id} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

/**
 * Custom benchmark configuration fields
 */
function CustomBenchmarkConfig({
  benchmarkConfig,
  customNameId,
  customReturnId,
  onCustomNameChange,
  onCustomReturnChange,
}: {
  benchmarkConfig: BenchmarkConfig
  customNameId: string
  customReturnId: string
  onCustomNameChange: (value: string) => void
  onCustomReturnChange: (value: string) => void
}) {
  return (
    <div className="space-y-4 p-3 bg-gray-50 rounded border border-gray-200">
      <div className="space-y-2">
        <Label htmlFor={customNameId} className="text-sm font-medium">
          Benchmark-Name
        </Label>
        <Input
          id={customNameId}
          type="text"
          value={benchmarkConfig.customName ?? 'Benutzerdefinierter Benchmark'}
          onChange={e => onCustomNameChange(e.target.value)}
          placeholder="z.B. Mein 60/40 Portfolio"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={customReturnId} className="text-sm font-medium">
          Jährliche Rendite (%)
        </Label>
        <Input
          id={customReturnId}
          type="number"
          value={((benchmarkConfig.customAnnualReturn ?? 0.07) * 100).toFixed(2)}
          onChange={e => onCustomReturnChange(e.target.value)}
          min="-50"
          max="100"
          step="0.1"
        />
        <p className="text-xs text-gray-600">Erwartete durchschnittliche jährliche Rendite des Benchmarks</p>
      </div>
    </div>
  )
}

/**
 * Content displayed when benchmark is enabled
 */
function BenchmarkEnabledContent({
  benchmarkConfig,
  customNameId,
  customReturnId,
  errors,
  onBenchmarkTypeChange,
  onCustomNameChange,
  onCustomReturnChange,
}: {
  benchmarkConfig: BenchmarkConfig
  customNameId: string
  customReturnId: string
  errors: string[]
  onBenchmarkTypeChange: (type: string) => void
  onCustomNameChange: (value: string) => void
  onCustomReturnChange: (value: string) => void
}) {
  return (
    <>
      <BenchmarkInfoBox />
      <BenchmarkTypeSelector benchmarkType={benchmarkConfig.benchmarkType} onBenchmarkTypeChange={onBenchmarkTypeChange} />

      {benchmarkConfig.benchmarkType === 'custom' && (
        <CustomBenchmarkConfig
          benchmarkConfig={benchmarkConfig}
          customNameId={customNameId}
          customReturnId={customReturnId}
          onCustomNameChange={onCustomNameChange}
          onCustomReturnChange={onCustomReturnChange}
        />
      )}

      <ValidationErrors errors={errors} />

      {benchmarkConfig.benchmarkType !== 'custom' && <HistoricalDataInfo />}
    </>
  )
}

/**
 * Benchmark configuration card header
 */
function BenchmarkCardHeader({
  nestingLevel,
  enabled,
  benchmarkName,
}: {
  nestingLevel: number
  enabled: boolean
  benchmarkName: string
}) {
  return (
    <CardHeader nestingLevel={nestingLevel}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
          <CardTitle className="text-left flex items-center gap-2">
            📊 Benchmark-Vergleich
            {enabled && <span className="text-xs font-normal text-gray-600">({benchmarkName})</span>}
          </CardTitle>
          <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
}

/**
 * Custom hook for benchmark configuration handlers
 */
function useBenchmarkHandlers(
  benchmarkConfig: BenchmarkConfig,
  onBenchmarkConfigChange: (config: BenchmarkConfig) => void,
) {
  const handleBenchmarkTypeChange = (value: string) => {
    onBenchmarkConfigChange({ ...benchmarkConfig, benchmarkType: value as BenchmarkType })
  }

  const handleCustomReturnChange = (value: string) => {
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue)) {
      onBenchmarkConfigChange({ ...benchmarkConfig, customAnnualReturn: numericValue / 100 })
    }
  }

  const handleCustomNameChange = (value: string) => {
    onBenchmarkConfigChange({ ...benchmarkConfig, customName: value })
  }

  return {
    handleBenchmarkTypeChange,
    handleCustomReturnChange,
    handleCustomNameChange,
  }
}

/**
 * Benchmark card content with enable switch and configuration
 */
function BenchmarkCardContent({
  enabledSwitchId,
  benchmarkConfig,
  customNameId,
  customReturnId,
  errors,
  onBenchmarkConfigChange,
  onBenchmarkTypeChange,
  onCustomNameChange,
  onCustomReturnChange,
}: {
  enabledSwitchId: string
  benchmarkConfig: BenchmarkConfig
  customNameId: string
  customReturnId: string
  errors: string[]
  onBenchmarkConfigChange: (config: BenchmarkConfig) => void
  onBenchmarkTypeChange: (type: string) => void
  onCustomNameChange: (value: string) => void
  onCustomReturnChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={enabledSwitchId} className="text-sm font-medium">
          Benchmark-Vergleich aktivieren
        </Label>
        <Switch
          id={enabledSwitchId}
          checked={benchmarkConfig.enabled}
          onCheckedChange={checked => onBenchmarkConfigChange({ ...benchmarkConfig, enabled: checked })}
        />
      </div>

      {benchmarkConfig.enabled && (
        <BenchmarkEnabledContent
          benchmarkConfig={benchmarkConfig}
          customNameId={customNameId}
          customReturnId={customReturnId}
          errors={errors}
          onBenchmarkTypeChange={onBenchmarkTypeChange}
          onCustomNameChange={onCustomNameChange}
          onCustomReturnChange={onCustomReturnChange}
        />
      )}
    </div>
  )
}

/**
 * Benchmark configuration component
 * Allows users to enable benchmark comparison and select a benchmark type
 */
export function BenchmarkConfiguration({
  benchmarkConfig,
  onBenchmarkConfigChange,
  nestingLevel = 1,
}: BenchmarkConfigurationProps) {
  const enabledSwitchId = useMemo(() => generateFormId('benchmark-config', 'enabled'), [])
  const customReturnId = useMemo(() => generateFormId('benchmark-config', 'custom-return'), [])
  const customNameId = useMemo(() => generateFormId('benchmark-config', 'custom-name'), [])

  const errors = validateBenchmarkConfig(benchmarkConfig)
  const currentBenchmarkName = getBenchmarkName(benchmarkConfig)

  const { handleBenchmarkTypeChange, handleCustomReturnChange, handleCustomNameChange } = useBenchmarkHandlers(
    benchmarkConfig,
    onBenchmarkConfigChange,
  )

  return (
    <NestingProvider level={nestingLevel}>
      <Card nestingLevel={nestingLevel}>
        <Collapsible defaultOpen={false}>
          <BenchmarkCardHeader
            nestingLevel={nestingLevel}
            enabled={benchmarkConfig.enabled}
            benchmarkName={currentBenchmarkName}
          />
          <CollapsibleContent>
            <CardContent nestingLevel={nestingLevel}>
              <BenchmarkCardContent
                enabledSwitchId={enabledSwitchId}
                benchmarkConfig={benchmarkConfig}
                customNameId={customNameId}
                customReturnId={customReturnId}
                errors={errors}
                onBenchmarkConfigChange={onBenchmarkConfigChange}
                onBenchmarkTypeChange={handleBenchmarkTypeChange}
                onCustomNameChange={handleCustomNameChange}
                onCustomReturnChange={handleCustomReturnChange}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </NestingProvider>
  )
}
