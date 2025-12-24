import { useMemo } from 'react'
import {
  type AssetClass,
  type MultiAssetPortfolioConfig,
  ASSET_CORRELATION_MATRIX,
} from '../../../helpers/multi-asset-portfolio'
import { Info } from 'lucide-react'

interface CorrelationMatrixHeatmapProps {
  /** Current multi-asset portfolio configuration to determine which assets to display */
  config: MultiAssetPortfolioConfig
}

interface CorrelationTableProps {
  enabledAssets: AssetClass[]
  config: MultiAssetPortfolioConfig
}

/**
 * Get color for correlation value
 * Positive correlations: shades of blue (0 to 1)
 * Negative correlations: shades of red (-1 to 0)
 */
function getCorrelationColor(value: number): string {
  // Clamp value between -1 and 1
  const clampedValue = Math.max(-1, Math.min(1, value))

  if (clampedValue >= 0) {
    // Positive correlation: white to blue
    const intensity = Math.round(clampedValue * 200)
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`
  } else {
    // Negative correlation: white to red
    const intensity = Math.round(Math.abs(clampedValue) * 200)
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`
  }
}

/**
 * Format correlation value for display
 */
function formatCorrelation(value: number): string {
  return value.toFixed(2)
}

/**
 * Get asset class short name for display in matrix headers
 */
function getAssetShortName(assetClass: AssetClass, fullName: string): string {
  const shortNames: Record<AssetClass, string> = {
    stocks_domestic: 'DE Aktien',
    stocks_international: 'Int. Aktien',
    bonds_government: 'Staatsanl.',
    bonds_corporate: 'Untern.anl.',
    real_estate: 'REITs',
    commodities: 'Rohstoffe',
    cash: 'Liquidität',
  }
  return shortNames[assetClass] || fullName
}

/**
 * Legend component showing correlation color coding
 */
function CorrelationLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 rounded border border-gray-200" style={{ backgroundColor: 'rgb(55, 55, 255)' }} />
        <span>Starke positive Korrelation (+1.0)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 rounded border border-gray-200" style={{ backgroundColor: 'rgb(255, 255, 255)' }} />
        <span>Keine Korrelation (0.0)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 rounded border border-gray-200" style={{ backgroundColor: 'rgb(255, 55, 55)' }} />
        <span>Starke negative Korrelation (-1.0)</span>
      </div>
    </div>
  )
}

/**
 * Correlation table row component
 */
function CorrelationTableRow({
  rowAsset,
  enabledAssets,
  config,
}: {
  rowAsset: AssetClass
  enabledAssets: AssetClass[]
  config: MultiAssetPortfolioConfig
}) {
  return (
    <tr>
      <th
        className="p-2 text-xs font-medium text-gray-700 text-left border-r border-gray-200 whitespace-nowrap"
        title={config.assetClasses[rowAsset].name}
      >
        {getAssetShortName(rowAsset, config.assetClasses[rowAsset].name)}
      </th>
      {enabledAssets.map(colAsset => {
        const correlation = ASSET_CORRELATION_MATRIX[rowAsset][colAsset]
        const isDiagonal = rowAsset === colAsset

        return (
          <td
            key={colAsset}
            className={`p-2 text-center border border-gray-200 ${isDiagonal ? 'font-semibold' : ''}`}
            style={{
              backgroundColor: getCorrelationColor(correlation),
            }}
            title={`Korrelation zwischen ${config.assetClasses[rowAsset].name} und ${config.assetClasses[colAsset].name}: ${formatCorrelation(correlation)}`}
          >
            <span className="text-xs font-mono">{formatCorrelation(correlation)}</span>
          </td>
        )
      })}
    </tr>
  )
}

/**
 * Correlation table component
 */
function CorrelationTable({ enabledAssets, config }: CorrelationTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-medium text-gray-500 text-left">{/* Empty corner cell */}</th>
              {enabledAssets.map(assetClass => (
                <th
                  key={assetClass}
                  className="p-2 text-xs font-medium text-gray-700 text-center border-b border-gray-200"
                  title={config.assetClasses[assetClass].name}
                >
                  <div className="whitespace-nowrap">
                    {getAssetShortName(assetClass, config.assetClasses[assetClass].name)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enabledAssets.map(rowAsset => (
              <CorrelationTableRow key={rowAsset} rowAsset={rowAsset} enabledAssets={enabledAssets} config={config} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Correlation Matrix Heatmap Component
 *
 * Visualizes the correlation matrix between enabled asset classes
 * using a color-coded heatmap. Positive correlations are shown in blue,
 * negative correlations in red, with intensity representing the strength.
 */
export function CorrelationMatrixHeatmap({ config }: CorrelationMatrixHeatmapProps) {
  // Get enabled asset classes
  const enabledAssets = useMemo(() => {
    return (Object.keys(config.assetClasses) as AssetClass[]).filter(
      assetClass => config.assetClasses[assetClass].enabled,
    )
  }, [config.assetClasses])

  // Don't show matrix if fewer than 2 assets are enabled
  if (enabledAssets.length < 2) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-600" />
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">Korrelationsmatrix</p>
          <p className="text-xs text-gray-600">
            Zeigt die historischen Korrelationen zwischen den Anlageklassen. Positive Werte (blau) bedeuten
            gleichgerichtete Bewegungen, negative Werte (rot) gegenläufige Bewegungen.
          </p>
        </div>
      </div>

      <CorrelationTable enabledAssets={enabledAssets} config={config} />

      <CorrelationLegend />
    </div>
  )
}
