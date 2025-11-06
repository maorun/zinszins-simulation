import { SliderField } from './SliderField'

interface AssetClassConfig {
  targetAllocation: number
  expectedReturn: number
  volatility: number
}

interface ConfigurationSlidersProps {
  /** Current configuration values */
  config: AssetClassConfig
  /** Callback when any configuration value changes */
  onConfigChange: (updates: Partial<AssetClassConfig>) => void
}

/**
 * Group of configuration sliders for an asset class.
 * Displays and allows editing of target allocation, expected return, and volatility.
 */
export function ConfigurationSliders({ config, onConfigChange }: ConfigurationSlidersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SliderField
        label="Zielallokation"
        value={config.targetAllocation}
        onChange={(value) => onConfigChange({ targetAllocation: value })}
        max={100}
        step={1}
      />
      <SliderField
        label="Erwartete Rendite"
        value={config.expectedReturn}
        onChange={(value) => onConfigChange({ expectedReturn: value })}
        min={-10}
        max={20}
        step={0.5}
      />
      <SliderField
        label="Volatilität"
        value={config.volatility}
        onChange={(value) => onConfigChange({ volatility: value })}
        min={0}
        max={50}
        step={1}
      />
    </div>
  )
}
