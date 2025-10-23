import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
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
import { AssetAllocationSummary } from './multi-asset/AssetAllocationSummary'
import { RebalancingConfiguration } from './multi-asset/RebalancingConfiguration'
import { AdvancedSimulationSettings } from './multi-asset/AdvancedSimulationSettings'

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

/**
 * Validate and get safe configuration values
 */
function getSafeMultiAssetConfig(
  values: MultiAssetPortfolioConfig | undefined,
  onChange: (config: MultiAssetPortfolioConfig) => void,
): MultiAssetPortfolioConfig | null {
  // Ensure we have a valid configuration object
  const safeValues = values || createDefaultMultiAssetConfig()

  // Additional safety check - if safeValues is still undefined or malformed, create a minimal valid config
  if (!safeValues || typeof safeValues !== 'object' || !safeValues.assetClasses) {
    console.warn('MultiAssetPortfolioConfiguration received invalid values, using default config')
    const fallbackConfig = createDefaultMultiAssetConfig()
    onChange?.(fallbackConfig)
    return null // Signal that fallback UI should be shown
  }

  return safeValues
}

// eslint-disable-next-line max-lines-per-function -- Complex configuration component
export function MultiAssetPortfolioConfiguration({
  values,
  onChange,
  nestingLevel = 0,
}: MultiAssetPortfolioConfigurationProps) {
  const safeValues = getSafeMultiAssetConfig(values, onChange)

  // Show loading state if configuration is being initialized
  if (!safeValues) {
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
              {/* Portfolio Overview or Validation Errors */}
              <AssetAllocationSummary
                expectedReturn={expectedPortfolioReturn}
                expectedRisk={expectedPortfolioRisk}
                enabledAssetsCount={enabledAssets.length}
                validationErrors={validationErrors}
              />

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
              <RebalancingConfiguration
                config={safeValues.rebalancing}
                onChange={handleRebalancingChange}
              />

              {/* Advanced Simulation Settings */}
              <AdvancedSimulationSettings
                config={safeValues.simulation}
                onChange={handleSimulationChange}
              />

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
