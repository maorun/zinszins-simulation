import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import {
  runStressTestAnalysis,
  getStressTestDescription,
  getStressSeverity,
  getSeverityColorClass,
  HISTORICAL_STRESS_SCENARIOS,
  HYPOTHETICAL_STRESS_SCENARIOS,
  type StressTestResult,
  type StressScenario,
} from '../utils/stress-test'
import { formatCurrencyWhole, formatPercentGerman } from '../utils/currency'

interface StressTestDisplayProps {
  /** Current portfolio value in EUR */
  portfolioValue: number
  /** Which scenarios to display (default: 'historical') */
  scenarioType?: 'historical' | 'hypothetical' | 'all'
  /** Title for the stress test section */
  title?: string
  /** Show detailed explanations */
  showDetails?: boolean
}

function StressTestParameters({
  portfolioValue,
  scenarioCount,
}: {
  portfolioValue: number
  scenarioCount: number
}) {
  return (
    <div className="mb-5">
      <p>
        <strong>Portfolio-Wert:</strong> {formatCurrencyWhole(portfolioValue)}
      </p>
      <p>
        <strong>Getestete Szenarien:</strong> {scenarioCount} extreme Marktszenarien
      </p>
      <p className="text-sm text-gray-600">
        Stress-Tests zeigen, wie Ihr Portfolio in extremen Krisen reagieren würde. Im Gegensatz zu Value-at-Risk basieren
        diese auf konkreten "Was-wäre-wenn"-Szenarien.
      </p>
    </div>
  )
}

function StressTestMobileCards({ results }: { results: StressTestResult[] }) {
  return (
    <div className="mobile-only monte-carlo-mobile">
      {results.map((result: StressTestResult, index: number) => {
        const severity = getStressSeverity(result.lossPercent)
        const colorClass = getSeverityColorClass(severity)

        return (
          <div key={index} className={`monte-carlo-card ${colorClass}`}>
            <div className="monte-carlo-header">
              <span className="scenario-name">{result.scenario.name}</span>
              <span className="probability">{formatCurrencyWhole(result.absoluteLoss)}</span>
            </div>
            <div className="scenario-description">
              {formatPercentGerman(result.lossPercent)} Verlust
              <br />
              Portfolio-Wert nach Crash: {formatCurrencyWhole(result.stressedValue)}
              {result.scenario.historicalPeriod && (
                <>
                  <br />
                  <span className="text-xs text-gray-600">{result.scenario.historicalPeriod}</span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StressTestDesktopTable({ results }: { results: StressTestResult[] }) {
  return (
    <div className="desktop-only table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Szenario</TableHead>
            <TableHead>Verlust (€)</TableHead>
            <TableHead>Verlust (%)</TableHead>
            <TableHead>Restwert</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result: StressTestResult, index: number) => {
            const severity = getStressSeverity(result.lossPercent)
            const colorClass = getSeverityColorClass(severity)

            return (
              <TableRow key={index} className={colorClass}>
                <TableCell>
                  <strong>{result.scenario.name}</strong>
                  {result.scenario.historicalPeriod && (
                    <>
                      <br />
                      <span className="text-xs text-gray-600">{result.scenario.historicalPeriod}</span>
                    </>
                  )}
                </TableCell>
                <TableCell>{formatCurrencyWhole(result.absoluteLoss)}</TableCell>
                <TableCell>{formatPercentGerman(result.lossPercent)}</TableCell>
                <TableCell>{formatCurrencyWhole(result.stressedValue)}</TableCell>
                <TableCell className="text-sm">{result.scenario.description}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function WorstCaseHighlight({ worstCase }: { worstCase: StressTestResult }) {
  return (
    <div className="mt-[15px] p-[10px] bg-[#f8d7da] border border-[#f5c6cb] rounded">
      <h6>⚠️ Worst-Case-Szenario:</h6>
      <p className="m-0 text-sm">
        <strong>{worstCase.scenario.name}</strong>: {getStressTestDescription(worstCase)}
      </p>
      {worstCase.scenario.historicalReference && (
        <p className="m-0 mt-2 text-xs text-gray-700">
          Historische Referenz: {worstCase.scenario.historicalReference}
        </p>
      )}
    </div>
  )
}

function StressTestInterpretation({ averageLoss, portfolioValue }: { averageLoss: number; portfolioValue: number }) {
  const averageLossPercent = (averageLoss / portfolioValue) * 100

  return (
    <div className="mt-[15px] p-[10px] bg-[#f8f9fa] border border-[#dee2e6] rounded">
      <h6>💡 Interpretation:</h6>
      <p className="m-0 text-sm">
        Durchschnittlicher Verlust über alle Szenarien: {formatCurrencyWhole(averageLoss)} (
        {formatPercentGerman(averageLossPercent)}). Stress-Tests helfen dabei, extreme Marktsituationen besser einzuschätzen
        und Ihr Portfolio entsprechend anzupassen. Beachten Sie: Historische Szenarien sind real aufgetretene Krisen,
        während hypothetische Szenarien "Was-wäre-wenn"-Analysen darstellen.
      </p>
    </div>
  )
}

function getScenarios(scenarioType: 'historical' | 'hypothetical' | 'all'): StressScenario[] {
  switch (scenarioType) {
    case 'historical':
      return HISTORICAL_STRESS_SCENARIOS
    case 'hypothetical':
      return HYPOTHETICAL_STRESS_SCENARIOS
    case 'all':
      return [...HISTORICAL_STRESS_SCENARIOS, ...HYPOTHETICAL_STRESS_SCENARIOS]
    default:
      return HISTORICAL_STRESS_SCENARIOS
  }
}

/**
 * Component to display Stress Test analysis
 * Shows how portfolio would perform under extreme market conditions
 */
export function StressTestDisplay({
  portfolioValue,
  scenarioType = 'historical',
  title = 'Stress-Test Analyse',
  showDetails = true,
}: StressTestDisplayProps) {
  const scenarios = getScenarios(scenarioType)
  const analysis = runStressTestAnalysis(portfolioValue, scenarios)

  return (
    <div className="mb-[30px]">
      <h4 className="text-[#1976d2] mb-[15px]">
        ⚡
        {title}
      </h4>

      <StressTestParameters portfolioValue={portfolioValue} scenarioCount={scenarios.length} />

      <StressTestMobileCards results={analysis.results} />
      <StressTestDesktopTable results={analysis.results} />

      {showDetails && (
        <>
          <WorstCaseHighlight worstCase={analysis.worstCase} />
          <StressTestInterpretation averageLoss={analysis.averageLoss} portfolioValue={portfolioValue} />
        </>
      )}

      <style>
        {`.warning-row{background-color:#fff3cd!important}.info-row{background-color:#d1ecf1!important}.danger-row{background-color:#f8d7da!important}.mobile-only{display:block}.desktop-only{display:none}.monte-carlo-mobile{display:flex;flex-direction:column;gap:10px}.monte-carlo-card{border:1px solid #dee2e6;border-radius:8px;padding:15px}.monte-carlo-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.scenario-name{font-weight:bold;font-size:14px}.probability{font-weight:bold;font-size:16px;color:#d32f2f}.scenario-description{font-size:13px;color:#666;line-height:1.5}.table-container{overflow-x:auto}@media (min-width:768px){.mobile-only{display:none}.desktop-only{display:block}}`}
      </style>
    </div>
  )
}
