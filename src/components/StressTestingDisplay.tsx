/**
 * Stress Testing Display Component
 * Shows systematic portfolio testing results under extreme historical scenarios
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, AlertTriangle, TrendingDown, Calendar } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { formatCurrency } from '../utils/currency'
import type { StressTestResult, StressTestSummary } from '../utils/stress-testing'

interface StressTestingDisplayProps {
  results: StressTestResult[]
  summary: StressTestSummary
}

/**
 * Component to display stress test summary statistics
 */
function StressTestSummaryCard({ summary }: { summary: StressTestSummary }) {
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
      <h5 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Zusammenfassung Stress-Tests
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-700 font-medium">Getestete Szenarien:</span>
          <span className="ml-2 text-gray-900 font-semibold">{summary.totalScenariosTestedCount}</span>
        </div>
        <div>
          <span className="text-gray-700 font-medium">Schlimmstes Szenario:</span>
          <span className="ml-2 text-red-700 font-semibold">{summary.worstCaseScenario.scenario.name}</span>
        </div>
        <div>
          <span className="text-gray-700 font-medium">Durchschnittlicher Verlust:</span>
          <span className="ml-2 text-gray-900 font-semibold">
            {formatCurrency(summary.averageCapitalLoss)} ({summary.averagePercentageLoss.toFixed(1)}%)
          </span>
        </div>
        <div>
          <span className="text-gray-700 font-medium">Durchschnittliche Erholungszeit:</span>
          <span className="ml-2 text-gray-900 font-semibold">
            {summary.averageRecoveryYears.toFixed(1)} Jahre
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Component to display individual stress test result row
 */
function StressTestResultRow({ result }: { result: StressTestResult }) {
  // Determine styling based on severity
  const isWorstCase = result.percentageLoss > 15
  const rowClasses = isWorstCase
    ? 'bg-red-50 border-l-4 border-l-red-500'
    : result.percentageLoss > 8
      ? 'bg-orange-50 border-l-4 border-l-orange-500'
      : 'bg-yellow-50 border-l-4 border-l-yellow-500'

  return (
    <TableRow className={rowClasses}>
      <TableCell className="font-medium">{result.scenario.name}</TableCell>
      <TableCell className="text-sm text-gray-600">{result.scenario.description}</TableCell>
      <TableCell className="text-right font-semibold text-red-700">
        <div className="flex flex-col items-end gap-1">
          <span>{formatCurrency(result.capitalLoss)}</span>
          <span className="text-xs text-red-600">({result.percentageLoss.toFixed(1)}%)</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{result.recoveryYearsNeeded} Jahre</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">{formatCurrency(result.finalCapital)}</TableCell>
    </TableRow>
  )
}

/**
 * Component to display stress testing results table
 */
function StressTestResultsTable({ results }: { results: StressTestResult[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Krisenszenario</TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead className="text-right">
              <div className="flex flex-col items-end gap-1">
                <span>Verlust</span>
                <span className="text-xs text-gray-500">(vs. Baseline)</span>
              </div>
            </TableHead>
            <TableHead className="text-right">Erholungszeit</TableHead>
            <TableHead className="text-right">Endkapital</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <StressTestResultRow key={index} result={result} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Component to display stress testing information and disclaimer
 */
function StressTestInfoBox() {
  return (
    <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h6 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <TrendingDown className="h-4 w-4" />
        Was sind Stress-Tests?
      </h6>
      <div className="text-sm text-blue-800 space-y-2">
        <p>
          Stress-Tests simulieren, wie Ihr Portfolio auf historische Finanzkrisen reagiert hätte. Die Tests
          untersuchen systematisch verschiedene extreme Marktszenarien, um die Robustheit Ihrer Anlagestrategie zu
          bewerten.
        </p>
        <p className="font-medium">
          Wichtig: Diese Tests basieren auf historischen Daten. Zukünftige Krisen können anders verlaufen. Die
          Ergebnisse dienen nur zur Orientierung und ersetzen keine professionelle Finanzberatung.
        </p>
      </div>
    </div>
  )
}

/**
 * Main Stress Testing Display Component
 */
const StressTestingDisplay: React.FC<StressTestingDisplayProps> = ({ results, summary }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between text-left">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                🧪 Stress-Testing - Portfolio-Resilienz
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <StressTestSummaryCard summary={summary} />
            <StressTestResultsTable results={results} />
            <StressTestInfoBox />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default StressTestingDisplay
