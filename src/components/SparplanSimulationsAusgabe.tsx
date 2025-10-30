// Modern shadcn/ui component implementation
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import type { SparplanElement } from '../utils/sparplan-utils'
import { fullSummary, getYearlyPortfolioProgression, type Summary } from '../utils/summary-utils'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import CalculationExplanationModal from './CalculationExplanationModal'
import { createInterestExplanation, createTaxExplanation, createEndkapitalExplanation, type CalculationExplanation } from './calculationHelpers'
import InteractiveChart from './InteractiveChart'
import { convertSparplanElementsToSimulationResult, hasInflationAdjustedValues } from '../utils/chart-data-converter'
import { TooltipProvider } from './ui/tooltip'
import type { SimulationResultElement } from '../utils/simulate'
import { YearlyProgressionCard } from './sparplan/YearlyProgressionCard'
import { SummaryCard } from './sparplan/SummaryCard'
import { useSimulationModals } from '../hooks/useSimulationModals'

// Type for calculation info click data
interface CalculationInfoData {
  jahr: number
  [key: string]: number | string | undefined
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

// eslint-disable-next-line max-lines-per-function
export function SparplanSimulationsAusgabe({
  elemente,
}: {
  elemente?: SparplanElement[]
}) {
  const {
    showVorabpauschaleModal,
    selectedVorabDetails,
    showCalculationModal,
    calculationDetails,
    showVorabpauschaleInfo,
    hideVorabpauschaleInfo,
    showCalculationInfo: showCalculationInfoModal,
    hideCalculationInfo,
  } = useSimulationModals()

  const summary: Summary = fullSummary(elemente)
  const yearlyProgression = getYearlyPortfolioProgression(elemente)
  const hasInflationData = yearlyProgression.some(p => p.totalCapitalReal !== undefined)
  const tableData = yearlyProgression.sort((a, b) => b.year - a.year)

  const findSimulationDataForYear = (jahr: number) => {
    const yearSimData = elemente?.find(el => el.simulation[jahr])
    return yearSimData?.simulation[jahr]
  }

  const handleShowCalculationInfo = (explanationType: string, rowData: CalculationInfoData) => {
    const simData = findSimulationDataForYear(rowData.jahr)
    if (!simData) return

    const explanation = createExplanationByType(
      explanationType,
      simData,
      rowData,
      createInterestCalculation,
      createTaxCalculation,
      createEndkapitalCalculation,
    )
    showCalculationInfoModal(explanation)
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
              {elemente && elemente.length > 0 && (
                <div className="mb-6">
                  <InteractiveChart
                    simulationData={convertSparplanElementsToSimulationResult(elemente)}
                    showRealValues={hasInflationAdjustedValues(convertSparplanElementsToSimulationResult(elemente))}
                    className="mb-4"
                  />
                </div>
              )}
              <div className="flex flex-col gap-4">
                {tableData?.map((row, index) => (
                  <YearlyProgressionCard
                    key={index}
                    row={row}
                    hasInflationData={hasInflationData}
                    showCalculationInfo={handleShowCalculationInfo}
                    elemente={elemente}
                    showVorabpauschaleInfo={showVorabpauschaleInfo}
                  />
                ))}
                <SummaryCard
                  summary={summary}
                  hasInflationData={hasInflationData}
                  yearlyProgression={yearlyProgression}
                  showCalculationInfo={handleShowCalculationInfo}
                  tableData={tableData}
                />
              </div>
              <VorabpauschaleExplanationModal
                open={showVorabpauschaleModal}
                onClose={hideVorabpauschaleInfo}
                selectedVorabDetails={selectedVorabDetails}
              />
              {calculationDetails && (
                <CalculationExplanationModal
                  open={showCalculationModal}
                  onClose={hideCalculationInfo}
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
