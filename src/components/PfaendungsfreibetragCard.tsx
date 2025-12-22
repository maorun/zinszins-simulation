import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Info, ShieldCheck, AlertTriangle } from 'lucide-react'
import { generateFormId } from '../utils/unique-id'
import { formatCurrency } from '../utils/currency'
import {
  calculatePfaendungsfreigrenze,
  assessProtectedAssets,
  getDefaultPfaendungsfreigrenzeConfig,
  getDefaultAssetProtectionConfig,
  getOptimizationRecommendations,
  type PfaendungsfreigrenzeConfig,
  type AssetProtectionConfig,
} from '../../helpers/pfaendungsfreigrenze'

interface InputFieldProps {
  id: string
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  step?: string
  suffix?: string
}

function InputField({ id, label, description, value, onChange, step = '100', suffix }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex gap-2 items-center">
        <Input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => {
            const parsedValue = parseFloat(e.target.value)
            if (!isNaN(parsedValue)) {
              onChange(parsedValue)
            }
          }}
          className="max-w-xs"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="font-medium text-yellow-900 mb-1">💡 Bei Schuldensituationen relevant</p>
      <p className="text-xs text-yellow-800">
        Dieser Rechner zeigt, wie viel von Ihrem Einkommen und Vermögen im Falle einer Pfändung geschützt ist. Basierend
        auf § 850c ZPO und § 851c ZPO (gültig ab 01.07.2024).
      </p>
    </div>
  )
}

function GarnishmentRulesInfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">Pfändungsschutz in Deutschland:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Grundbetrag: 1.491,75 € monatlich (ohne Unterhaltspflicht)</li>
            <li>Zusatz für 1. Unterhaltsberechtigten: +561,43 €</li>
            <li>Zusatz für weitere Unterhaltsberechtigte: +312,78 € jeweils</li>
            <li>Ab 4.573,10 € monatlich: Einkommen vollständig pfändbar</li>
            <li>Rürup-Rente geschützt bis 340.000 € (§ 851c ZPO)</li>
            <li>Riester-Rente vollständig geschützt in Ansparphase</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

interface IncomeProtectionDisplayProps {
  result: ReturnType<typeof calculatePfaendungsfreigrenze>
}

