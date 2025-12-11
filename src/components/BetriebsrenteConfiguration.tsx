import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useFormId } from '../utils/unique-id'
import {
  type BetriebsrenteConfig,
  getBetriebsrenteTaxLimits,
  calculateBetriebsrenteTaxBenefit,
  calculateBetriebsrentePensionTaxation,
} from '../../helpers/betriebsrente'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'

interface BetriebsrenteConfigurationProps {
  config: BetriebsrenteConfig
  onChange: (config: BetriebsrenteConfig) => void
  contributionYear?: number
  personalTaxRate?: number
  pensionTaxRate?: number
}

function BetriebsrenteCardHeader() {
  return (
    <CardHeader nestingLevel={0}>
      <CardTitle className="flex items-center gap-2">
        <span>Betriebliche Altersvorsorge (bAV)</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">
                Die betriebliche Altersvorsorge ist eine vom Arbeitgeber unterstützte
                Altersvorsorge. Beiträge sind steuer- und sozialversicherungsfrei (bis zu den
                Grenzen), Renten werden nachgelagert voll besteuert und sozialversicherungspflichtig.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardTitle>
      <CardDescription>
        Vom Arbeitgeber unterstützte Altersvorsorge mit Steuer- und Sozialversicherungsvorteilen
      </CardDescription>
    </CardHeader>
  )
}

