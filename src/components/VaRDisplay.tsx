import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { calculateParametricVaR, getVaRDescription, type VaRResult } from '../utils/value-at-risk'
import { formatCurrencyWhole, formatPercentGerman } from '../utils/currency'

interface VaRDisplayProps {
  /** Current portfolio value in EUR */
  portfolioValue: number
  /** Average return (e.g., 0.07 for 7%) */
  averageReturn: number
  /** Standard deviation (e.g., 0.15 for 15%) */
  standardDeviation: number
  /** Time horizon in years (default: 1) */
  timeHorizon?: number
  /** Title for the VaR section */
  title?: string
}

const getRowClassName = (confidenceLevel: number) => {
  if (confidenceLevel === 90) return 'warning-row'
  if (confidenceLevel === 95) return 'info-row'
  if (confidenceLevel === 99) return 'danger-row'
  return ''
}

function VaRParameters({
  portfolioValue,
  timeHorizon,
  averageReturn,
  standardDeviation,
}: {
  portfolioValue: number
  timeHorizon: number
  averageReturn: number
  standardDeviation: number
}) {
  return (
    <div className="mb-5">
      <p>
        <strong>Portfolio-Wert:</strong> {formatCurrencyWhole(portfolioValue)}
      </p>
      <p>
        <strong>Zeithorizont:</strong> {timeHorizon} Jahr{timeHorizon > 1 ? 'e' : ''}
      </p>
      <p>
        <strong>Annahme:</strong> Normalverteilte Renditen mit durchschnittlicher Rendite{' '}
        {formatPercentGerman(averageReturn * 100)} und Volatilität {formatPercentGerman(standardDeviation * 100)}
      </p>
    </div>
  )
}

function VaRMobileCards({ results }: { results: VaRResult[] }) {
  return (
    <div className="mobile-only monte-carlo-mobile">
      {results.map((result: VaRResult, index: number) => (
        <div key={index} className={`monte-carlo-card ${getRowClassName(result.confidenceLevel)}`}>
          <div className="monte-carlo-header">
            <span className="scenario-name">{result.confidenceLevel}% Konfidenzniveau</span>
            <span className="probability">{formatCurrencyWhole(result.maxExpectedLossEur)}</span>
          </div>
          <div className="scenario-description">
            {formatPercentGerman(result.maxExpectedLossPercent)} Verlust
            <br />
            {getVaRDescription(result)}
          </div>
        </div>
      ))}
    </div>
  )
}

function VaRDesktopTable({ results }: { results: VaRResult[] }) {
  return (
    <div className="desktop-only table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Konfidenzniveau</TableHead>
            <TableHead>Maximaler Verlust (€)</TableHead>
            <TableHead>Maximaler Verlust (%)</TableHead>
            <TableHead>Bedeutung</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result: VaRResult, index: number) => (
            <TableRow key={index} className={getRowClassName(result.confidenceLevel)}>
              <TableCell>{result.confidenceLevel}%</TableCell>
              <TableCell>{formatCurrencyWhole(result.maxExpectedLossEur)}</TableCell>
              <TableCell>{formatPercentGerman(result.maxExpectedLossPercent)}</TableCell>
              <TableCell className="text-sm">{getVaRDescription(result)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function VaRInterpretation({ varResult, timeHorizon }: { varResult: VaRResult; timeHorizon: number }) {
  return (
    <div className="mt-[15px] p-[10px] bg-[#f8f9fa] border border-[#dee2e6] rounded">
      <h6>💡 Interpretation:</h6>
      <p className="m-0 text-sm">
        Der Value at Risk (VaR) gibt an, mit welcher Wahrscheinlichkeit ein bestimmter Verlust nicht überschritten
        wird. Ein VaR von {formatCurrencyWhole(varResult.maxExpectedLossEur)} bei 95% Konfidenzniveau bedeutet: Mit 95%
        Wahrscheinlichkeit wird der Verlust innerhalb von {timeHorizon} Jahr{timeHorizon > 1 ? 'en' : ''} nicht höher
        als dieser Betrag sein. Es besteht aber eine 5% Chance, dass der Verlust größer ausfällt.
      </p>
    </div>
  )
}

/**
 * Component to display Value at Risk (VaR) analysis
 */
export function VaRDisplay({
  portfolioValue,
  averageReturn,
  standardDeviation,
  timeHorizon = 1,
  title = 'Value at Risk (VaR) Analyse',
}: VaRDisplayProps) {
  // Calculate VaR for all confidence levels
  const varAnalysis = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation, timeHorizon)

  return (
    <div className="mb-[30px]">
      <h4 className="text-[#1976d2] mb-[15px]">
        📉
        {title}
      </h4>

      <VaRParameters
        portfolioValue={portfolioValue}
        timeHorizon={timeHorizon}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />

      <VaRMobileCards results={varAnalysis.results} />
      <VaRDesktopTable results={varAnalysis.results} />

      <VaRInterpretation varResult={varAnalysis.results[1]} timeHorizon={timeHorizon} />

      <style>
        {`
          .warning-row {
            background-color: #fff3cd !important;
          }
          .info-row {
            background-color: #d1ecf1 !important;
          }
          .danger-row {
            background-color: #f8d7da !important;
          }
        `}
      </style>
    </div>
  )
}
