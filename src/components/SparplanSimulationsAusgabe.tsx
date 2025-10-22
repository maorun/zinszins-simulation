// Modern shadcn/ui component implementation
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { SparplanElement } from '../utils/sparplan-utils'
import { fullSummary, getYearlyPortfolioProgression, type Summary } from '../utils/summary-utils'
import { formatInflationAdjustedValue } from '../utils/inflation-adjustment'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import CalculationExplanationModal from './CalculationExplanationModal'
import { createInterestExplanation, createTaxExplanation, createEndkapitalExplanation, type CalculationExplanation } from './calculationHelpers'
import InteractiveChart from './InteractiveChart'
import { convertSparplanElementsToSimulationResult, hasInflationAdjustedValues } from '../utils/chart-data-converter'
import { TooltipProvider } from './ui/tooltip'
import { GlossaryTerm } from './GlossaryTerm'
import type { VorabpauschaleDetails, SimulationResultElement } from '../utils/simulate'

// Type for calculation info click data
interface CalculationInfoData {
  jahr: number
  [key: string]: number | string | undefined
}

// Helper to convert yearly progression to table row format
function convertProgressionToTableRow(progression: ReturnType<typeof getYearlyPortfolioProgression>[number]) {
  return {
    zeitpunkt: `1.1.${progression.year}`,
    jahr: progression.year,
    einzahlung: progression.yearlyContribution,
    zinsen: progression.yearlyInterest.toFixed(2),
    bezahlteSteuer: progression.yearlyTax.toFixed(2),
    endkapital: progression.totalCapital.toFixed(2),
    cumulativeContributions: progression.cumulativeContributions,
    cumulativeInterest: progression.cumulativeInterest,
    cumulativeTax: progression.cumulativeTax,
    // Inflation-adjusted values
    endkapitalReal: progression.totalCapitalReal?.toFixed(2),
    zinsenReal: progression.yearlyInterestReal?.toFixed(2),
    cumulativeInterestReal: progression.cumulativeInterestReal?.toFixed(2),
  }
}

// Helper component to render Günstigerprüfung information
function GuenstigerpruefungDisplay({
  elemente,
  jahr,
}: {
  elemente?: SparplanElement[]
  jahr: number
}) {
  const elementWithGuenstigerPruefung = elemente?.find(el =>
    el.simulation[jahr]?.vorabpauschaleDetails?.guenstigerPruefungResult,
  )

  const pruefungResult = elementWithGuenstigerPruefung
    ?.simulation[jahr]?.vorabpauschaleDetails?.guenstigerPruefungResult

  if (!pruefungResult) {
    return null
  }

  const favorableText = pruefungResult.isFavorable === 'personal'
    ? 'Persönlicher Steuersatz'
    : 'Abgeltungssteuer'
  const usedRate = `${(pruefungResult.usedTaxRate * 100).toFixed(2)}%`

  return (
    <div className="bg-blue-50 px-2 py-1 rounded space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-blue-600 font-medium">
          🔍
          {' '}
          <GlossaryTerm term="guenstigerpruefung">
            Günstigerprüfung
          </GlossaryTerm>
          :
        </span>
        <span className="font-semibold text-blue-700 text-sm">
          {favorableText}
          {' '}
          (
          {usedRate}
          )
        </span>
      </div>
      <div className="text-xs text-blue-600 italic">
        {pruefungResult.explanation}
      </div>
    </div>
  )
}

// Helper to create explanation based on type (outside component to reduce complexity)
function createExplanationByType(
  explanationType: string,
  simData: SimulationResultElement,
  rowData: CalculationInfoData,
  createInterestFn: (simData: SimulationResultElement, rowData: CalculationInfoData) => CalculationExplanation,
  createTaxFn: (simData: SimulationResultElement, jahr: number) => CalculationExplanation,
  createEndkapitalFn: (simData: SimulationResultElement, rowData: CalculationInfoData) => CalculationExplanation,
): CalculationExplanation | null {
  switch (explanationType) {
    case 'interest':
      return createInterestFn(simData, rowData)
    case 'tax':
      return simData.vorabpauschaleDetails ? createTaxFn(simData, rowData.jahr) : null
    case 'endkapital':
      return createEndkapitalFn(simData, rowData)
    default:
      return null
  }
}