function IncomeProtectionDisplay({ result }: IncomeProtectionDisplayProps) {
  const protectionPercentage = result.monthlyNetIncome > 0 ? (result.protectedAmount / result.monthlyNetIncome) * 100 : 0
  const garnishablePercentage =
    result.monthlyNetIncome > 0 ? (result.garnishableAmount / result.monthlyNetIncome) * 100 : 0

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex gap-2 items-center mb-3">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <h4 className="font-medium text-green-900">💰 Einkommensschutz</h4>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-green-800">Monatliches Nettoeinkommen:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.monthlyNetIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Geschützter Betrag:</span>
          <span className="font-bold text-green-900">
            {formatCurrency(result.protectedAmount)} ({protectionPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Pfändbarer Betrag:</span>
          <span className="font-medium text-orange-900">
            {formatCurrency(result.garnishableAmount)} ({garnishablePercentage.toFixed(1)}%)
          </span>
        </div>
        {result.numberOfDependents > 0 && (
          <div className="pt-2 border-t border-green-300">
            <p className="text-xs text-green-800">
              Schutz erhöht durch {result.numberOfDependents} Unterhaltsberechtigte
            </p>
          </div>
        )}
        {result.isFullyGarnishable && (
          <div className="pt-2 border-t border-orange-300">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-800">
                ⚠️ Bei Einkommen über 4.573,10 € ist das gesamte Einkommen pfändbar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface RuerupDisplayProps {
  protected: number
  garnishable: number
}

function RuerupDisplay({ protected: protectedAmount, garnishable }: RuerupDisplayProps) {
  const total = protectedAmount + garnishable
  if (total === 0) return null

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-purple-800">Rürup-Rente gesamt:</span>
        <span className="font-medium text-purple-900">{formatCurrency(total)}</span>
      </div>
      <div className="flex justify-between pl-4">
        <span className="text-xs text-green-700">→ Geschützt:</span>
        <span className="text-xs font-medium text-green-700">{formatCurrency(protectedAmount)}</span>
      </div>
      {garnishable > 0 && (
        <div className="flex justify-between pl-4">
          <span className="text-xs text-orange-700">→ Pfändbar:</span>
          <span className="text-xs font-medium text-orange-700">{formatCurrency(garnishable)}</span>
        </div>
      )}
    </div>
  )
}

interface RiesterDisplayProps {
  protected: number
}

function RiesterDisplay({ protected: protectedAmount }: RiesterDisplayProps) {
  if (protectedAmount === 0) return null

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-purple-800">Riester-Rente:</span>
        <span className="font-bold text-green-700">{formatCurrency(protectedAmount)} ✓</span>
      </div>
      <p className="text-xs text-green-700 pl-4">Vollständig geschützt in Ansparphase</p>
    </div>
  )
}

interface OtherPensionDisplayProps {
  protected: number
  garnishable: number
}

function OtherPensionDisplay({ protected: protectedAmount, garnishable }: OtherPensionDisplayProps) {
  const total = protectedAmount + garnishable
  if (total === 0) return null

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-purple-800">Sonstige Altersvorsorge:</span>
        <span className="font-medium text-orange-700">{formatCurrency(total)}</span>
      </div>
      {garnishable > 0 && <p className="text-xs text-orange-700 pl-4">⚠️ Meist nicht geschützt bei Pfändung</p>}
    </div>
  )
}

interface AssetSummaryProps {
  totalAssets: number
  totalProtected: number
  totalGarnishable: number
}

function AssetSummary({ totalAssets, totalProtected, totalGarnishable }: AssetSummaryProps) {
  const protectionPercentage = totalAssets > 0 ? (totalProtected / totalAssets) * 100 : 0

  return (
    <div className="pt-2 border-t border-purple-300">
      <div className="flex justify-between">
        <span className="font-medium text-purple-900">Gesamtvermögen:</span>
        <span className="font-bold text-purple-900">{formatCurrency(totalAssets)}</span>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-green-800">Geschützt:</span>
        <span className="font-bold text-green-800">
          {formatCurrency(totalProtected)} ({protectionPercentage.toFixed(1)}%)
        </span>
      </div>
      {totalGarnishable > 0 && (
        <div className="flex justify-between mt-1">
          <span className="text-orange-800">Pfändbar:</span>
          <span className="font-bold text-orange-800">{formatCurrency(totalGarnishable)}</span>
        </div>
      )}
    </div>
  )
}

interface AssetProtectionDisplayProps {
  result: ReturnType<typeof assessProtectedAssets>
}

function AssetProtectionDisplay({ result }: AssetProtectionDisplayProps) {
  if (result.totalAssets === 0) {
    return null
  }

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-medium text-purple-900 mb-3">🛡️ Vermögensschutz (Altersvorsorge)</h4>
      <div className="space-y-3 text-sm">
        <RuerupDisplay protected={result.ruerupProtected} garnishable={result.ruerupGarnishable} />
        <RiesterDisplay protected={result.riesterProtected} />
        <OtherPensionDisplay protected={result.otherProtected} garnishable={result.otherGarnishable} />
        <AssetSummary
          totalAssets={result.totalAssets}
          totalProtected={result.totalProtected}
          totalGarnishable={result.totalGarnishable}
        />
      </div>
    </div>
  )
}

interface OptimizationSuggestionsProps {
  recommendations: string[]
}

function OptimizationSuggestions({ recommendations }: OptimizationSuggestionsProps) {
  if (recommendations.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <h4 className="font-medium text-indigo-900 mb-2">💡 Empfehlungen zur Vermögensabsicherung</h4>
      <ul className="space-y-2 text-xs text-indigo-800">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex gap-2 items-start">
            <span className="mt-0.5">•</span>
            <span>{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface IncomeConfigurationFieldsProps {
  config: PfaendungsfreigrenzeConfig
  setConfig: (config: PfaendungsfreigrenzeConfig) => void
  incomeId: string
  dependentsId: string
}

function IncomeConfigurationFields({ config, setConfig, incomeId, dependentsId }: IncomeConfigurationFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <InputField
        id={incomeId}
        label="Monatliches Nettoeinkommen (€)"
        description="Ihr regelmäßiges monatliches Nettoeinkommen nach Abzug aller Steuern und Sozialabgaben"
        value={config.monthlyNetIncome}
        onChange={(value) => setConfig({ ...config, monthlyNetIncome: Math.max(0, value) })}
        step="100"
      />

      <InputField
        id={dependentsId}
        label="Anzahl Unterhaltsberechtigter"
        description="Anzahl der Personen, für die Sie unterhaltspflichtig sind (Kinder, Ehepartner, etc.)"
        value={config.numberOfDependents}
        onChange={(value) => setConfig({ ...config, numberOfDependents: Math.max(0, Math.floor(value)) })}
        step="1"
      />
    </div>
  )
}

interface AssetConfigurationFieldsProps {
  config: AssetProtectionConfig
  setConfig: (config: AssetProtectionConfig) => void
  ruerupId: string
  riesterId: string
  otherId: string
}

function AssetConfigurationFields({ config, setConfig, ruerupId, riesterId, otherId }: AssetConfigurationFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="text-sm font-medium text-gray-700 pb-2">Altersvorsorge-Vermögen</div>

      <InputField
        id={ruerupId}
        label="Rürup-Rente (Basis-Rente) (€)"
        description="Angespartes Kapital in Rürup-Verträgen (geschützt bis 340.000 €)"
        value={config.ruerupRenteCapital}
        onChange={(value) => setConfig({ ...config, ruerupRenteCapital: Math.max(0, value) })}
        step="10000"
      />

      <InputField
        id={riesterId}
        label="Riester-Rente (€)"
        description="Angespartes Kapital in Riester-Verträgen (vollständig geschützt)"
        value={config.riesterRenteCapital}
        onChange={(value) => setConfig({ ...config, riesterRenteCapital: Math.max(0, value) })}
        step="10000"
      />

      <InputField
        id={otherId}
        label="Sonstige Altersvorsorge (€)"
        description="Andere private Rentenversicherungen, Lebensversicherungen (meist nicht geschützt)"
        value={config.otherPensionCapital}
        onChange={(value) => setConfig({ ...config, otherPensionCapital: Math.max(0, value) })}
        step="10000"
      />
    </div>
  )
}

interface EnableSwitchSectionProps {
  enableSwitchId: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

function EnableSwitchSection({ enableSwitchId, enabled, onEnabledChange }: EnableSwitchSectionProps) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50/50">
      <div className="space-y-1">
        <Label className="text-base font-medium">Pfändungsschutz-Analyse aktivieren</Label>
        <p className="text-sm text-muted-foreground">
          Berechnung der geschützten Beträge bei Pfändung (§ 850c ZPO, § 851c ZPO)
        </p>
      </div>
      <Switch id={enableSwitchId} checked={enabled} onCheckedChange={onEnabledChange} />
    </div>
  )
}

interface ConfigurationContentProps {
  incomeConfig: PfaendungsfreigrenzeConfig
  setIncomeConfig: (config: PfaendungsfreigrenzeConfig) => void
  assetConfig: AssetProtectionConfig
  setAssetConfig: (config: AssetProtectionConfig) => void
  incomeResult: ReturnType<typeof calculatePfaendungsfreigrenze> | null
  assetResult: ReturnType<typeof assessProtectedAssets> | null
  recommendations: string[]
  incomeId: string
  dependentsId: string
  ruerupId: string
  riesterId: string
  otherId: string
}

function ConfigurationContent({
  incomeConfig,
  setIncomeConfig,
  assetConfig,
  setAssetConfig,
  incomeResult,
  assetResult,
  recommendations,
  incomeId,
  dependentsId,
  ruerupId,
  riesterId,
  otherId,
}: ConfigurationContentProps) {
  return (
    <>
      <GarnishmentRulesInfoBox />
      <IncomeConfigurationFields
        config={incomeConfig}
        setConfig={setIncomeConfig}
        incomeId={incomeId}
        dependentsId={dependentsId}
      />
      {incomeResult && <IncomeProtectionDisplay result={incomeResult} />}
      <AssetConfigurationFields
        config={assetConfig}
        setConfig={setAssetConfig}
        ruerupId={ruerupId}
        riesterId={riesterId}
        otherId={otherId}
      />
      {assetResult && <AssetProtectionDisplay result={assetResult} />}
      {recommendations.length > 0 && <OptimizationSuggestions recommendations={recommendations} />}
    </>
  )
}

/**
 * Custom hook for garnishment protection calculations
 */
function useGarnishmentProtection(
  enabled: boolean,
  incomeConfig: PfaendungsfreigrenzeConfig,
  assetConfig: AssetProtectionConfig,
) {
  const incomeResult = useMemo(() => (enabled ? calculatePfaendungsfreigrenze(incomeConfig) : null), [
    enabled,
    incomeConfig,
  ])

  const assetResult = useMemo(() => (enabled ? assessProtectedAssets(assetConfig) : null), [enabled, assetConfig])

  const recommendations = useMemo(() => {
    if (!enabled || !incomeResult || !assetResult) return []
    return getOptimizationRecommendations(incomeResult, assetResult)
  }, [enabled, incomeResult, assetResult])

  return { incomeResult, assetResult, recommendations }
}

/**
 * Pfändungsfreibetrag Card - Calculator for garnishment protection limits
 * according to § 850c ZPO (income) and § 851c ZPO (retirement assets)
 */
export function PfaendungsfreibetragCard() {
  const currentYear = new Date().getFullYear()
  const [enabled, setEnabled] = useState(false)
  const [incomeConfig, setIncomeConfig] = useState<PfaendungsfreigrenzeConfig>(() =>
    getDefaultPfaendungsfreigrenzeConfig(currentYear),
  )
  const [assetConfig, setAssetConfig] = useState<AssetProtectionConfig>(() =>
    getDefaultAssetProtectionConfig(currentYear),
  )

  const enableSwitchId = useMemo(() => generateFormId('pfaendungsfreibetrag', 'enabled'), [])
  const incomeId = useMemo(() => generateFormId('pfaendungsfreibetrag', 'income'), [])
  const dependentsId = useMemo(() => generateFormId('pfaendungsfreibetrag', 'dependents'), [])
  const ruerupId = useMemo(() => generateFormId('pfaendungsfreibetrag', 'ruerup'), [])
  const riesterId = useMemo(() => generateFormId('pfaendungsfreibetrag', 'riester'), [])
  const otherId = useMemo(() => generateFormId('pfaendungsfreibetrag', 'other'), [])

  const { incomeResult, assetResult, recommendations } = useGarnishmentProtection(enabled, incomeConfig, assetConfig)

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🛡️ Pfändungsschutz-Rechner
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <EnableSwitchSection enableSwitchId={enableSwitchId} enabled={enabled} onEnabledChange={setEnabled} />
              {enabled && (
                <ConfigurationContent
                  incomeConfig={incomeConfig}
                  setIncomeConfig={setIncomeConfig}
                  assetConfig={assetConfig}
                  setAssetConfig={setAssetConfig}
                  incomeResult={incomeResult}
                  assetResult={assetResult}
                  recommendations={recommendations}
                  incomeId={incomeId}
                  dependentsId={dependentsId}
                  ruerupId={ruerupId}
                  riesterId={riesterId}
                  otherId={otherId}
                />
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