function ImplementationTypeSelector({
  value,
  onChange,
}: {
  value: BetriebsrenteConfig['implementationType']
  onChange: (value: BetriebsrenteConfig['implementationType']) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Durchführungsweg</Label>
      <RadioTileGroup
        value={value}
        onValueChange={(v) => onChange(v as BetriebsrenteConfig['implementationType'])}
      >
        <RadioTile value="direktversicherung" label="Direktversicherung">
          Versicherungsvertrag über den Arbeitgeber
        </RadioTile>
        <RadioTile value="pensionskasse" label="Pensionskasse">
          Rechtlich selbstständige Versorgungseinrichtung
        </RadioTile>
        <RadioTile value="pensionsfonds" label="Pensionsfonds">
          Kapitalmarktorientierte Anlageform
        </RadioTile>
        <RadioTile value="direktzusage" label="Direktzusage">
          Unmittelbare Versorgungszusage durch Arbeitgeber
        </RadioTile>
        <RadioTile value="unterstuetzungskasse" label="Unterstützungskasse">
          Arbeitgeberfinanzierte Einrichtung
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

function ContributionPhaseDisplay({
  result,
  limits,
}: {
  result: ReturnType<typeof calculateBetriebsrenteTaxBenefit>
  limits: ReturnType<typeof getBetriebsrenteTaxLimits>
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Gesamtbeitrag (AN + AG):</span>
          <span className="font-medium">{result.totalContribution.toFixed(0)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Steuerersparnis AN:</span>
          <span className="font-medium text-green-600">
            {result.taxSavingsEmployee.toFixed(0)} €
          </span>
        </div>
        <div className="flex justify-between">
          <span>SV-Ersparnis AN:</span>
          <span className="font-medium text-green-600">
            {result.socialSecuritySavingsEmployee.toFixed(0)} €
          </span>
        </div>
        <div className="flex justify-between border-t pt-1">
          <span>Gesamtvorteil pro Jahr:</span>
          <span className="font-bold text-green-600">{result.totalBenefit.toFixed(0)} €</span>
        </div>
      </div>
      {(result.exceedsTaxLimits || result.exceedsSocialSecurityLimits) && (
        <p className="text-xs text-orange-600">
          ⚠️{' '}
          {result.exceedsSocialSecurityLimits &&
            `Beitrag übersteigt SV-Freigrenze (${limits.maxSocialSecurityFreeContribution.toFixed(0)} €). `}
          {result.exceedsTaxLimits &&
            `Beitrag übersteigt Steuerfreigrenze (${limits.maxTaxFreeEmployerContribution.toFixed(0)} €).`}
        </p>
      )}
    </div>
  )
}

function PayoutPhaseDisplay({
  result,
}: {
  result: ReturnType<typeof calculateBetriebsrentePensionTaxation>
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Bruttomonatsrente:</span>
          <span className="font-medium">{result.grossMonthlyPension.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Einkommensteuer (Jahr):</span>
          <span className="font-medium text-red-600">-{result.incomeTax.toFixed(0)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Krankenversicherung (Jahr):</span>
          <span className="font-medium text-red-600">
            -{result.healthInsuranceContribution.toFixed(0)} €
          </span>
        </div>
        <div className="flex justify-between">
          <span>Pflegeversicherung (Jahr):</span>
          <span className="font-medium text-red-600">
            -{result.careInsuranceContribution.toFixed(0)} €
          </span>
        </div>
        <div className="flex justify-between border-t pt-1">
          <span>Nettomonatsrente:</span>
          <span className="font-bold">{(result.netAnnualPension / 12).toFixed(2)} €</span>
        </div>
      </div>
      <p className="text-xs text-gray-600">
        100% der bAV-Rente ist steuerpflichtig (nachgelagerte Besteuerung)
      </p>
    </div>
  )
}

function ContributionFields({
  config,
  limits,
  onChange,
}: {
  config: BetriebsrenteConfig
  limits: ReturnType<typeof getBetriebsrenteTaxLimits>
  onChange: (updates: Partial<BetriebsrenteConfig>) => void
}) {
  const employeeContributionId = useFormId('betriebsrente', 'employee-contribution')
  const employerContributionId = useFormId('betriebsrente', 'employer-contribution')

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={employeeContributionId}>
          Jährlicher Arbeitnehmerbeitrag (Entgeltumwandlung)
        </Label>
        <Input
          id={employeeContributionId}
          type="number"
          min="0"
          step="100"
          value={config.annualEmployeeContribution}
          onChange={(e) => onChange({ annualEmployeeContribution: Number(e.target.value) })}
        />
        <p className="text-xs text-gray-500">
          Bis {limits.maxSocialSecurityFreeContribution.toFixed(0)} € sozialversicherungsfrei (4%
          BBG), bis {limits.maxTaxFreeEmployerContribution.toFixed(0)} € steuerfrei (8% BBG)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={employerContributionId}>Jährlicher Arbeitgeberzuschuss</Label>
        <Input
          id={employerContributionId}
          type="number"
          min="0"
          step="100"
          value={config.annualEmployerContribution}
          onChange={(e) => onChange({ annualEmployerContribution: Number(e.target.value) })}
        />
        <p className="text-xs text-gray-500">
          Bis {limits.maxTaxFreeEmployerContribution.toFixed(0)} € steuerfrei (8% BBG)
        </p>
      </div>
    </>
  )
}

function PensionIncreaseRateField({
  config,
  onChange,
}: {
  config: BetriebsrenteConfig
  onChange: (updates: Partial<BetriebsrenteConfig>) => void
}) {
  const increaseRateId = useFormId('betriebsrente', 'increase-rate')

  return (
    <div className="space-y-2">
      <Label htmlFor={increaseRateId}>Jährliche Rentenanpassung (%)</Label>
      <Input
        id={increaseRateId}
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={(config.pensionIncreaseRate * 100).toFixed(1)}
        onChange={(e) => onChange({ pensionIncreaseRate: Number(e.target.value) / 100 })}
      />
      <p className="text-xs text-gray-500">
        Erwartete jährliche Steigerung der Rente (üblich: 1%)
      </p>
    </div>
  )
}

function PensionFields({
  config,
  contributionYear,
  onChange,
}: {
  config: BetriebsrenteConfig
  contributionYear: number
  onChange: (updates: Partial<BetriebsrenteConfig>) => void
}) {
  const pensionStartYearId = useFormId('betriebsrente', 'pension-start-year')
  const monthlyPensionId = useFormId('betriebsrente', 'monthly-pension')

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={pensionStartYearId}>Rentenbeginn (Jahr)</Label>
        <Input
          id={pensionStartYearId}
          type="number"
          min={contributionYear + 1}
          max="2100"
          value={config.pensionStartYear}
          onChange={(e) => onChange({ pensionStartYear: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={monthlyPensionId}>Erwartete monatliche Rente (brutto)</Label>
        <Input
          id={monthlyPensionId}
          type="number"
          min="0"
          step="50"
          value={config.expectedMonthlyPension}
          onChange={(e) => onChange({ expectedMonthlyPension: Number(e.target.value) })}
        />
        <p className="text-xs text-gray-500">Geschätzte Rentenhöhe vor Steuern</p>
      </div>

      <PensionIncreaseRateField config={config} onChange={onChange} />
    </>
  )
}

function BetriebsrenteConfigurationFields({
  config,
  contributionYear,
  limits,
  onChange,
}: {
  config: BetriebsrenteConfig
  contributionYear: number
  limits: ReturnType<typeof getBetriebsrenteTaxLimits>
  onChange: (updates: Partial<BetriebsrenteConfig>) => void
}) {
  return (
    <div className="space-y-4">
      <ImplementationTypeSelector
        value={config.implementationType}
        onChange={(implementationType) => onChange({ implementationType })}
      />
      <ContributionFields config={config} limits={limits} onChange={onChange} />
      <PensionFields config={config} contributionYear={contributionYear} onChange={onChange} />
    </div>
  )
}

function BetriebsrenteTaxCalculationDetails({
  contributionResult,
  pensionResult,
  contributionYear,
  limits,
}: {
  contributionResult: ReturnType<typeof calculateBetriebsrenteTaxBenefit>
  pensionResult: ReturnType<typeof calculateBetriebsrentePensionTaxation>
  contributionYear: number
  limits: ReturnType<typeof getBetriebsrenteTaxLimits>
}) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
      <h4 className="font-semibold text-sm">Steuerliche Berechnung</h4>

      <div className="space-y-2">
        <p className="text-sm font-medium">Ansparphase ({contributionYear})</p>
        <ContributionPhaseDisplay result={contributionResult} limits={limits} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Auszahlungsphase (erstes Rentenjahr)</p>
        <PayoutPhaseDisplay result={pensionResult} />
      </div>
    </div>
  )
}

function useBetriebsrenteCalculations(
  config: BetriebsrenteConfig,
  contributionYear: number,
  personalTaxRate: number,
  pensionTaxRate: number
) {
  const limits = useMemo(() => getBetriebsrenteTaxLimits(contributionYear), [contributionYear])

  const contributionResult = useMemo(() => {
    if (!config.enabled) return null
    return calculateBetriebsrenteTaxBenefit(
      config.annualEmployeeContribution,
      config.annualEmployerContribution,
      contributionYear,
      personalTaxRate,
      0.2
    )
  }, [
    config.enabled,
    config.annualEmployeeContribution,
    config.annualEmployerContribution,
    contributionYear,
    personalTaxRate,
  ])

  const pensionResult = useMemo(() => {
    if (!config.enabled) return null
    return calculateBetriebsrentePensionTaxation(
      config.expectedMonthlyPension,
      config.pensionStartYear,
      config.pensionStartYear,
      config.pensionIncreaseRate,
      pensionTaxRate,
      true,
      true
    )
  }, [
    config.enabled,
    config.expectedMonthlyPension,
    config.pensionStartYear,
    config.pensionIncreaseRate,
    pensionTaxRate,
  ])

  return { limits, contributionResult, pensionResult }
}

function BetriebsrenteEnabledContent({
  config,
  contributionYear,
  limits,
  contributionResult,
  pensionResult,
  showDetails,
  onChange,
  onToggleDetails,
}: {
  config: BetriebsrenteConfig
  contributionYear: number
  limits: ReturnType<typeof getBetriebsrenteTaxLimits>
  contributionResult: ReturnType<typeof calculateBetriebsrenteTaxBenefit> | null
  pensionResult: ReturnType<typeof calculateBetriebsrentePensionTaxation> | null
  showDetails: boolean
  onChange: (updates: Partial<BetriebsrenteConfig>) => void
  onToggleDetails: () => void
}) {
  return (
    <>
      <BetriebsrenteConfigurationFields
        config={config}
        contributionYear={contributionYear}
        limits={limits}
        onChange={onChange}
      />

      <button
        type="button"
        className="text-sm text-blue-600 hover:text-blue-800 underline"
        onClick={onToggleDetails}
      >
        {showDetails ? 'Steuerberechnung ausblenden' : 'Steuerberechnung anzeigen'}
      </button>

      {showDetails && contributionResult && pensionResult && (
        <BetriebsrenteTaxCalculationDetails
          contributionResult={contributionResult}
          pensionResult={pensionResult}
          contributionYear={contributionYear}
          limits={limits}
        />
      )}
    </>
  )
}

export function BetriebsrenteConfiguration({
  config,
  onChange,
  contributionYear = new Date().getFullYear(),
  personalTaxRate = 0.35,
  pensionTaxRate = 0.25,
}: BetriebsrenteConfigurationProps) {
  const [showDetails, setShowDetails] = useState(false)
  const enabledId = useFormId('betriebsrente', 'enabled')

  const { limits, contributionResult, pensionResult } = useBetriebsrenteCalculations(
    config,
    contributionYear,
    personalTaxRate,
    pensionTaxRate
  )

  return (
    <Card>
      <BetriebsrenteCardHeader />
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={enabledId}>Betriebliche Altersvorsorge aktivieren</Label>
            <Switch
              id={enabledId}
              checked={config.enabled}
              onCheckedChange={(enabled) => onChange({ ...config, enabled })}
            />
          </div>

          {config.enabled ? (
            <BetriebsrenteEnabledContent
              config={config}
              contributionYear={contributionYear}
              limits={limits}
              contributionResult={contributionResult}
              pensionResult={pensionResult}
              showDetails={showDetails}
              onChange={(updates) => onChange({ ...config, ...updates })}
              onToggleDetails={() => setShowDetails(!showDetails)}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Aktivieren Sie die betriebliche Altersvorsorge, um Ihre Vorsorge zu planen.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
