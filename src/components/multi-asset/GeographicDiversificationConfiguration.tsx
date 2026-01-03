/**
 * Geographic Diversification Configuration Component
 */

import { useMemo } from 'react'
import {
  type GeographicRegion,
  type GeographicDiversificationConfig,
  DEFAULT_GEOGRAPHIC_REGIONS,
  calculateGeographicPortfolioReturn,
  calculateGeographicPortfolioVolatility,
  normalizeGeographicAllocations,
  validateGeographicDiversificationConfig,
} from '../../../helpers/geographic-diversification'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Info, Globe } from 'lucide-react'
import { generateFormId } from '../../utils/unique-id'
import { formatCurrency } from '../../utils/currency'

interface GeographicDiversificationConfigurationProps {
  config: GeographicDiversificationConfig
  onChange: (updates: Partial<GeographicDiversificationConfig>) => void
  internationalStocksValue?: number
}

/**
 * Region detail display
 */
function RegionDetails({ region }: { region: GeographicDiversificationConfig['regions'][GeographicRegion] }) {
  return (
    <div className="ml-8 text-xs text-gray-600 space-y-1">
      <div className="flex justify-between">
        <span>Quellensteuer:</span>
        <span className="font-medium">
          {(region.withholdingTaxRate * 100).toFixed(1)}%
        </span>
      </div>
      <div className="flex justify-between">
        <span>Dividendenrendite:</span>
        <span className="font-medium">
          {(region.dividendYield * 100).toFixed(2)}%
        </span>
      </div>
      <div className="flex justify-between">
        <span>Erwartete Rendite:</span>
        <span className="font-medium">
          {(region.expectedReturn * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

/**
 * Region allocation slider
 */
function RegionAllocationSlider({
  region,
  regionKey,
  config,
  onChange,
}: {
  region: GeographicDiversificationConfig['regions'][GeographicRegion]
  regionKey: GeographicRegion
  config: GeographicDiversificationConfig
  onChange: (updates: Partial<GeographicDiversificationConfig>) => void
}) {
  const sliderId = useMemo(
    () => generateFormId('geo-div-region', regionKey, 'allocation'),
    [regionKey],
  )

  const handleChange = (value: number[]) => {
    onChange({
      regions: {
        ...config.regions,
        [regionKey]: {
          ...region,
          targetAllocation: value[0] / 100,
        },
      },
    })
  }

  return (
    <div className="ml-8 mb-2">
      <Slider
        id={sliderId}
        value={[region.targetAllocation * 100]}
        onValueChange={handleChange}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  )
}

/**
 * Region row component
 */
function RegionRow({
  region,
  regionKey,
  config,
  onChange,
}: {
  region: GeographicDiversificationConfig['regions'][GeographicRegion]
  regionKey: GeographicRegion
  config: GeographicDiversificationConfig
  onChange: (updates: Partial<GeographicDiversificationConfig>) => void
}) {
  const switchId = useMemo(
    () => generateFormId('geo-div-region', regionKey, 'enabled'),
    [regionKey],
  )

  const handleEnabledChange = (enabled: boolean) => {
    onChange({
      regions: {
        ...config.regions,
        [regionKey]: { ...region, enabled },
      },
    })
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Switch id={switchId} checked={region.enabled} onCheckedChange={handleEnabledChange} />
          <Label htmlFor={switchId} className="font-medium text-sm">
            {region.name}
          </Label>
        </div>
        <div className="text-xs text-gray-500">{(region.targetAllocation * 100).toFixed(1)}%</div>
      </div>
      {region.enabled && (
        <>
          <RegionAllocationSlider region={region} regionKey={regionKey} config={config} onChange={onChange} />
          <RegionDetails region={region} />
        </>
      )}
    </div>
  )
}

/**
 * Info section
 */
function InfoSection() {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-start gap-2 text-blue-900 text-sm">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">Regionale Aufteilung internationaler Aktien</p>
          <p className="text-xs">
            Ermöglicht detaillierte Kontrolle über die geografische Verteilung Ihrer
            internationalen Aktieninvestments mit automatischer Berechnung der Quellensteuer pro
            Region.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Validation errors display
 */
function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-800 text-sm font-medium mb-1">Validierungsfehler:</p>
      <ul className="list-disc list-inside text-red-700 text-xs space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Portfolio statistics display
 */
function PortfolioStats({ portfolioReturn, portfolioVolatility }: { portfolioReturn: number; portfolioVolatility: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-xs text-gray-600 mb-1">Portfolio-Rendite</div>
        <div className="text-lg font-semibold text-gray-900">
          {(portfolioReturn * 100).toFixed(2)}%
        </div>
      </div>
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-xs text-gray-600 mb-1">Portfolio-Risiko</div>
        <div className="text-lg font-semibold text-gray-900">
          {(portfolioVolatility * 100).toFixed(2)}%
        </div>
      </div>
    </div>
  )
}

/**
 * Withholding tax preview
 */
function WithholdingTaxPreview({ internationalStocksValue }: { internationalStocksValue: number }) {
  if (internationalStocksValue <= 0) return null

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="text-sm font-medium text-yellow-900 mb-2">
        Geschätzte Quellensteuer-Auswirkung
      </div>
      <div className="text-xs text-yellow-800 space-y-1">
        <div className="flex justify-between">
          <span>Bei internationalem Kapital von:</span>
          <span className="font-medium">{formatCurrency(internationalStocksValue)}</span>
        </div>
        <div className="text-xs text-yellow-700 mt-2">
          Die tatsächliche Quellensteuer wird während der Simulation basierend auf den
          Dividendenerträgen berechnet.
        </div>
      </div>
    </div>
  )
}

/**
 * Region list component
 */
function RegionList({
  config,
  onChange,
}: {
  config: GeographicDiversificationConfig
  onChange: (updates: Partial<GeographicDiversificationConfig>) => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="space-y-1">
        {(
          Object.entries(config.regions) as Array<
            [GeographicRegion, typeof config.regions[GeographicRegion]]
          >
        ).map(([regionKey, region]) => (
          <RegionRow key={regionKey} region={region} regionKey={regionKey} config={config} onChange={onChange} />
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const normalized = normalizeGeographicAllocations(config)
            onChange({ regions: normalized.regions })
          }}
          className="text-xs"
        >
          Auf 100% normalisieren
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange({ regions: { ...DEFAULT_GEOGRAPHIC_REGIONS } })}
          className="text-xs"
        >
          Zurücksetzen
        </Button>
      </div>
    </div>
  )
}

/**
 * Main configuration component
 */
export function GeographicDiversificationConfiguration({
  config,
  onChange,
  internationalStocksValue = 0,
}: GeographicDiversificationConfigurationProps) {
  const mainSwitchId = useMemo(() => generateFormId('geo-div-main', 'enabled'), [])
  const validationErrors = useMemo(() => validateGeographicDiversificationConfig(config), [config])
  const portfolioReturn = useMemo(() => calculateGeographicPortfolioReturn(config), [config])
  const portfolioVolatility = useMemo(() => calculateGeographicPortfolioVolatility(config), [config])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <Label htmlFor={mainSwitchId} className="font-semibold text-base">
            Geografische Diversifikation
          </Label>
        </div>
        <Switch id={mainSwitchId} checked={config.enabled} onCheckedChange={(enabled) => onChange({ enabled })} />
      </div>

      <InfoSection />

      {config.enabled && (
        <>
          <ValidationErrors errors={validationErrors} />
          <RegionList config={config} onChange={onChange} />
          <PortfolioStats portfolioReturn={portfolioReturn} portfolioVolatility={portfolioVolatility} />
          <WithholdingTaxPreview internationalStocksValue={internationalStocksValue} />
        </>
      )}
    </div>
  )
}
