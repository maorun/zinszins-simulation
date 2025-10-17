import type React from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Slider } from './ui/slider'

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

function getDefaultConfig(bucketConfig: BucketConfig | undefined): BucketConfig {
  return {
    initialCashCushion: bucketConfig?.initialCashCushion ?? 20000,
    refillThreshold: bucketConfig?.refillThreshold ?? 5000,
    refillPercentage: bucketConfig?.refillPercentage ?? 0.5,
    baseWithdrawalRate: bucketConfig?.baseWithdrawalRate ?? 0.04,
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

export function BucketStrategyConfigurationForm({
  bucketConfig,
  onBucketConfigChange,
}: BucketStrategyConfigurationFormProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Drei-Eimer-Strategie Konfiguration</Label>

      <div className="space-y-2">
        <Label>Anfängliches Cash-Polster (€)</Label>
        <Input
          type="number"
          value={bucketConfig?.initialCashCushion ?? 20000}
          onChange={createNumberInputHandler(bucketConfig, onBucketConfigChange, 'initialCashCushion', 20000)}
        />
        <p className="text-sm text-gray-600">
          Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen
        </p>
      </div>

      <div className="space-y-2">
        <Label>Basis-Entnahmerate (%)</Label>
        <div className="px-3">
          <Slider
            value={[bucketConfig?.baseWithdrawalRate
              ? bucketConfig.baseWithdrawalRate * 100 : 4]}
            onValueChange={createSliderHandler(bucketConfig, onBucketConfigChange, 'baseWithdrawalRate', 100)}
            max={10}
            min={1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1%</span>
            <span className="font-medium text-gray-900">
              {bucketConfig?.baseWithdrawalRate ? (bucketConfig.baseWithdrawalRate * 100).toFixed(1) : '4.0'}
              %
            </span>
            <span>10%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Auffüll-Schwellenwert (€)</Label>
        <Input
          type="number"
          value={bucketConfig?.refillThreshold ?? 5000}
          onChange={createNumberInputHandler(bucketConfig, onBucketConfigChange, 'refillThreshold', 5000)}
        />
        <p className="text-sm text-gray-600">
          Überschreiten die jährlichen Gewinne diesen Betrag, wird Cash-Polster aufgefüllt
        </p>
      </div>

      <div className="space-y-2">
        <Label>Auffüll-Anteil (%)</Label>
        <div className="px-3">
          <Slider
            value={[bucketConfig?.refillPercentage
              ? bucketConfig.refillPercentage * 100 : 50]}
            onValueChange={createSliderHandler(bucketConfig, onBucketConfigChange, 'refillPercentage', 100)}
            max={100}
            min={10}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>10%</span>
            <span className="font-medium text-gray-900">
              {bucketConfig?.refillPercentage ? (bucketConfig.refillPercentage * 100).toFixed(0) : '50'}
              %
            </span>
            <span>100%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Anteil der Überschussgewinne, der ins Cash-Polster verschoben wird
        </p>
      </div>
    </div>
  )
}
