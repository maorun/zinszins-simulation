/**
 * Tax Statement Simulator Card Component
 *
 * Provides a preview of annual tax statements (Steuerbescheinigung)
 * similar to what German banks provide to investors.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Info, FileText, Download } from 'lucide-react'
import { Button } from './ui/button'
import { generateFormId } from '../utils/unique-id'
import { formatCurrency } from '../utils/currency'
import { useSimulation } from '../contexts/useSimulation'
import { convertSparplanElementsToSimulationResult } from '../utils/chart-data-converter'
import {
  generateTaxStatement,
  exportForTaxFiling,
  type TaxStatementConfig,
} from '../../helpers/tax-statement-simulator'

/**
 * Information box explaining what the tax statement shows
 */
function TaxStatementInfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">📋 Steuerbescheinigung-Simulator:</p>
          <p>
            Vorschau der jährlichen Steuerbescheinigung für Kapitalerträge, ähnlich wie sie deutsche Banken bereitstellen.
            Hilft bei der Vorbereitung der Steuererklärung (Anlage KAP).
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Capital Summary Section
 */
interface CapitalSummaryProps {
  statement: ReturnType<typeof generateTaxStatement>
}

function CapitalSummary({ statement }: CapitalSummaryProps) {
  if (!statement) return null

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        💼 Kapitalübersicht
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-purple-800">Anfangskapital:</span>
          <span className="font-medium text-purple-900">{formatCurrency(statement.startingCapital)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-800">Endkapital:</span>
          <span className="font-medium text-purple-900">{formatCurrency(statement.endingCapital)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-purple-300">
          <span className="text-purple-800 font-medium">Gesamte Kapitalerträge:</span>
          <span className="font-semibold text-purple-900">{formatCurrency(statement.totalCapitalGains)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Tax Calculation Section
 */
interface TaxCalculationProps {
  statement: ReturnType<typeof generateTaxStatement>
}

function TaxCalculation({ statement }: TaxCalculationProps) {
  if (!statement) return null

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-3">💰 Steuerberechnung</h4>
      <div className="space-y-2 text-sm">
        {statement.vorabpauschale > 0 && (
          <div className="flex justify-between">
            <span className="text-green-800">Vorabpauschale:</span>
            <span className="font-medium text-green-900">{formatCurrency(statement.vorabpauschale)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-green-800">Genutzter Freibetrag:</span>
          <span className="font-medium text-green-900">{formatCurrency(statement.usedAllowance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Verbleibender Freibetrag:</span>
          <span className="font-medium text-green-900">{formatCurrency(statement.remainingAllowance)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-green-300">
          <span className="text-green-800 font-medium">Steuerpflichtiger Betrag:</span>
          <span className="font-semibold text-green-900">{formatCurrency(statement.taxableAmount)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Tax Paid Section
 */
interface TaxPaidProps {
  statement: ReturnType<typeof generateTaxStatement>
}

function TaxPaid({ statement }: TaxPaidProps) {
  if (!statement) return null

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <h4 className="font-medium text-orange-900 mb-3">📊 Gezahlte Steuern</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-orange-800">Kapitalertragsteuer (inkl. Soli):</span>
          <span className="font-medium text-orange-900">{formatCurrency(statement.capitalGainsTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-orange-800 text-xs ml-4">davon Solidaritätszuschlag:</span>
          <span className="font-medium text-orange-900 text-xs">{formatCurrency(statement.solidaritySurcharge)}</span>
        </div>
        {statement.churchTax !== undefined && statement.churchTax > 0 && (
          <div className="flex justify-between">
            <span className="text-orange-800">Kirchensteuer:</span>
            <span className="font-medium text-orange-900">{formatCurrency(statement.churchTax)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-orange-300">
          <span className="text-orange-800 font-semibold">Gesamte Steuerlast:</span>
          <span className="font-bold text-orange-900">{formatCurrency(statement.totalTaxPaid)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Loss Carryforward Section
 */
interface LossCarryforwardProps {
  statement: ReturnType<typeof generateTaxStatement>
}

interface LossRowProps {
  label: string
  amount: number
  isBorderTop?: boolean
}

function LossRow({ label, amount, isBorderTop }: LossRowProps) {
  return (
    <div className={`flex justify-between ${isBorderTop ? 'pt-2 border-t border-red-300' : ''}`}>
      <span className={`text-red-800 ${isBorderTop ? 'font-medium' : ''}`}>{label}</span>
      <span className={`text-red-900 ${isBorderTop ? 'font-semibold' : 'font-medium'}`}>{formatCurrency(amount)}</span>
    </div>
  )
}

function LossCarryforward({ statement }: LossCarryforwardProps) {
  if (!statement) return null

  const lossItems = [
    { label: 'Verlustvortrag Vorjahr:', amount: statement.lossCarryforwardPreviousYear, isBorderTop: false },
    { label: 'Realisierte Verluste:', amount: statement.realizedLosses, isBorderTop: false },
    { label: 'Verlustvortrag Folgejahr:', amount: statement.lossCarryforwardNextYear, isBorderTop: true },
  ].filter(item => item.amount !== undefined && item.amount > 0)

  if (lossItems.length === 0) return null

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h4 className="font-medium text-red-900 mb-3">📉 Verlusttöpfe</h4>
      <div className="space-y-2 text-sm">
        {lossItems.map((item, index) => (
          <LossRow key={item.label} label={item.label} amount={item.amount!} isBorderTop={item.isBorderTop && index > 0} />
        ))}
      </div>
    </div>
  )
}

/**
 * Display section for capital gains and taxation details
 */
interface TaxStatementDetailsProps {
  statement: ReturnType<typeof generateTaxStatement>
}

function TaxStatementDetails({ statement }: TaxStatementDetailsProps) {
  if (!statement) {
    return (
      <div className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-lg">
        <p>Keine Daten für das ausgewählte Jahr verfügbar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CapitalSummary statement={statement} />
      <TaxCalculation statement={statement} />
      <TaxPaid statement={statement} />
      <LossCarryforward statement={statement} />
    </div>
  )
}

/**
 * Export button and functionality
 */
interface ExportButtonProps {
  statement: ReturnType<typeof generateTaxStatement>
}

function ExportButton({ statement }: ExportButtonProps) {
  if (!statement) return null

  const handleExport = () => {
    const exportData = exportForTaxFiling(statement)
    const text = `
Steuerbescheinigung für Kapitalerträge
Jahr: ${exportData.year}

══════════════════════════════════════════
Für Ihre Steuererklärung (Anlage KAP):
══════════════════════════════════════════

Zeile 7 - Kapitalerträge: ${formatCurrency(exportData.line7_capitalGains)}
Zeile 8 - Sparerpauschbetrag: ${formatCurrency(exportData.line8_allowanceUsed)}
Zeile 9 - Kapitalertragsteuer: ${formatCurrency(exportData.line9_taxPaid)}
Zeile 10 - Solidaritätszuschlag: ${formatCurrency(exportData.line10_solidaritySurcharge)}
${exportData.line11_churchTax !== undefined ? `Zeile 11 - Kirchensteuer: ${formatCurrency(exportData.line11_churchTax)}` : ''}

══════════════════════════════════════════
Zusätzliche Informationen:
══════════════════════════════════════════

Vorabpauschale (Informativ): ${formatCurrency(exportData.vorabpauschaleInfo)}

Hinweis: Diese Daten sind eine Simulation basierend auf 
Ihren Eingaben. Verwenden Sie für die Steuererklärung die 
offiziellen Bescheinigungen Ihrer Bank.
`

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `steuerbescheinigung-${exportData.year}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm" className="w-full mt-4">
      <Download className="h-4 w-4 mr-2" />
      Steuerbescheinigung exportieren
    </Button>
  )
}

/**
 * Custom hook for tax statement data
 */
function useTaxStatementData() {
  const simulation = useSimulation()
  const [selectedYear, setSelectedYear] = useState<string>('')

  // Convert simulation data to SimulationResult format
  const simulationResult = useMemo(() => {
    if (!simulation.simulationData?.sparplanElements) return null
    return convertSparplanElementsToSimulationResult(simulation.simulationData.sparplanElements)
  }, [simulation.simulationData])

  // Get available years from simulation results
  const availableYears = useMemo(() => {
    if (!simulationResult) return []
    return Object.keys(simulationResult)
      .map(Number)
      .sort((a, b) => b - a)
  }, [simulationResult])

  // Set initial selected year
  if (!selectedYear && availableYears.length > 0) {
    setSelectedYear(availableYears[0].toString())
  }

  // Generate tax statement config
  const taxStatementConfig: TaxStatementConfig = useMemo(
    () => ({
      capitalGainsTaxRate: simulation.steuerlast,
      annualAllowance: simulation.freibetragPerYear?.[parseInt(selectedYear)] || 1000,
      partialExemptionRate: simulation.teilfreistellungsquote,
      churchTaxActive: simulation.kirchensteuerAktiv,
      churchTaxRate: simulation.kirchensteuersatz,
    }),
    [
      simulation.steuerlast,
      simulation.freibetragPerYear,
      selectedYear,
      simulation.teilfreistellungsquote,
      simulation.kirchensteuerAktiv,
      simulation.kirchensteuersatz,
    ],
  )

  // Generate statement for selected year
  const statement = useMemo(() => {
    if (!simulationResult || !selectedYear) return null
    return generateTaxStatement(simulationResult, parseInt(selectedYear), taxStatementConfig)
  }, [simulationResult, selectedYear, taxStatementConfig])

  return {
    simulationResult,
    availableYears,
    selectedYear,
    setSelectedYear,
    statement,
  }
}

/**
 * Year selection input component
 */
interface YearSelectorProps {
  yearInputId: string
  selectedYear: string
  availableYears: number[]
  onYearChange: (e: { target: { value: string } }) => void
}

function YearSelector({ yearInputId, selectedYear, availableYears, onYearChange }: YearSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={yearInputId} className="text-sm font-medium">
        Jahr auswählen:
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          id={yearInputId}
          type="number"
          min={availableYears[availableYears.length - 1]}
          max={availableYears[0]}
          value={selectedYear}
          onChange={onYearChange}
          className="max-w-xs"
          placeholder="Jahr eingeben"
        />
        <span className="text-xs text-muted-foreground">
          ({availableYears[availableYears.length - 1]} - {availableYears[0]})
        </span>
      </div>
    </div>
  )
}

/**
 * Legal disclaimer component
 */
function LegalDisclaimer() {
  return (
    <div className="text-xs text-muted-foreground bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="font-medium mb-1">⚠️ Hinweis:</p>
      <p>
        Diese Steuerbescheinigung ist eine Simulation basierend auf Ihren Eingaben und dient nur zu Informationszwecken.
        Für Ihre Steuererklärung verwenden Sie bitte die offiziellen Bescheinigungen Ihrer Bank oder Ihres Brokers.
      </p>
    </div>
  )
}

/**
 * Main Tax Statement Simulator Card Component
 */
export function TaxStatementSimulatorCard() {
  const [isOpen, setIsOpen] = useState(false)
  const yearInputId = useMemo(() => generateFormId('tax-statement-simulator', 'year'), [])
  const { simulationResult, availableYears, selectedYear, setSelectedYear, statement } = useTaxStatementData()

  if (!simulationResult || availableYears.length === 0) {
    return null
  }

  const handleYearChange = (e: { target: { value: string } }) => {
    const year = parseInt(e.target.value)
    if (!isNaN(year) && availableYears.includes(year)) {
      setSelectedYear(year.toString())
    }
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleCardHeader titleClassName="text-left">📄 Steuerbescheinigung-Simulator</CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <TaxStatementInfoBox />
              <YearSelector
                yearInputId={yearInputId}
                selectedYear={selectedYear}
                availableYears={availableYears}
                onYearChange={handleYearChange}
              />
              <TaxStatementDetails statement={statement} />
              <ExportButton statement={statement} />
              <LegalDisclaimer />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
