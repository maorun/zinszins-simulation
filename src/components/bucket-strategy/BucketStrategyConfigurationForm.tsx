import type React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'

export interface BucketConfig {
  initialCashCushion: number
  refillThreshold: number
  refillPercentage: number
  baseWithdrawalRate: number
}

interface BucketStrategyConfigurationFormProps {
  bucketConfig: BucketConfig | undefined
  onBucketConfigChange: (config: BucketConfig) => void
}

/**
 * Default values for bucket configuration
 */
const DEFAULT_BUCKET_VALUES = {
  initialCashCushion: 20000,
  refillThreshold: 5000,
  refillPercentage: 0.5,
  baseWithdrawalRate: 0.04,
} as const

/**
 * Get value with fallback to default
 */
function getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value ?? defaultValue
}

function getDefaultConfig(bucketConfig: BucketConfig | undefined): BucketConfig {
  return {
    initialCashCushion: getValueOrDefault(bucketConfig?.initialCashCushion, DEFAULT_BUCKET_VALUES.initialCashCushion),
    refillThreshold: getValueOrDefault(bucketConfig?.refillThreshold, DEFAULT_BUCKET_VALUES.refillThreshold),
    refillPercentage: getValueOrDefault(bucketConfig?.refillPercentage, DEFAULT_BUCKET_VALUES.refillPercentage),
    baseWithdrawalRate: getValueOrDefault(bucketConfig?.baseWithdrawalRate, DEFAULT_BUCKET_VALUES.baseWithdrawalRate),
  }
}

function createNumberInputHandler(
  bucketConfig: BucketConfig | undefined,
  onBucketConfigChange: (config: BucketConfig) => void,
  field: keyof BucketConfig,
  defaultValue: number,
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const value = inputValue === '' ? 0 : Number(inputValue) || defaultValue
    const config = getDefaultConfig(bucketConfig)
    onBucketConfigChange({
      ...config,
      [field]: value,
    })
  }
}

function createSliderHandler(
  bucketConfig: BucketConfig | undefined,
  onBucketConfigChange: (config: BucketConfig) => void,
  field: keyof BucketConfig,
  divisor: number,
) {
  return (value: number[]) => {
    const config = getDefaultConfig(bucketConfig)
    onBucketConfigChange({
      ...config,
      [field]: value[0] / divisor,
    })
  }
}

function CashCushionField({ config, bucketConfig, onBucketConfigChange }: ConfigFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Anfängliches Cash-Polster (€)</Label>
      <Input
        type="number"
        value={config.initialCashCushion}
        onChange={createNumberInputHandler(bucketConfig, onBucketConfigChange, 'initialCashCushion', 20000)}
      />
      <p className="text-sm text-gray-600">
        Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen
      </p>
    </div>
  )
}

function BaseWithdrawalRateSlider({ config, bucketConfig, onBucketConfigChange }: ConfigFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Basis-Entnahmerate (%)</Label>
      <div className="px-3">
        <Slider
          value={[config.baseWithdrawalRate * 100]}
          onValueChange={createSliderHandler(bucketConfig, onBucketConfigChange, 'baseWithdrawalRate', 100)}
          max={10}
          min={1}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>1%</span>
          <span className="font-medium text-gray-900">
            {(config.baseWithdrawalRate * 100).toFixed(1)}
            %
          </span>
          <span>10%</span>
        </div>
      </div>
    </div>
  )
}

function RefillThresholdField({ config, bucketConfig, onBucketConfigChange }: ConfigFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Auffüll-Schwellenwert (€)</Label>
      <Input
        type="number"
        value={config.refillThreshold}
        onChange={createNumberInputHandler(bucketConfig, onBucketConfigChange, 'refillThreshold', 5000)}
      />
      <p className="text-sm text-gray-600">
        Überschreiten die jährlichen Gewinne diesen Betrag, wird Cash-Polster aufgefüllt
      </p>
    </div>
  )
}

function RefillPercentageSlider({ config, bucketConfig, onBucketConfigChange }: ConfigFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Auffüll-Anteil (%)</Label>
      <div className="px-3">
        <Slider
          value={[config.refillPercentage * 100]}
          onValueChange={createSliderHandler(bucketConfig, onBucketConfigChange, 'refillPercentage', 100)}
          max={100}
          min={10}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>10%</span>
          <span className="font-medium text-gray-900">
            {(config.refillPercentage * 100).toFixed(0)}
            %
          </span>
          <span>100%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Anteil der Überschussgewinne, der ins Cash-Polster verschoben wird
      </p>
    </div>
  )
}

type ConfigFieldProps = {
  config: BucketConfig
  bucketConfig: BucketConfig | undefined
  onBucketConfigChange: (config: BucketConfig) => void
}

export function BucketStrategyConfigurationForm({
  bucketConfig,
  onBucketConfigChange,
}: BucketStrategyConfigurationFormProps) {
  const config = getDefaultConfig(bucketConfig)

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Drei-Eimer-Strategie Konfiguration</Label>
      <CashCushionField
        config={config}
        bucketConfig={bucketConfig}
        onBucketConfigChange={onBucketConfigChange}
      />
      <BaseWithdrawalRateSlider
        config={config}
        bucketConfig={bucketConfig}
        onBucketConfigChange={onBucketConfigChange}
      />
      <RefillThresholdField
        config={config}
        bucketConfig={bucketConfig}
        onBucketConfigChange={onBucketConfigChange}
      />
      <RefillPercentageSlider
        config={config}
        bucketConfig={bucketConfig}
        onBucketConfigChange={onBucketConfigChange}
      />
    </div>
  )
}
