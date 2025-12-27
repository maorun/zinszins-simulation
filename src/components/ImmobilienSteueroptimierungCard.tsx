import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { useSimulation } from '../contexts/useSimulation'
import { formatCurrency } from '../utils/currency'
import {
  calculateRentalPropertyTax,
  estimateTypicalExpenses,
  validateRentalPropertyConfig,
  type RentalPropertyConfig,
} from '../../helpers/immobilien-steueroptimierung'
import { ImmobilienSteueroptimierungForm } from './tax-config/ImmobilienSteueroptimierungForm'

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">🏠 Immobilien-Steueroptimierung</p>
      <p className="text-xs text-blue-800 mb-2">
        Berechnung der steuerlichen Behandlung von Mietimmobilien nach deutschem Recht. Berücksichtigt werden:
      </p>
      <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
        <li>
          <strong>AfA (Absetzung für Abnutzung):</strong> Lineare Abschreibung nach § 7 Abs. 4 EStG
        </li>
        <li>
          <strong>Werbungskosten:</strong> Alle steuerlich absetzbaren Ausgaben nach § 9 EStG
        </li>
        <li>
          <strong>Steuerersparnis:</strong> Verrechnung mit persönlichem Einkommensteuersatz
        </li>
      </ul>
    </div>
  )
}

interface ResultsDisplayProps {
  result: ReturnType<typeof calculateRentalPropertyTax>
  config: RentalPropertyConfig
}

