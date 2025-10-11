import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { SteueroptimierteEntnahmeConfiguration } from './SteueroptimierteEntnahmeConfiguration'

interface Props {
  segment: WithdrawalSegment
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
}

interface FormValue {
  steueroptimierteEntnahmeBaseWithdrawalRate: number
  steueroptimierteEntnahmeTargetTaxRate: number
  steueroptimierteEntnahmeOptimizationMode: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'
  steueroptimierteEntnahmeFreibetragUtilizationTarget: number
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly' | 'quarterly' | 'as_needed'
}

export function SegmentSteueroptimierteWrapper({ segment, onUpdate }: Props) {
  const updateFormValue = (updates: Partial<FormValue>) => {
    onUpdate(segment.id, {
      steuerOptimierteConfig: {
        baseWithdrawalRate:
          updates.steueroptimierteEntnahmeBaseWithdrawalRate
          || segment.steuerOptimierteConfig?.baseWithdrawalRate
          || 0.04,
        targetTaxRate:
          updates.steueroptimierteEntnahmeTargetTaxRate
          || segment.steuerOptimierteConfig?.targetTaxRate
          || 0.26375,
        optimizationMode:
          updates.steueroptimierteEntnahmeOptimizationMode
          || segment.steuerOptimierteConfig?.optimizationMode
          || 'balanced',
        freibetragUtilizationTarget:
          updates.steueroptimierteEntnahmeFreibetragUtilizationTarget
          || segment.steuerOptimierteConfig?.freibetragUtilizationTarget
          || 0.85,
        rebalanceFrequency:
          updates.steueroptimierteEntnahmeRebalanceFrequency
          || segment.steuerOptimierteConfig?.rebalanceFrequency
          || 'yearly',
      },
    })
  }

  return (
    <div className="space-y-4">
      <SteueroptimierteEntnahmeConfiguration
        formValue={{
          steueroptimierteEntnahmeBaseWithdrawalRate:
            segment.steuerOptimierteConfig?.baseWithdrawalRate || 0.04,
          steueroptimierteEntnahmeTargetTaxRate:
            segment.steuerOptimierteConfig?.targetTaxRate || 0.26375,
          steueroptimierteEntnahmeOptimizationMode:
            segment.steuerOptimierteConfig?.optimizationMode || 'balanced',
          steueroptimierteEntnahmeFreibetragUtilizationTarget:
            segment.steuerOptimierteConfig?.freibetragUtilizationTarget || 0.85,
          steueroptimierteEntnahmeRebalanceFrequency:
            segment.steuerOptimierteConfig?.rebalanceFrequency || 'yearly',
        }}
        updateFormValue={updateFormValue}
      />
    </div>
  )
}
