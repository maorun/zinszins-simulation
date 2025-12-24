import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useFormId } from '../utils/unique-id'
import { useNestingLevel } from '../lib/nesting-utils'
import {
  type RuerupRenteConfig,
  getRuerupDeductibilityLimits,
  getRuerupPensionTaxablePercentage,
  calculateRuerupTaxDeduction,
  calculateRuerupPensionTaxation,
} from '../../helpers/ruerup-rente'
import { RuerupConfigurationFields } from './ruerup/RuerupConfigurationFields'
import { RuerupTaxCalculationDetails } from './ruerup/RuerupTaxCalculationDetails'

interface RuerupRenteConfigurationProps {
  config: RuerupRenteConfig
  onChange: (config: RuerupRenteConfig) => void
  contributionYear?: number
  personalTaxRate?: number
}

function RuerupCardHeader() {
  return (
    <CardHeader nestingLevel={0}>
      <CardTitle className="flex items-center gap-2">
        <span>Rürup-Rente (Basis-Rente)</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">
                Die Rürup-Rente ist eine steuerlich geförderte Altersvorsorge, besonders für Selbstständige und
                Gutverdiener. Beiträge sind steuerlich absetzbar, Renten werden nachgelagert besteuert.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardTitle>
      <CardDescription>Steuerlich geförderte private Altersvorsorge für Selbstständige und Angestellte</CardDescription>
    </CardHeader>
  )
}

function useRuerupCalculations(config: RuerupRenteConfig, contributionYear: number, personalTaxRate: number) {
  const contributionResult = useMemo(() => {
    if (!config.enabled) return null
    return calculateRuerupTaxDeduction(config.annualContribution, contributionYear, config.civilStatus, personalTaxRate)
  }, [config.enabled, config.annualContribution, config.civilStatus, contributionYear, personalTaxRate])

  const pensionResult = useMemo(() => {
    if (!config.enabled) return null
    return calculateRuerupPensionTaxation(
      config.expectedMonthlyPension,
      config.pensionStartYear,
      config.pensionStartYear,
      config.pensionIncreaseRate,
      personalTaxRate * 0.6,
    )
  }, [
    config.enabled,
    config.expectedMonthlyPension,
    config.pensionStartYear,
    config.pensionIncreaseRate,
    personalTaxRate,
  ])

  const limits = useMemo(() => getRuerupDeductibilityLimits(contributionYear), [contributionYear])
  const taxablePercentage = useMemo(
    () => getRuerupPensionTaxablePercentage(config.pensionStartYear),
    [config.pensionStartYear],
  )

  return { contributionResult, pensionResult, limits, taxablePercentage }
}

function RuerupEnabledContent({
  config,
  contributionYear,
  limits,
  showDetails,
  contributionResult,
  pensionResult,
  taxablePercentage,
  onChange,
  onToggleDetails,
}: {
  config: RuerupRenteConfig
  contributionYear: number
  limits: { maxAmountSingle: number; maxAmountMarried: number; deductiblePercentage: number }
  showDetails: boolean
  contributionResult: ReturnType<typeof calculateRuerupTaxDeduction> | null
  pensionResult: ReturnType<typeof calculateRuerupPensionTaxation> | null
  taxablePercentage: number
  onChange: (updates: Partial<RuerupRenteConfig>) => void
  onToggleDetails: () => void
}) {
  return (
    <>
      <RuerupConfigurationFields
        config={config}
        contributionYear={contributionYear}
        maxAmountSingle={limits.maxAmountSingle}
        maxAmountMarried={limits.maxAmountMarried}
        onChange={onChange}
      />

      <button type="button" className="text-sm text-blue-600 hover:text-blue-800 underline" onClick={onToggleDetails}>
        {showDetails ? 'Steuerberechnung ausblenden' : 'Steuerberechnung anzeigen'}
      </button>

      {showDetails && contributionResult && pensionResult && (
        <RuerupTaxCalculationDetails
          contributionResult={contributionResult}
          pensionResult={pensionResult}
          contributionYear={contributionYear}
          taxablePercentage={taxablePercentage}
          deductiblePercentage={limits.deductiblePercentage}
        />
      )}
    </>
  )
}

function RuerupCardContent({
  config,
  enabledId,
  showDetails,
  contributionYear,
  limits,
  contributionResult,
  pensionResult,
  taxablePercentage,
  onEnabledChange,
  onChange,
  onToggleDetails,
}: {
  config: RuerupRenteConfig
  enabledId: string
  showDetails: boolean
  contributionYear: number
  limits: { maxAmountSingle: number; maxAmountMarried: number; deductiblePercentage: number }
  contributionResult: ReturnType<typeof calculateRuerupTaxDeduction> | null
  pensionResult: ReturnType<typeof calculateRuerupPensionTaxation> | null
  taxablePercentage: number
  onEnabledChange: (enabled: boolean) => void
  onChange: (updates: Partial<RuerupRenteConfig>) => void
  onToggleDetails: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={enabledId}>Rürup-Rente aktivieren</Label>
        <Switch id={enabledId} checked={config.enabled} onCheckedChange={onEnabledChange} />
      </div>

      {config.enabled && (
        <RuerupEnabledContent
          config={config}
          contributionYear={contributionYear}
          limits={limits}
          showDetails={showDetails}
          contributionResult={contributionResult}
          pensionResult={pensionResult}
          taxablePercentage={taxablePercentage}
          onChange={onChange}
          onToggleDetails={onToggleDetails}
        />
      )}
    </div>
  )
}

export function RuerupRenteConfiguration({
  config,
  onChange,
  contributionYear = new Date().getFullYear(),
  personalTaxRate = 0.42,
}: RuerupRenteConfigurationProps) {
  const nestingLevel = useNestingLevel()
  const [showDetails, setShowDetails] = useState(false)
  const enabledId = useFormId('ruerup', 'enabled')

  const { contributionResult, pensionResult, limits, taxablePercentage } = useRuerupCalculations(
    config,
    contributionYear,
    personalTaxRate,
  )

  const handleChange = (updates: Partial<RuerupRenteConfig>) => {
    onChange({ ...config, ...updates })
  }

  return (
    <Card nestingLevel={nestingLevel}>
      <RuerupCardHeader />
      <CardContent nestingLevel={nestingLevel}>
        <RuerupCardContent
          config={config}
          enabledId={enabledId}
          showDetails={showDetails}
          contributionYear={contributionYear}
          limits={limits}
          contributionResult={contributionResult}
          pensionResult={pensionResult}
          taxablePercentage={taxablePercentage}
          onEnabledChange={enabled => handleChange({ enabled })}
          onChange={handleChange}
          onToggleDetails={() => setShowDetails(!showDetails)}
        />
      </CardContent>
    </Card>
  )
}
