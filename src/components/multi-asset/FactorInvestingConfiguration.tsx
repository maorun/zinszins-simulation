/**
 * Factor Investing Configuration Component
 * Allows users to configure factor tilts (Value, Growth, Small-Cap, Momentum)
 * for enhanced portfolio returns based on academic research
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Info, TrendingUp, AlertTriangle } from 'lucide-react'
import {
  type FactorPortfolioConfig,
  type InvestmentFactor,
  calculateFactorEnhancedReturn,
  calculateFactorEnhancedVolatility,
  calculateFactorTiltStats,
  getFactorName,
  getFactorDescription,
  validateFactorConfig,
  formatFactorExposure,
  formatFactorPremium,
  getAllFactors,
} from '../../../helpers/factor-investing'
import { generateFormId } from '../../utils/unique-id'

interface FactorInvestingConfigurationProps {
  config: FactorPortfolioConfig
  onChange: (updates: Partial<FactorPortfolioConfig>) => void
}

/**
 * Display factor statistics summary
 */
function FactorStatisticsSummary({ config }: { config: FactorPortfolioConfig }) {
  const stats = useMemo(() => calculateFactorTiltStats(config), [config])
  const enhancedReturn = useMemo(() => calculateFactorEnhancedReturn(config), [config])
  const enhancedVolatility = useMemo(() => calculateFactorEnhancedVolatility(config), [config])

  if (!config.enabled || stats.activeFactorsCount === 0) {
    return null
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Faktor-Portfolio Zusammenfassung
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-700 font-medium">Aktive Faktoren:</span>
          <span className="ml-2 text-gray-900 font-semibold">{stats.activeFactorsCount}</span>
        </div>
        <div>
          <span className="text-gray-700 font-medium">Erwartete Rendite:</span>
          <span className="ml-2 text-green-700 font-semibold">{(enhancedReturn * 100).toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-gray-700 font-medium">Portfolio-Risiko:</span>
          <span className="ml-2 text-orange-700 font-semibold">{(enhancedVolatility * 100).toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-gray-700 font-medium">Sharpe Ratio:</span>
          <span className="ml-2 text-blue-700 font-semibold">{stats.enhancedSharpeRatio.toFixed(3)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <p>
          <strong>Faktor-Premium:</strong> {formatFactorPremium(stats.totalPremium)} zusätzliche erwartete Rendite
        </p>
        <p>
          <strong>Zusätzliches Risiko:</strong> +{(stats.totalAdditionalRisk * 100).toFixed(2)}% Volatilität
        </p>
      </div>
    </div>
  )
}

/**
 * Factor description and metadata section
 */
function FactorDescription({
  factor,
  factorConfig,
}: {
  factor: InvestmentFactor
  factorConfig: FactorPortfolioConfig['factors'][InvestmentFactor]
}) {
  const enabledSwitchId = useMemo(() => generateFormId('factor', factor, 'enabled'), [factor])

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <Label htmlFor={enabledSwitchId} className="font-semibold text-gray-900">
          {getFactorName(factor)}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{getFactorDescription(factor)}</p>
              <p className="text-xs text-gray-400 mt-2">{factorConfig.researchBasis}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-gray-600">{getFactorDescription(factor)}</p>
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>
          <strong>Historische Prämie:</strong> {formatFactorPremium(factorConfig.historicalPremium)}
        </p>
        <p>
          <strong>Zusätzliche Volatilität:</strong> +{(factorConfig.additionalVolatility * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  )
}

/**
 * Factor exposure slider section
 */
function FactorExposureSlider({
  factor,
  factorConfig,
  onChange,
}: {
  factor: InvestmentFactor
  factorConfig: FactorPortfolioConfig['factors'][InvestmentFactor]
  onChange: (values: number[]) => void
}) {
  const exposureId = useMemo(() => generateFormId('factor', factor, 'exposure'), [factor])

  if (!factorConfig.enabled) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={exposureId} className="text-sm">
          Faktor-Exposure:
        </Label>
        <span className="text-sm font-semibold">{formatFactorExposure(factorConfig.exposure)}</span>
      </div>
      <Slider
        id={exposureId}
        min={0}
        max={100}
        step={5}
        value={[factorConfig.exposure * 100]}
        onValueChange={onChange}
        className="w-full"
      />
      <p className="text-xs text-gray-500">
        Niedrigere Exposure = geringeres Faktor-Risiko, Höhere Exposure = stärkere Faktor-Ausrichtung
      </p>
    </div>
  )
}

/**
 * Individual factor configuration row
 */
function FactorConfigRow({
  factor,
  config,
  onChange,
}: {
  factor: InvestmentFactor
  config: FactorPortfolioConfig
  onChange: (updates: Partial<FactorPortfolioConfig>) => void
}) {
  const factorConfig = config.factors[factor]
  const enabledSwitchId = useMemo(() => generateFormId('factor', factor, 'enabled'), [factor])

  const handleToggle = (enabled: boolean) => {
    onChange({
      factors: {
        ...config.factors,
        [factor]: {
          ...factorConfig,
          enabled,
        },
      },
    })
  }

  const handleExposureChange = (values: number[]) => {
    onChange({
      factors: {
        ...config.factors,
        [factor]: {
          ...factorConfig,
          exposure: values[0] / 100,
        },
      },
    })
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
      <div className="flex items-start justify-between gap-3">
        <FactorDescription factor={factor} factorConfig={factorConfig} />
        <Switch id={enabledSwitchId} checked={factorConfig.enabled} onCheckedChange={handleToggle} />
      </div>
      <FactorExposureSlider factor={factor} factorConfig={factorConfig} onChange={handleExposureChange} />
    </div>
  )
}

/**
 * Validation warnings display
 */
function ValidationWarnings({ config }: { config: FactorPortfolioConfig }) {
  const errors = useMemo(() => validateFactorConfig(config), [config])

  if (errors.length === 0) {
    return null
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h5 className="font-semibold text-yellow-900 mb-2">Validierungswarnungen</h5>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Factor investing information section
 */
function FactorInvestingInfo() {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-start gap-2 text-gray-700 text-sm">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">Hinweise zum Faktor-Investing:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Faktoren basieren auf langfristigen historischen Renditen (Fama-French Forschung)</li>
            <li>Value und Growth sind gegensätzliche Faktoren - Gesamtexposure sollte maximal 100% betragen</li>
            <li>Höhere Factor-Exposure bedeutet höheres Risiko und höhere erwartete Rendite</li>
            <li>Faktoren funktionieren am besten über lange Anlagehorizonte (10+ Jahre)</li>
            <li>Historische Prämien sind keine Garantie für zukünftige Renditen</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Main Factor Investing Configuration Component
 */
export function FactorInvestingConfiguration({ config, onChange }: FactorInvestingConfigurationProps) {
  const mainSwitchId = useMemo(() => generateFormId('factor-investing', 'main-enabled'), [])
  const factors = getAllFactors()

  const handleToggleEnabled = (enabled: boolean) => {
    onChange({ enabled })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Faktor-Investing
          </CardTitle>
          <Switch id={mainSwitchId} checked={config.enabled} onCheckedChange={handleToggleEnabled} />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Nutzen Sie wissenschaftlich fundierte Faktor-Strategien (Value, Growth, Small-Cap, Momentum) zur Optimierung
          Ihrer erwarteten Portfolio-Rendite. Basiert auf akademischer Forschung (Fama-French, Carhart).
        </p>
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-4">
          <FactorStatisticsSummary config={config} />
          <ValidationWarnings config={config} />
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Verfügbare Faktoren</h4>
            {factors.map(factor => (
              <FactorConfigRow key={factor} factor={factor} config={config} onChange={onChange} />
            ))}
          </div>
          <FactorInvestingInfo />
        </CardContent>
      )}
    </Card>
  )
}