function OverviewSection({ result, totalInvestment }: { result: ReturnType<typeof calculateRentalPropertyTax>; totalInvestment: number }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <h4 className="font-medium text-slate-900 mb-3">📊 Übersicht</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-700">Gesamtinvestition:</span>
          <span className="font-medium text-slate-900">{formatCurrency(totalInvestment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-700">Jährliche Mieteinnahmen:</span>
          <span className="font-medium text-slate-900">{formatCurrency(result.rentalIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-700">Brutto-Mietrendite:</span>
          <span className="font-medium text-slate-900">
            {totalInvestment > 0 ? ((result.rentalIncome / totalInvestment) * 100).toFixed(2) : '0.00'}%
          </span>
        </div>
      </div>
    </div>
  )
}

function WerbungskostenSection({ result }: { result: ReturnType<typeof calculateRentalPropertyTax> }) {
  const expenses = result.expenseBreakdown

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h4 className="font-medium text-amber-900 mb-3">📋 Werbungskosten (Steuerlich absetzbar)</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-amber-800">AfA (Gebäude-Abschreibung):</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.afa)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Instandhaltungskosten:</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.maintenanceCosts)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Verwaltungskosten:</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.managementCosts)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Darlehenszinsen:</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.mortgageInterest)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Grundsteuer:</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.propertyTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Gebäudeversicherung:</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.buildingInsurance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-800">Sonstige Ausgaben:</span>
          <span className="font-medium text-amber-900">{formatCurrency(expenses.otherExpenses)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-amber-300">
          <span className="font-medium text-amber-900">Gesamt Werbungskosten:</span>
          <span className="font-bold text-amber-900">{formatCurrency(result.totalExpenses)}</span>
        </div>
      </div>
    </div>
  )
}

function TaxResultSection({ result }: { result: ReturnType<typeof calculateRentalPropertyTax> }) {
  const isLoss = result.taxableIncome < 0
  const colorClass = isLoss ? 'green' : 'red'

  return (
    <div className={`p-4 border rounded-lg bg-${colorClass}-50 border-${colorClass}-200`}>
      <h4 className={`font-medium mb-3 text-${colorClass}-900`}>💰 Steuerergebnis</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={`text-${colorClass}-800`}>
            {isLoss ? 'Steuerminderndes Einkommen:' : 'Zu versteuerndes Einkommen:'}
          </span>
          <span className={`font-medium text-${colorClass}-900`}>{formatCurrency(Math.abs(result.taxableIncome))}</span>
        </div>
        <div className={`flex justify-between pt-2 border-t border-${colorClass}-300`}>
          <span className={`font-medium text-${colorClass}-900`}>
            {result.taxSavings > 0 ? 'Steuerersparnis:' : 'Zusätzliche Steuerlast:'}
          </span>
          <span className={`font-bold text-lg text-${colorClass}-900`}>{formatCurrency(Math.abs(result.taxSavings))}</span>
        </div>
      </div>

      {isLoss && (
        <div className={`mt-3 pt-3 border-t border-${colorClass}-300 text-xs text-${colorClass}-800`}>
          <p className="font-medium mb-1">✅ Steuerlicher Vorteil:</p>
          <p>
            Der Verlust aus Vermietung und Verpachtung ({formatCurrency(Math.abs(result.taxableIncome))}) kann mit anderen
            Einkünften verrechnet werden und senkt so Ihre Gesamtsteuerlast um {formatCurrency(result.taxSavings)}.
          </p>
        </div>
      )}
    </div>
  )
}

function ReturnMetricsSection({
  result,
  totalInvestment,
}: {
  result: ReturnType<typeof calculateRentalPropertyTax>
  totalInvestment: number
}) {
  const netCashFlow = result.rentalIncome - result.totalExpenses + result.taxSavings
  const cashOnCashReturn = totalInvestment > 0 ? ((result.rentalIncome - result.totalExpenses) / totalInvestment) * 100 : 0

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-medium text-purple-900 mb-3">📈 Renditekennzahlen</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-purple-800">Netto-Cashflow (vor Steuern):</span>
          <span className="font-medium text-purple-900">{formatCurrency(result.rentalIncome - result.totalExpenses)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-800">Netto-Cashflow (nach Steuern):</span>
          <span className="font-medium text-purple-900">{formatCurrency(netCashFlow)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-800">Cash-on-Cash Return (vor Steuern):</span>
          <span className="font-medium text-purple-900">{cashOnCashReturn.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-purple-300">
          <span className="font-medium text-purple-900">Effektive Rendite (nach Steuern):</span>
          <span className="font-bold text-purple-900">{(result.effectiveReturn * 100).toFixed(2)}%</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-purple-300 text-xs text-purple-800">
        <p className="font-medium mb-1">ℹ️ Hinweis:</p>
        <p>
          Die effektive Rendite berücksichtigt alle Kosten, Steuern und die AfA. Sie zeigt die tatsächliche Rendite auf Ihr
          investiertes Kapital.
        </p>
      </div>
    </div>
  )
}

function ResultsDisplay({ result, config }: ResultsDisplayProps) {
  const totalInvestment = config.buildingValue + config.landValue

  return (
    <div className="mt-4 space-y-4">
      <OverviewSection result={result} totalInvestment={totalInvestment} />
      <WerbungskostenSection result={result} />
      <TaxResultSection result={result} />
      <ReturnMetricsSection result={result} totalInvestment={totalInvestment} />
    </div>
  )
}

/**
 * Immobilien-Steueroptimierung Card - Calculator for real estate tax optimization
 * Calculates AfA (depreciation) and Werbungskosten (deductible expenses) for rental properties
 */
export function ImmobilienSteueroptimierungCard() {
  const { guenstigerPruefungAktiv } = useSimulation()
  const currentYear = new Date().getFullYear()

  const [config, setConfig] = useState<RentalPropertyConfig>({
    buildingValue: 300000,
    landValue: 100000,
    annualRent: 18000,
    purchaseYear: currentYear,
    buildingYear: 2020,
    maintenanceCosts: 1800,
    managementCosts: 2700,
    mortgageInterest: 5000,
    propertyTax: 800,
    buildingInsurance: 400,
  })

  const [personalTaxRate, setPersonalTaxRate] = useState<number>(0.42)
  const [useAutomaticExpenses, setUseAutomaticExpenses] = useState<boolean>(false)

  // Calculate automatic expense estimates
  const automaticExpenses = useMemo(() => estimateTypicalExpenses(config.annualRent), [config.annualRent])

  // Apply automatic expenses if enabled
  const effectiveConfig = useMemo(() => {
    if (!useAutomaticExpenses) return config
    return {
      ...config,
      maintenanceCosts: automaticExpenses.maintenanceCosts,
      managementCosts: automaticExpenses.managementCosts,
      propertyTax: automaticExpenses.propertyTax,
      buildingInsurance: automaticExpenses.buildingInsurance,
    }
  }, [config, useAutomaticExpenses, automaticExpenses])

  // Validate config
  const validationErrors = useMemo(() => validateRentalPropertyConfig(effectiveConfig), [effectiveConfig])

  // Calculate results
  const result = useMemo(() => {
    if (validationErrors.length > 0) return null
    return calculateRentalPropertyTax(effectiveConfig, personalTaxRate)
  }, [effectiveConfig, personalTaxRate, validationErrors])

  const handleConfigChange = (updates: Partial<RentalPropertyConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🏠 Immobilien-Steueroptimierung (AfA & Werbungskosten)
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />

              <ImmobilienSteueroptimierungForm
                config={config}
                personalTaxRate={personalTaxRate}
                useAutomaticExpenses={useAutomaticExpenses}
                automaticExpenses={automaticExpenses}
                validationErrors={validationErrors}
                guenstigerPruefungAktiv={guenstigerPruefungAktiv}
                onConfigChange={handleConfigChange}
                onPersonalTaxRateChange={setPersonalTaxRate}
                onUseAutomaticExpensesChange={setUseAutomaticExpenses}
              />

              {result && <ResultsDisplay result={result} config={effectiveConfig} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
