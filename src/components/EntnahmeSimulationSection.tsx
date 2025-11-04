import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy } from '../utils/config-storage'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'

type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

type SegmentedComparisonResult = {
  strategy: SegmentedComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
  result: WithdrawalResult
}

type WithdrawalRowData = Record<string, unknown> & {
  year: number
  startkapital: number
  endkapital: number
  entnahme: number
  zinsen: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
}

interface EntnahmeSimulationSectionProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: WithdrawalRowData[]
    withdrawalResult: WithdrawalResult
    duration: number | null
  } | null
  formValue: WithdrawalFormValue
  useComparisonMode: boolean
  comparisonResults: ComparisonResult[]
  useSegmentedComparisonMode: boolean
  segmentedComparisonResults: SegmentedComparisonResult[]
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}

export function EntnahmeSimulationSection(props: EntnahmeSimulationSectionProps) {
  return (
    <CollapsibleCard>
      <CollapsibleCardHeader className="text-left">Simulation</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <EntnahmeSimulationDisplay {...props} />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
