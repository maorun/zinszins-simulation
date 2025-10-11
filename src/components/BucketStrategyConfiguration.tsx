import { Label } from './ui/label'
import { SubStrategySelector } from './SubStrategySelector'
import { VariabelProzentConfig, MonatlichFestConfig } from './BucketSubStrategyConfigs'
import { DynamischConfig } from './BucketDynamischConfig'
import {
  InitialCashCushionConfig,
  RefillThresholdConfig,
  RefillPercentageConfig,
} from './BucketConfigComponents'
import {
  getCurrentValuesFromForm,
  getCurrentValuesFromDirect,
  createFormUpdateHandler,
  type BucketStrategyFormValues,
  type BucketStrategyConfigValues,
  type BucketStrategyChangeHandlers,
} from './BucketStrategyConfiguration.helpers'

interface BucketStrategyConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: BucketStrategyFormValues
  updateFormValue?: (value: BucketStrategyFormValues) => void

  // For direct state management (Segmentiert)
  values?: Partial<BucketStrategyConfigValues>
  onChange?: BucketStrategyChangeHandlers

  // Optional unique ID prefix for multiple instances
  idPrefix?: string
}

export function BucketStrategyConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
  idPrefix = 'bucket-sub-strategy',
}: BucketStrategyConfigurationProps) {
  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('BucketStrategyConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
  }

  // Get current values based on mode
  const currentValues = isFormMode
    ? getCurrentValuesFromForm(formValue!)
    : getCurrentValuesFromDirect(values!)

  // Helper for form mode updates
  const updateFormBucketConfig = isFormMode
    ? createFormUpdateHandler({
        formValue: formValue!,
        updateFormValue: updateFormValue!,
        currentValues,
      })
    : undefined

  // Helper to handle value changes in either mode
  const handleValueChange = <K extends keyof BucketStrategyConfigValues>(
    key: K,
    value: BucketStrategyConfigValues[K],
  ) => {
    if (isFormMode && updateFormBucketConfig) {
      updateFormBucketConfig({ [key]: value })
    }
    else if (isDirectMode && onChange) {
      const handlerMap: Record<string, keyof BucketStrategyChangeHandlers> = {
        initialCashCushion: 'onInitialCashCushionChange',
        refillThreshold: 'onRefillThresholdChange',
        refillPercentage: 'onRefillPercentageChange',
        baseWithdrawalRate: 'onBaseWithdrawalRateChange',
        subStrategy: 'onSubStrategyChange',
        variabelProzent: 'onVariabelProzentChange',
        monatlicheBetrag: 'onMonatlicheBetragChange',
        dynamischBasisrate: 'onDynamischBasisrateChange',
        dynamischObereSchwell: 'onDynamischObereSchwell',
        dynamischObereAnpassung: 'onDynamischObereAnpassung',
        dynamischUntereSchwell: 'onDynamischUntereSchwell',
        dynamischUntereAnpassung: 'onDynamischUntereAnpassung',
      }
      const handlerKey = handlerMap[key]
      if (handlerKey && onChange[handlerKey]) {
        (onChange[handlerKey] as (v: unknown) => void)(value)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Drei-Eimer-Strategie Konfiguration</Label>

      {/* Sub-strategy Selection */}
      <SubStrategySelector
        value={currentValues.subStrategy}
        onChange={subStrategy => handleValueChange('subStrategy', subStrategy)}
        idPrefix={idPrefix}
      />

      {/* Sub-strategy specific configuration */}
      {currentValues.subStrategy === 'variabel_prozent' && (
        <VariabelProzentConfig
          value={currentValues.variabelProzent}
          onChange={v => handleValueChange('variabelProzent', v)}
        />
      )}

      {currentValues.subStrategy === 'monatlich_fest' && (
        <MonatlichFestConfig
          value={currentValues.monatlicheBetrag}
          onChange={v => handleValueChange('monatlicheBetrag', v)}
        />
      )}

      {currentValues.subStrategy === 'dynamisch' && (
        <DynamischConfig
          basisrate={currentValues.dynamischBasisrate}
          obereSchwell={currentValues.dynamischObereSchwell}
          obereAnpassung={currentValues.dynamischObereAnpassung}
          untereSchwell={currentValues.dynamischUntereSchwell}
          untereAnpassung={currentValues.dynamischUntereAnpassung}
          onBasisrateChange={v => handleValueChange('dynamischBasisrate', v)}
          onObereSchwell={v => handleValueChange('dynamischObereSchwell', v)}
          onObereAnpassung={v => handleValueChange('dynamischObereAnpassung', v)}
          onUntereSchwell={v => handleValueChange('dynamischUntereSchwell', v)}
          onUntereAnpassung={v => handleValueChange('dynamischUntereAnpassung', v)}
        />
      )}

      {/* Initial Cash Cushion */}
      <InitialCashCushionConfig
        value={currentValues.initialCashCushion}
        onChange={v => handleValueChange('initialCashCushion', v)}
        inputId={isFormMode ? 'initialCashCushion' : 'bucket-initial-cash'}
        isFormMode={isFormMode}
      />

      {/* Refill Threshold */}
      <RefillThresholdConfig
        value={currentValues.refillThreshold}
        onChange={v => handleValueChange('refillThreshold', v)}
        inputId={isFormMode ? 'refillThreshold' : 'bucket-refill-threshold'}
      />

      {/* Refill Percentage */}
      <RefillPercentageConfig
        value={currentValues.refillPercentage}
        onChange={v => handleValueChange('refillPercentage', v)}
      />
    </div>
  )
}
