import type { WithdrawalStrategy } from '../../../helpers/withdrawal'
import type { ComparisonStrategy } from '../../utils/config-storage'
import { getStrategyDisplayName } from '../../utils/withdrawal-strategy-utils'
import {
  VARIABLE_PERCENTAGE,
  MONTHLY_AMOUNT,
  DYNAMIC_STRATEGY,
  BUCKET_STRATEGY,
  RETURN_RATE,
} from './withdrawal-strategy-constants'

interface ComparisonStrategyCardProps {
  strategy: ComparisonStrategy
  index: number
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
  onRemove: (id: string) => void
}

/**
 * Reusable number input field component
 */
interface NumberFieldProps {
  label: string
  value: number | undefined
  defaultValue: number
  min?: number
  max?: number
  step?: number | string
  className?: string
  inputClassName?: string
  onChange: (value: number) => void
}

function NumberField({
  label,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  className = '',
  inputClassName = 'w-full',
  onChange,
}: NumberFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold mb-1.5">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || defaultValue}
        onChange={e => onChange(parseFloat(e.target.value) || defaultValue)}
        className={`${inputClassName} px-1.5 py-1.5 border border-gray-300 rounded`}
      />
    </div>
  )
}

/**
 * Variable percentage field for variable withdrawal strategy
 */
function VariablePercentageField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Entnahme-Prozentsatz (%)"
      value={value}
      defaultValue={VARIABLE_PERCENTAGE.DEFAULT}
      min={VARIABLE_PERCENTAGE.MIN}
      max={VARIABLE_PERCENTAGE.MAX}
      step={VARIABLE_PERCENTAGE.STEP}
      className="col-span-2"
      inputClassName="w-1/2"
      onChange={newValue => onUpdate(strategyId, { variabelProzent: newValue })}
    />
  )
}

/**
 * Monthly amount field for fixed monthly withdrawal strategy
 */
function MonthlyAmountField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Monatlicher Betrag (€)"
      value={value}
      defaultValue={MONTHLY_AMOUNT.DEFAULT}
      min={MONTHLY_AMOUNT.MIN}
      step={MONTHLY_AMOUNT.STEP}
      className="col-span-2"
      inputClassName="w-1/2"
      onChange={newValue => onUpdate(strategyId, { monatlicheBetrag: newValue })}
    />
  )
}

/**
 * Base rate field for dynamic withdrawal strategy
 */
function DynamicBasisRateField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Basis-Rate (%)"
      value={value}
      defaultValue={DYNAMIC_STRATEGY.BASIS_RATE.DEFAULT}
      min={DYNAMIC_STRATEGY.BASIS_RATE.MIN}
      max={DYNAMIC_STRATEGY.BASIS_RATE.MAX}
      step={DYNAMIC_STRATEGY.BASIS_RATE.STEP}
      onChange={newValue => onUpdate(strategyId, { dynamischBasisrate: newValue })}
    />
  )
}

/**
 * Upper threshold field for dynamic withdrawal strategy
 */
function DynamicUpperThresholdField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Obere Schwelle (%)"
      value={value}
      defaultValue={DYNAMIC_STRATEGY.UPPER_THRESHOLD.DEFAULT}
      min={DYNAMIC_STRATEGY.UPPER_THRESHOLD.MIN}
      max={DYNAMIC_STRATEGY.UPPER_THRESHOLD.MAX}
      step={DYNAMIC_STRATEGY.UPPER_THRESHOLD.STEP}
      onChange={newValue => onUpdate(strategyId, { dynamischObereSchwell: newValue })}
    />
  )
}

/**
 * Lower threshold field for dynamic withdrawal strategy
 */
function DynamicLowerThresholdField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Untere Schwelle (%)"
      value={value}
      defaultValue={DYNAMIC_STRATEGY.LOWER_THRESHOLD.DEFAULT}
      min={DYNAMIC_STRATEGY.LOWER_THRESHOLD.MIN}
      max={DYNAMIC_STRATEGY.LOWER_THRESHOLD.MAX}
      step={DYNAMIC_STRATEGY.LOWER_THRESHOLD.STEP}
      onChange={newValue => onUpdate(strategyId, { dynamischUntereSchwell: newValue })}
    />
  )
}

/**
 * Dynamic strategy fields for dynamic withdrawal strategy
 */
function DynamicStrategyFields({
  strategyId,
  basisrate,
  obereSchwell,
  untereSchwell,
  onUpdate,
}: {
  strategyId: string
  basisrate: number | undefined
  obereSchwell: number | undefined
  untereSchwell: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <>
      <DynamicBasisRateField strategyId={strategyId} value={basisrate} onUpdate={onUpdate} />
      <DynamicUpperThresholdField strategyId={strategyId} value={obereSchwell} onUpdate={onUpdate} />
      <DynamicLowerThresholdField strategyId={strategyId} value={untereSchwell} onUpdate={onUpdate} />
    </>
  )
}

/**
 * Cash cushion field for bucket strategy
 */
function BucketCashCushionField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Cash-Polster (€)"
      value={value}
      defaultValue={BUCKET_STRATEGY.CASH_CUSHION.DEFAULT}
      min={BUCKET_STRATEGY.CASH_CUSHION.MIN}
      step={BUCKET_STRATEGY.CASH_CUSHION.STEP}
      onChange={newValue => onUpdate(strategyId, { bucketInitialCash: newValue })}
    />
  )
}

