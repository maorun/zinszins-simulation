import { CalculationModeToggle } from './CalculationModeToggle'
import { LifeExpectancyInputs } from './LifeExpectancyInputs'

interface ConfigurationSectionsProps {
  config: {
    startOfIndependence: number
    globalEndOfLife: number
    useAutomaticCalculation: boolean
    planningMode: 'individual' | 'couple'
    birthYear: number | undefined
    expectedLifespan: number | undefined
    gender: 'male' | 'female' | undefined
    spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
    lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
    customLifeExpectancy: number | undefined
  }
  onChange: {
    endOfLife: (year: number) => void
    useAutomaticCalculation: (value: boolean) => void
    expectedLifespan: (lifespan: number | undefined) => void
    lifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
    customLifeExpectancy: (value: number | undefined) => void
  }
}

export function ConfigurationSections({
  config,
  onChange,
}: ConfigurationSectionsProps) {
  return (
    <>
      {/* Toggle between manual and automatic calculation */}
      <CalculationModeToggle
        useAutomaticCalculation={config.useAutomaticCalculation}
        onChange={onChange.useAutomaticCalculation}
      />

      <LifeExpectancyInputs config={config} onChange={onChange} />
    </>
  )
}
