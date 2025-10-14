import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Button } from './ui/button'
import { Info, RotateCcw, TrendingUp, PieChart } from 'lucide-react'
import {
  type MultiAssetPortfolioConfig,
  type AssetClass,
  DEFAULT_ASSET_CLASSES,
  createDefaultMultiAssetConfig,
  validateMultiAssetConfig,
} from '../../helpers/multi-asset-portfolio'
import { AssetClassEditor } from './multi-asset/AssetClassEditor'

/** Information section component for multi-asset portfolio hints */
function MultiAssetInfoSection() {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-start gap-2 text-gray-700 text-sm">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">Hinweise zum Multi-Asset Portfolio:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Basiert auf historischen deutschen/europäischen Marktdaten</li>
            <li>Berücksichtigt deutsche Steuerregeln (Teilfreistellung für Aktien/REITs)</li>
            <li>Automatisches Rebalancing reduziert Portfoliorisiko</li>
            <li>Korrelationen verbessern die Realitätsnähe der Simulation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

interface MultiAssetPortfolioConfigurationProps {
  /** Current multi-asset portfolio configuration */
  values: MultiAssetPortfolioConfig
  /** Callback when configuration changes */
  onChange: (config: MultiAssetPortfolioConfig) => void
  /** Card nesting level for proper styling */
  nestingLevel?: number
}

export function MultiAssetPortfolioConfiguration({
  values,
  onChange,
  nestingLevel = 0,
}: MultiAssetPortfolioConfigurationProps) {
  // Ensure we have a valid configuration object
  const safeValues = values || createDefaultMultiAssetConfig()

  // Additional safety check - if safeValues is still undefined or malformed, create a minimal valid config
  if (!safeValues || typeof safeValues !== 'object' || !safeValues.assetClasses) {
    console.warn('MultiAssetPortfolioConfiguration received invalid values, using default config')
    const fallbackConfig = createDefaultMultiAssetConfig()
    onChange?.(fallbackConfig)
    return (
      <Card nestingLevel={nestingLevel} className="mb-4">
        <CardHeader nestingLevel={nestingLevel}>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Multi-Asset Portfolio (wird geladen...)
          </CardTitle>
        </CardHeader>
        <CardContent nestingLevel={nestingLevel}>
          <div className="p-4 text-center text-gray-600">
            Konfiguration wird initialisiert...
          </div>
        </CardContent>
      </Card>
    )
  }
  // Validate configuration
  const validationErrors = validateMultiAssetConfig(safeValues)
  const hasErrors = validationErrors.length > 0
  // Get enabled asset classes with safety check
  const enabledAssets = Object.entries(safeValues.assetClasses || {})
    .filter(([_, config]) => config && config.enabled)
  // Calculate expected portfolio return and risk
  const expectedPortfolioReturn = enabledAssets.reduce(
    (sum, [_, config]) => sum + (config.expectedReturn * config.targetAllocation),
    0,
  )
  const expectedPortfolioRisk = Math.sqrt(
    enabledAssets.reduce(
      (sum, [_, config]) => sum + Math.pow(config.volatility * config.targetAllocation, 2),
      0,
    ),
  )

  const handleConfigChange = (updates: Partial<MultiAssetPortfolioConfig>) => {
    onChange({ ...safeValues, ...updates })
  }

  const handleAssetClassChange = (
    assetClass: AssetClass,
    updates: Partial<typeof safeValues.assetClasses[AssetClass]>,
  ) => {
    onChange({
      ...safeValues,
      assetClasses: {
        ...safeValues.assetClasses,
        [assetClass]: {
          ...safeValues.assetClasses[assetClass],
          ...updates,
        },
      },
    })
  }

  const handleRebalancingChange = (updates: Partial<typeof safeValues.rebalancing>) => {
    onChange({
      ...safeValues,
      rebalancing: {
        ...safeValues.rebalancing,
        ...updates,
      },
    })
  }

  const handleSimulationChange = (updates: Partial<typeof safeValues.simulation>) => {
    onChange({
      ...safeValues,
      simulation: {
        ...safeValues.simulation,
        ...updates,
      },
    })
  }

  const resetToDefaults = () => {
    const defaultConfig = createDefaultMultiAssetConfig()
    defaultConfig.enabled = safeValues.enabled // Preserve enabled state
    onChange(defaultConfig)
  }

  const normalizeAllocations = () => {
    const enabledAssetClasses = Object.entries(safeValues.assetClasses)
      .filter(([_, config]) => config.enabled)

    if (enabledAssetClasses.length === 0) return

    const totalAllocation = enabledAssetClasses.reduce(
      (sum, [_, config]) => sum + config.targetAllocation,
      0,
    )

    if (totalAllocation === 0) return

    const normalizedAssetClasses = { ...safeValues.assetClasses }
    for (const [assetClass, config] of enabledAssetClasses) {
      normalizedAssetClasses[assetClass as AssetClass] = {
        ...config,
        targetAllocation: config.targetAllocation / totalAllocation,
      }
    }

    onChange({
      ...safeValues,
      assetClasses: normalizedAssetClasses,
    })
  }

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Multi-Asset Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-6">

          {/* Enable/Disable Multi-Asset Portfolio */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="multiasset-enabled" className="text-sm font-medium">
                Multi-Asset Portfolio aktivieren
              </Label>
              <p className="text-xs text-gray-600">
                Erweiterte Portfolioallokation mit automatischem Rebalancing
              </p>
            </div>
            <Switch
              id="multiasset-enabled"
              checked={safeValues.enabled}
              onCheckedChange={enabled => handleConfigChange({ enabled })}
            />
          </div>

          {safeValues.enabled && (
            <>
              {/* Validation Errors */}
              {hasErrors && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start gap-2 text-red-800 text-sm">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Konfigurationsfehler:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio Overview */}
              {!hasErrors && enabledAssets.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Portfolio-Übersicht</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Erwartete Rendite:</span>
                      <span className="font-medium ml-2">
                        {(expectedPortfolioReturn * 100).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Portfoliorisiko:</span>
                      <span className="font-medium ml-2">
                        {(expectedPortfolioRisk * 100).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Asset Classes Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Anlageklassen</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={normalizeAllocations}
                      className="text-xs"
                      disabled={enabledAssets.length === 0}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Normalisieren
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToDefaults}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Zurücksetzen
                    </Button>
                  </div>
                </div>

                {Object.entries(DEFAULT_ASSET_CLASSES).map(([assetClass, defaultConfig]) => {
                  const currentConfig = safeValues.assetClasses[assetClass as AssetClass]

                  return (
                    <AssetClassEditor
                      key={assetClass}
                      assetClass={assetClass as AssetClass}
                      name={defaultConfig.name}
                      description={defaultConfig.description}
                      config={currentConfig}
                      onChange={handleAssetClassChange}
                    />
                  )
                })}
              </div>

              {/* Rebalancing Configuration */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Rebalancing</h3>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Rebalancing-Häufigkeit</Label>
                  <RadioTileGroup
                    value={safeValues.rebalancing.frequency}
                    onValueChange={frequency =>
                      handleRebalancingChange({ frequency: frequency as 'never' | 'monthly' | 'quarterly' | 'annually' })}
                  >
                    <RadioTile value="never" label="Nie">Nie</RadioTile>
                    <RadioTile value="annually" label="Jährlich">Jährlich</RadioTile>
                    <RadioTile value="quarterly" label="Quartalsweise">Quartalsweise</RadioTile>
                    <RadioTile value="monthly" label="Monatlich">Monatlich</RadioTile>
                  </RadioTileGroup>
                </div>

                {safeValues.rebalancing.frequency !== 'never' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={values.rebalancing.useThreshold}
                        onCheckedChange={useThreshold =>
                          handleRebalancingChange({ useThreshold })}
                      />
                      <Label className="text-sm">
                        Schwellenwert-basiertes Rebalancing
                      </Label>
                    </div>

                    {values.rebalancing.useThreshold && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Drift-Schwellenwert:
                          {' '}
                          {(values.rebalancing.threshold * 100).toFixed(1)}
                          %
                        </Label>
                        <Slider
                          value={[values.rebalancing.threshold * 100]}
                          onValueChange={([value]) =>
                            handleRebalancingChange({ threshold: value / 100 })}
                          min={1}
                          max={20}
                          step={0.5}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-600">
                          Rebalancing erfolgt wenn eine Anlageklasse um mehr als diesen Wert
                          von der Zielallokation abweicht
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Advanced Simulation Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Erweiterte Einstellungen</h3>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={values.simulation.useCorrelation}
                    onCheckedChange={useCorrelation =>
                      handleSimulationChange({ useCorrelation })}
                  />
                  <Label className="text-sm">
                    Historische Korrelationen verwenden
                  </Label>
                </div>
                <p className="text-xs text-gray-600">
                  Berücksichtigt die historischen Korrelationen zwischen den Anlageklassen
                  für realistischere Simulationsergebnisse
                </p>

                <div className="space-y-2">
                  <Label htmlFor="multiasset-seed" className="text-sm font-medium">
                    Zufalls-Seed (optional)
                  </Label>
                  <Input
                    id="multiasset-seed"
                    type="number"
                    value={values.simulation.seed || ''}
                    onChange={(e) => {
                      const seed = e.target.value ? parseInt(e.target.value) : undefined
                      handleSimulationChange({ seed })
                    }}
                    placeholder="Für reproduzierbare Ergebnisse"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-600">
                    Optionale Zahl für reproduzierbare Zufallsrenditen
                  </p>
                </div>
              </div>

              {/* Information Section */}
              <MultiAssetInfoSection />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default MultiAssetPortfolioConfiguration
