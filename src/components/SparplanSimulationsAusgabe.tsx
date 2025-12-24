// Modern shadcn/ui component implementation
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import type { SparplanElement } from '../utils/sparplan-utils'
import { fullSummary, getYearlyPortfolioProgression, type Summary } from '../utils/summary-utils'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import CalculationExplanationModal from './CalculationExplanationModal'
import {
  createInterestExplanation,
  createTaxExplanation,
  createEndkapitalExplanation,
  type CalculationExplanation,
} from './calculationHelpers'
import InteractiveChart from './InteractiveChart'
import { convertSparplanElementsToSimulationResult, hasInflationAdjustedValues } from '../utils/chart-data-converter'
import { TooltipProvider } from './ui/tooltip'
import type { SimulationResultElement, VorabpauschaleDetails } from '../utils/simulate'
import { YearlyProgressionCard } from './sparplan/YearlyProgressionCard'
import { SummaryCard } from './sparplan/SummaryCard'
import { useSimulationModals } from '../hooks/useSimulationModals'
import { useCallback, useMemo } from 'react'
import { FinancialGoalsKPIDashboard } from './FinancialGoalsKPIDashboard'
import { PortfolioTimeline } from './timeline/PortfolioTimeline'

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
    className="ml-2 cursor-pointer text-[#1976d2] align-middle"
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
)

