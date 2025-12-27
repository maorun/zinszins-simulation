import { TransferSummary } from './TransferSummary'
import { GenerationBreakdown } from './GenerationBreakdown'
import { BeneficiaryDetails } from './BeneficiaryDetails'
import { GiftSchedule } from './GiftSchedule'
import type { GenerationalTransferPlan } from '../../../helpers/generational-wealth-transfer'

interface WealthTransferResultsProps {
  plan: GenerationalTransferPlan
}

export function WealthTransferResults({ plan }: WealthTransferResultsProps) {
  const generations = Object.values(plan.byGeneration).sort((a, b) => a.generation - b.generation)
  const beneficiaries = Object.values(plan.byBeneficiary)

  return (
    <div className="space-y-4">
      <TransferSummary
        totalGifted={plan.totalGifted}
        totalTax={plan.totalTax}
        totalNet={plan.totalNet}
      />

      <GenerationBreakdown generations={generations} totalGifted={plan.totalGifted} />

      <BeneficiaryDetails beneficiaries={beneficiaries} totalGifted={plan.totalGifted} />

      <GiftSchedule gifts={plan.gifts} />
    </div>
  )
}
