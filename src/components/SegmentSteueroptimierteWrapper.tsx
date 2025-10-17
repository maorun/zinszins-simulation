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

const DEFAULT_CONFIG = {
  baseWithdrawalRate: 0.04,
  targetTaxRate: 0.26375,
  optimizationMode: 'balanced' as const,
  freibetragUtilizationTarget: 0.85,
  rebalanceFrequency: 'yearly' as const,
}

function getConfigValues(steuerOptimierteConfig: WithdrawalSegment['steuerOptimierteConfig']) {
  return {
    ...DEFAULT_CONFIG,
    ...steuerOptimierteConfig,
  }
}

function buildFormValue(config: ReturnType<typeof getConfigValues>): FormValue {
  return {
    steueroptimierteEntnahmeBaseWithdrawalRate: config.baseWithdrawalRate,
    steueroptimierteEntnahmeTargetTaxRate: config.targetTaxRate,
    steueroptimierteEntnahmeOptimizationMode: config.optimizationMode,
    steueroptimierteEntnahmeFreibetragUtilizationTarget: config.freibetragUtilizationTarget,
    steueroptimierteEntnahmeRebalanceFrequency: config.rebalanceFrequency,
  }
}

function createUpdateHandler(
  segment: WithdrawalSegment,
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void,
) {
  return (updates: Partial<FormValue>) => {
    const currentConfig = getConfigValues(segment.steuerOptimierteConfig)

    onUpdate(segment.id, {
      steuerOptimierteConfig: {
        baseWithdrawalRate: updates.steueroptimierteEntnahmeBaseWithdrawalRate || currentConfig.baseWithdrawalRate,
        targetTaxRate: updates.steueroptimierteEntnahmeTargetTaxRate || currentConfig.targetTaxRate,
        optimizationMode: updates.steueroptimierteEntnahmeOptimizationMode || currentConfig.optimizationMode,
        freibetragUtilizationTarget:
          updates.steueroptimierteEntnahmeFreibetragUtilizationTarget || currentConfig.freibetragUtilizationTarget,
        rebalanceFrequency: updates.steueroptimierteEntnahmeRebalanceFrequency || currentConfig.rebalanceFrequency,
      },
    })
  }
}

export function SegmentSteueroptimierteWrapper({ segment, onUpdate }: Props) {
  const config = getConfigValues(segment.steuerOptimierteConfig)

  return (
    <div className="space-y-4">
      <SteueroptimierteEntnahmeConfiguration
        formValue={buildFormValue(config)}
        updateFormValue={createUpdateHandler(segment, onUpdate)}
      />
    </div>
  )
}