/**
 * Base rate field for bucket strategy
 */
function BucketBaseRateField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Basis-Rate (%)"
      value={value}
      defaultValue={BUCKET_STRATEGY.BASE_RATE.DEFAULT}
      min={BUCKET_STRATEGY.BASE_RATE.MIN}
      max={BUCKET_STRATEGY.BASE_RATE.MAX}
      step={BUCKET_STRATEGY.BASE_RATE.STEP}
      onChange={newValue => onUpdate(strategyId, { bucketBaseRate: newValue })}
    />
  )
}

/**
 * Bucket strategy fields for bucket withdrawal strategy
 */
function BucketStrategyFields({
  strategyId,
  initialCash,
  baseRate,
  onUpdate,
}: {
  strategyId: string
  initialCash: number | undefined
  baseRate: number | undefined
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <>
      <BucketCashCushionField strategyId={strategyId} value={initialCash} onUpdate={onUpdate} />
      <BucketBaseRateField strategyId={strategyId} value={baseRate} onUpdate={onUpdate} />
    </>
  )
}

/**
 * Render strategy-specific fields based on strategy type
 */
function StrategySpecificFields({
  strategy,
  onUpdate,
}: {
  strategy: ComparisonStrategy
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  if (strategy.strategie === 'variabel_prozent') {
    return <VariablePercentageField strategyId={strategy.id} value={strategy.variabelProzent} onUpdate={onUpdate} />
  }

  if (strategy.strategie === 'monatlich_fest') {
    return <MonthlyAmountField strategyId={strategy.id} value={strategy.monatlicheBetrag} onUpdate={onUpdate} />
  }

  if (strategy.strategie === 'dynamisch') {
    return (
      <DynamicStrategyFields
        strategyId={strategy.id}
        basisrate={strategy.dynamischBasisrate}
        obereSchwell={strategy.dynamischObereSchwell}
        untereSchwell={strategy.dynamischUntereSchwell}
        onUpdate={onUpdate}
      />
    )
  }

  if (strategy.strategie === 'bucket_strategie') {
    return (
      <BucketStrategyFields
        strategyId={strategy.id}
        initialCash={strategy.bucketInitialCash}
        baseRate={strategy.bucketBaseRate}
        onUpdate={onUpdate}
      />
    )
  }

  return null
}

/**
 * Card header with title and remove button
 */
function StrategyCardHeader({
  index,
  name,
  strategyId,
  onRemove,
}: {
  index: number
  name: string
  strategyId: string
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex justify-between items-center mb-2.5">
      <h5 className="m-0">
        Strategie {index + 1}: {name}
      </h5>
      <button
        type="button"
        onClick={() => onRemove(strategyId)}
        className="bg-transparent border-0 text-gray-400 cursor-pointer text-lg hover:text-gray-600"
      >
        ×
      </button>
    </div>
  )
}

/**
 * Strategy type selector field
 */
function StrategyTypeSelector({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: WithdrawalStrategy
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5">Strategie-Typ</label>
      <select
        value={value}
        onChange={e => {
          const newStrategie = e.target.value as WithdrawalStrategy
          onUpdate(strategyId, {
            strategie: newStrategie,
            name: getStrategyDisplayName(newStrategie),
          })
        }}
        className="w-full px-1.5 py-1.5 border border-gray-300 rounded"
      >
        <option value="4prozent">4% Regel</option>
        <option value="3prozent">3% Regel</option>
        <option value="variabel_prozent">Variable Prozent</option>
        <option value="monatlich_fest">Monatlich fest</option>
        <option value="dynamisch">Dynamische Strategie</option>
        <option value="bucket_strategie">Drei-Eimer-Strategie</option>
        <option value="rmd">RMD (Lebenserwartung)</option>
      </select>
    </div>
  )
}

/**
 * Return rate field
 */
function ReturnRateField({
  strategyId,
  value,
  onUpdate,
}: {
  strategyId: string
  value: number
  onUpdate: (id: string, updates: Partial<ComparisonStrategy>) => void
}) {
  return (
    <NumberField
      label="Rendite (%)"
      value={value}
      defaultValue={RETURN_RATE.DEFAULT}
      min={RETURN_RATE.MIN}
      max={RETURN_RATE.MAX}
      step={RETURN_RATE.STEP}
      onChange={newValue => onUpdate(strategyId, { rendite: newValue })}
    />
  )
}

/**
 * Card component for a single comparison strategy
 * Extracted from ComparisonStrategyConfiguration to reduce complexity
 */
export function ComparisonStrategyCard({ strategy, index, onUpdate, onRemove }: ComparisonStrategyCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
      <StrategyCardHeader index={index} name={strategy.name} strategyId={strategy.id} onRemove={onRemove} />

      <div className="grid grid-cols-2 gap-2.5 items-end">
        <StrategyTypeSelector strategyId={strategy.id} value={strategy.strategie} onUpdate={onUpdate} />

        <ReturnRateField strategyId={strategy.id} value={strategy.rendite} onUpdate={onUpdate} />

        <StrategySpecificFields strategy={strategy} onUpdate={onUpdate} />
      </div>
    </div>
  )
}