// Info icon component for calculation explanations
const InfoIcon = ({ onClick }: { onClick: () => void }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      marginLeft: '0.5rem',
      cursor: 'pointer',
      color: '#1976d2',
      verticalAlign: 'middle',
    }}
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
)

// Using shadcn/ui table components instead of legacy table

/**
 * Styles for capital display component
 */
const CAPITAL_DISPLAY_STYLES = {
  container: {
    textAlign: 'center' as const,
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #28a745, #20c997)',
    color: 'white',
    borderRadius: '12px',
    margin: '1rem 0',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
  },
  title: { fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.9 },
  amount: {
    fontSize: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
}

/**
 * Component to display Vorabpauschale details for a specific year
 */
function VorabpauschaleDisplay({
  elemente,
  jahr,
  onInfoClick,
}: {
  elemente?: SparplanElement[]
  jahr: number
  onInfoClick: (details: VorabpauschaleDetails) => void
}) {
  // Find any element that has vorabpauschale details for this year
  const elementWithVorab = elemente?.find(el =>
    el.simulation[jahr]?.vorabpauschaleDetails,
  )

  const vorabDetails = elementWithVorab?.simulation[jahr]?.vorabpauschaleDetails

  if (!vorabDetails) {
    return null
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">
        📊
        {' '}
        <GlossaryTerm term="vorabpauschale">
          Vorabpauschale
        </GlossaryTerm>
        {' '}
        (Beispiel):
      </span>
      <span className="font-semibold text-blue-700 text-sm flex items-center">
        {thousands(vorabDetails.vorabpauschaleAmount?.toString() || '0')}
        {' '}
        €
        <InfoIcon
          onClick={() => onInfoClick(vorabDetails)}
        />
      </span>
    </div>
  )
}

/**
 * Display component for total capital with gradient background
 */
function CapitalDisplay({
  amount,
  onInfoClick,
}: {
  amount: number
  onInfoClick?: (explanationType: string, rowData: CalculationInfoData) => void
}) {
  return (
    <div style={CAPITAL_DISPLAY_STYLES.container}>
      <div style={CAPITAL_DISPLAY_STYLES.title}>Ihr Gesamtkapital</div>
      <div style={CAPITAL_DISPLAY_STYLES.amount}>
        <span>
          {thousands(amount.toFixed(2))}
          {' '}
          €
        </span>
        {onInfoClick && (
          <InfoIcon
            onClick={() => onInfoClick('endkapital', {
              jahr: new Date().getFullYear(),
              endkapital: amount.toFixed(2),
              einzahlung: 0,
            })}
          />
        )}
      </div>
    </div>
  )
}

export function SparplanEnd({
  elemente,
  onCalculationInfoClick,
}: {
  elemente?: SparplanElement[]
  onCalculationInfoClick?: (explanationType: string, rowData: CalculationInfoData) => void
}) {
  const summary: Summary = fullSummary(elemente)
  return (
    <Card className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">🎯 Endkapital</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <CapitalDisplay amount={summary.endkapital} onInfoClick={onCalculationInfoClick} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// Helper to format interest with optional inflation adjustment
function formatInterestDisplay(
  summary: Summary,
  hasInflationData: boolean,
  yearlyProgression: ReturnType<typeof getYearlyPortfolioProgression>,
): string {
  const latestProgression = yearlyProgression[yearlyProgression.length - 1]
  if (hasInflationData && latestProgression?.cumulativeInterestReal !== undefined) {
    return formatInflationAdjustedValue(
      summary.zinsen || 0,
      latestProgression.cumulativeInterestReal,
      true,
    )
  }
  return `${thousands(summary.zinsen?.toFixed(2) || '0')} €`
}

// Helper to format end capital with optional inflation adjustment
function formatEndCapitalDisplay(
  summary: Summary,
  hasInflationData: boolean,
  yearlyProgression: ReturnType<typeof getYearlyPortfolioProgression>,
): string {
  const latestProgression = yearlyProgression[yearlyProgression.length - 1]
  if (hasInflationData && latestProgression?.totalCapitalReal !== undefined) {
    return formatInflationAdjustedValue(
      summary.endkapital || 0,
      latestProgression.totalCapitalReal,
      true,
    )
  }
  return `${thousands(summary.endkapital?.toFixed(2) || '0')} €`
}

/**
 * Create interest explanation helper
 */
function createInterestCalculation(
  simData: SimulationResultElement,
  rowData: CalculationInfoData,
): CalculationExplanation {
  return createInterestExplanation(
    simData.startkapital,
    simData.zinsen,
    5, // Default rendite - would need to get from actual config
    rowData.jahr,
  )
}

/**
 * Create tax explanation helper
 */
function createTaxCalculation(
  simData: SimulationResultElement,
  jahr: number,
): CalculationExplanation {
  return createTaxExplanation(
    simData.bezahlteSteuer,
    simData.vorabpauschaleDetails!.vorabpauschaleAmount,
    0.26375, // Default tax rate - would need to get from actual config
    0.3, // Default Teilfreistellungsquote - would need to get from actual config
    simData.genutzterFreibetrag || 2000, // Default freibetrag
    jahr,
  )
}

/**
 * Create end capital explanation helper
 */
function createEndkapitalCalculation(
  simData: SimulationResultElement,
  rowData: CalculationInfoData,
): CalculationExplanation {
  return createEndkapitalExplanation(
    simData.endkapital,
    simData.startkapital,
    typeof rowData.einzahlung === 'number' ? rowData.einzahlung : 0,
    simData.zinsen,
    simData.bezahlteSteuer,
    rowData.jahr,
  )
}

export function SparplanSimulationsAusgabe({
  elemente,
}: {
  elemente?: SparplanElement[]
}) {
  const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false)
  const [selectedVorabDetails, setSelectedVorabDetails] = useState<VorabpauschaleDetails | null>(null)
  const [showCalculationModal, setShowCalculationModal] = useState(false)
  const [calculationDetails, setCalculationDetails] = useState<CalculationExplanation | null>(null)

  const summary: Summary = fullSummary(elemente)

  // Get year-by-year portfolio progression
  const yearlyProgression = getYearlyPortfolioProgression(elemente)

  // Check if inflation is active by seeing if any year has real values
  const hasInflationData = yearlyProgression.some(p => p.totalCapitalReal !== undefined)

  // Convert progression to table data format (reverse order to show newest first)
  const tableData = yearlyProgression
    .sort((a, b) => b.year - a.year)
    .map(convertProgressionToTableRow)

  const showVorabpauschaleInfo = (details: VorabpauschaleDetails) => {
    setSelectedVorabDetails(details)
    setShowVorabpauschaleModal(true)
  }

  // Helper to find simulation data for a given year
  const findSimulationDataForYear = (jahr: number) => {
    const yearSimData = elemente?.find(el => el.simulation[jahr])
    return yearSimData?.simulation[jahr]
  }

  const showCalculationInfo = (explanationType: string, rowData: CalculationInfoData) => {
    const simData = findSimulationDataForYear(rowData.jahr)

    if (!simData) {
      return
    }

    const explanation = createExplanationByType(
      explanationType,
      simData,
      rowData,
      createInterestCalculation,
      createTaxCalculation,
      createEndkapitalCalculation,
    )
    if (explanation) {
      setCalculationDetails(explanation)
      setShowCalculationModal(true)
    }
  }

  return (
    <TooltipProvider>
      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                <CardTitle className="text-left">📈 Sparplan-Verlauf</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Jahr-für-Jahr Progression Ihres Portfolios - zeigt die kumulierte Kapitalentwicklung über die Zeit
              </div>

              {/* Interactive Chart */}
              {elemente && elemente.length > 0 && (
                <div className="mb-6">
                  <InteractiveChart
                    simulationData={convertSparplanElementsToSimulationResult(elemente)}
                    showRealValues={hasInflationAdjustedValues(convertSparplanElementsToSimulationResult(elemente))}
                    className="mb-4"
                  />
                </div>
              )}

              {/* Card Layout for All Devices */}
              <div className="flex flex-col gap-4">
                {tableData?.map((row, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                      <span className="font-semibold text-gray-800 text-base">
                        📅
                        {row.zeitpunkt}
                      </span>
                      <span className="font-bold text-blue-600 text-lg flex items-center">
                        🎯
                        {' '}
                        {hasInflationData && row.endkapitalReal
                          ? formatInflationAdjustedValue(
                              Number(row.endkapital),
                              Number(row.endkapitalReal),
                              true,
                            )
                          : `${thousands(row.endkapital)} €`}
                        <InfoIcon onClick={() => showCalculationInfo('endkapital', row)} />
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 font-medium">💰 Neue Einzahlung:</span>
                        <span className="font-semibold text-green-600 text-sm">
                          {thousands(row.einzahlung.toString())}
                          {' '}
                          €
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 font-medium">📈 Zinsen (Jahr):</span>
                        <span className="font-semibold text-cyan-600 text-sm flex items-center">
                          {hasInflationData && row.zinsenReal
                            ? formatInflationAdjustedValue(
                                Number(row.zinsen),
                                Number(row.zinsenReal),
                                true,
                              )
                            : `${thousands(row.zinsen)} €`}
                          <InfoIcon onClick={() => showCalculationInfo('interest', row)} />
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 font-medium">💸 Bezahlte Steuer (Jahr):</span>
                        <span className="font-semibold text-red-600 text-sm flex items-center">
                          {thousands(row.bezahlteSteuer)}
                          {' '}
                          €
                          <InfoIcon onClick={() => showCalculationInfo('tax', row)} />
                        </span>
                      </div>

                      {/* Show Günstigerprüfung information if available */}
                      <GuenstigerpruefungDisplay elemente={elemente} jahr={row.jahr} />
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 font-medium">💼 Kumulierte Einzahlungen:</span>
                        <span className="font-semibold text-gray-600 text-sm">
                          {thousands(row.cumulativeContributions.toFixed(2))}
                          {' '}
                          €
                        </span>
                      </div>

                      {/* Find Vorabpauschale details for this year */}
                      <VorabpauschaleDisplay
                        elemente={elemente}
                        jahr={row.jahr}
                        onInfoClick={showVorabpauschaleInfo}
                      />
                    </div>
                  </div>
                ))}

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-blue-500 rounded-xl p-5 mt-2">
                  <div className="text-lg font-bold text-blue-500 text-center mb-4">📊 Gesamtübersicht</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col text-center p-2 bg-white rounded border border-gray-300">
                      <span className="text-xs mb-1 opacity-80">💰 Einzahlungen</span>
                      <span className="font-bold text-sm">
                        {thousands(summary.startkapital?.toFixed(2) || '0')}
                        {' '}
                        €
                      </span>
                    </div>
                    <div className="flex flex-col text-center p-2 bg-white rounded border border-gray-300">
                      <span className="text-xs mb-1 opacity-80">📈 Zinsen</span>
                      <span className="font-bold text-sm">
                        {formatInterestDisplay(summary, hasInflationData, yearlyProgression)}
                      </span>
                    </div>
                    <div className="flex flex-col text-center p-2 bg-white rounded border border-gray-300">
                      <span className="text-xs mb-1 opacity-80">💸 Steuern</span>
                      <span className="font-bold text-sm">
                        {thousands(summary.bezahlteSteuer?.toFixed(2) || '0')}
                        {' '}
                        €
                      </span>
                    </div>
                    <div className="flex flex-col text-center p-2 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded border border-green-500">
                      <span className="text-xs mb-1 opacity-90">🎯 Endkapital</span>
                      <span className="font-bold text-sm flex items-center justify-center">
                        {formatEndCapitalDisplay(summary, hasInflationData, yearlyProgression)}
                        <InfoIcon onClick={() => showCalculationInfo('endkapital', {
                          jahr: tableData?.[0]?.jahr || new Date().getFullYear(),
                          endkapital: summary.endkapital?.toFixed(2) || '0',
                          einzahlung: summary.startkapital || 0,
                        })}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <VorabpauschaleExplanationModal
                open={showVorabpauschaleModal}
                onClose={() => setShowVorabpauschaleModal(false)}
                selectedVorabDetails={selectedVorabDetails}
              />

              {calculationDetails && (
                <CalculationExplanationModal
                  open={showCalculationModal}
                  onClose={() => setShowCalculationModal(false)}
                  title={calculationDetails.title}
                  introduction={calculationDetails.introduction}
                  steps={calculationDetails.steps}
                  finalResult={calculationDetails.finalResult}
                />
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </TooltipProvider>
  )
}

const thousands = (value: string) =>
  Number(`${value}`).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