// Using shadcn/ui table components instead of legacy table

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
    <div className="text-center p-6 bg-gradient-to-br from-[#28a745] to-[#20c997] text-white rounded-xl my-4 shadow-[0_4px_12px_rgba(40,167,69,0.3)]">
      <div className="text-xl mb-2 opacity-90">Ihr Gesamtkapital</div>
      <div className="text-[2.5rem] font-bold tracking-[-1px] flex items-center justify-center gap-2">
        <span>{thousands(amount.toFixed(2))} €</span>
        {onInfoClick && (
          <InfoIcon
            onClick={() =>
              onInfoClick('endkapital', {
                jahr: new Date().getFullYear(),
                endkapital: amount.toFixed(2),
                einzahlung: 0,
              })
            }
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
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🎯 Endkapital
        </CollapsibleCardHeader>
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
function createTaxCalculation(simData: SimulationResultElement, jahr: number): CalculationExplanation {
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

// Custom hook to handle calculation info modal logic
function useCalculationInfoHandler(
  elemente: SparplanElement[] | undefined,
  showCalculationInfoModal: (explanation: CalculationExplanation | null) => void,
) {
  const findSimulationDataForYear = useCallback(
    (jahr: number) => {
      const yearSimData = elemente?.find(el => el.simulation[jahr])
      return yearSimData?.simulation[jahr]
    },
    [elemente],
  )

  const handleShowCalculationInfo = useCallback(
    (explanationType: string, rowData: CalculationInfoData) => {
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
    },
    [findSimulationDataForYear, showCalculationInfoModal],
  )

  return handleShowCalculationInfo
}

// Custom hook to prepare summary data
function useSummaryData(elemente: SparplanElement[] | undefined) {
  const summary: Summary = useMemo(() => fullSummary(elemente), [elemente])
  const yearlyProgression = useMemo(() => getYearlyPortfolioProgression(elemente), [elemente])
  const hasInflationData = useMemo(
    () => yearlyProgression.some(p => p.totalCapitalReal !== undefined),
    [yearlyProgression],
  )
  const tableData = useMemo(() => yearlyProgression.sort((a, b) => b.year - a.year), [yearlyProgression])

  return { summary, yearlyProgression, hasInflationData, tableData }
}

// Component for chart section
function ChartSection({ elemente }: { elemente?: SparplanElement[] }) {
  const simulationData = elemente && elemente.length > 0 ? convertSparplanElementsToSimulationResult(elemente) : {}

  // Calculate yearly contributions from the progression data
  const yearlyProgression = elemente && elemente.length > 0 ? getYearlyPortfolioProgression(elemente) : []
  const yearlyContributions = new Map<number, number>()
  yearlyProgression.forEach(entry => {
    yearlyContributions.set(entry.year, entry.yearlyContribution)
  })

  return (
    <div className="mb-6 space-y-4">
      {elemente && elemente.length > 0 && (
        <InteractiveChart
          simulationData={simulationData}
          showRealValues={hasInflationAdjustedValues(simulationData)}
          className="mb-4"
        />
      )}
      <PortfolioTimeline simulationData={simulationData} yearlyContributions={yearlyContributions} />
    </div>
  )
}

// Component for modals section
function ModalsSection(props: ModalsProps) {
  const {
    showVorabpauschaleModal,
    hideVorabpauschaleInfo,
    selectedVorabDetails,
    showCalculationModal,
    hideCalculationInfo,
    calculationDetails,
  } = props
  return (
    <>
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
    </>
  )
}

// Type for progression cards props
interface ProgressionCardsProps {
  tableData: ReturnType<typeof getYearlyPortfolioProgression>
  hasInflationData: boolean
  handleShowCalculationInfo: (explanationType: string, rowData: CalculationInfoData) => void
  elemente?: SparplanElement[]
  showVorabpauschaleInfo: (details: VorabpauschaleDetails) => void
  summary: Summary
  yearlyProgression: ReturnType<typeof getYearlyPortfolioProgression>
}

// Type for modals props
interface ModalsProps {
  showVorabpauschaleModal: boolean
  hideVorabpauschaleInfo: () => void
  selectedVorabDetails: VorabpauschaleDetails | null
  showCalculationModal: boolean
  hideCalculationInfo: () => void
  calculationDetails: CalculationExplanation | null
}

// Type for card content props
type SparplanCardContentProps = ProgressionCardsProps & ModalsProps

// Component for progression cards section
function ProgressionCardsSection(props: ProgressionCardsProps) {
  const {
    tableData,
    hasInflationData,
    handleShowCalculationInfo,
    elemente,
    showVorabpauschaleInfo,
    summary,
    yearlyProgression,
  } = props
  return (
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
  )
}

// Component for the card content
function SparplanCardContent(props: SparplanCardContentProps) {
  const {
    elemente,
    tableData,
    hasInflationData,
    handleShowCalculationInfo,
    showVorabpauschaleInfo,
    summary,
    yearlyProgression,
    showVorabpauschaleModal,
    hideVorabpauschaleInfo,
    selectedVorabDetails,
    showCalculationModal,
    hideCalculationInfo,
    calculationDetails,
  } = props
  return (
    <CardContent>
      <div className="mb-4 text-[#666] text-sm">
        Jahr-für-Jahr Progression Ihres Portfolios - zeigt die kumulierte Kapitalentwicklung über die Zeit
      </div>
      <div className="mb-6">
        <FinancialGoalsKPIDashboard />
      </div>
      <ChartSection elemente={elemente} />
      <ProgressionCardsSection
        tableData={tableData}
        hasInflationData={hasInflationData}
        handleShowCalculationInfo={handleShowCalculationInfo}
        elemente={elemente}
        showVorabpauschaleInfo={showVorabpauschaleInfo}
        summary={summary}
        yearlyProgression={yearlyProgression}
      />
      <ModalsSection
        showVorabpauschaleModal={showVorabpauschaleModal}
        hideVorabpauschaleInfo={hideVorabpauschaleInfo}
        selectedVorabDetails={selectedVorabDetails}
        showCalculationModal={showCalculationModal}
        hideCalculationInfo={hideCalculationInfo}
        calculationDetails={calculationDetails}
      />
    </CardContent>
  )
}

// Component for card header
function SparplanCardHeader() {
  return (
    <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
      📈 Sparplan-Verlauf
    </CollapsibleCardHeader>
  )
}

export function SparplanSimulationsAusgabe({ elemente }: { elemente?: SparplanElement[] }) {
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

  const { summary, yearlyProgression, hasInflationData, tableData } = useSummaryData(elemente)
  const handleShowCalculationInfo = useCalculationInfoHandler(elemente, showCalculationInfoModal)

  return (
    <TooltipProvider>
      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <SparplanCardHeader />
          <CollapsibleContent>
            <SparplanCardContent
              elemente={elemente}
              tableData={tableData}
              hasInflationData={hasInflationData}
              handleShowCalculationInfo={handleShowCalculationInfo}
              showVorabpauschaleInfo={showVorabpauschaleInfo}
              summary={summary}
              yearlyProgression={yearlyProgression}
              showVorabpauschaleModal={showVorabpauschaleModal}
              hideVorabpauschaleInfo={hideVorabpauschaleInfo}
              selectedVorabDetails={selectedVorabDetails}
              showCalculationModal={showCalculationModal}
              hideCalculationInfo={hideCalculationInfo}
              calculationDetails={calculationDetails}
            />
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
