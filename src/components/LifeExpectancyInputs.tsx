import { EndOfLifeInput } from './EndOfLifeInput'
import { LifeExpectancyTableConfiguration } from './LifeExpectancyTableConfiguration'

interface LifeExpectancyInputsProps {
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
    expectedLifespan: (lifespan: number | undefined) => void
    lifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
    customLifeExpectancy: (value: number | undefined) => void
  }
}

export function LifeExpectancyInputs({
  config,
  onChange,
}: LifeExpectancyInputsProps) {
  const {
    startOfIndependence,
    globalEndOfLife,
    useAutomaticCalculation,
    planningMode,
    birthYear,
    expectedLifespan,
    gender,
    spouse,
    lifeExpectancyTable,
    customLifeExpectancy,
  } = config

  return (
    <div className="space-y-6">
      {/* End of Life Year Configuration */}
      <EndOfLifeInput
        globalEndOfLife={globalEndOfLife}
        startOfIndependence={startOfIndependence}
        useAutomaticCalculation={useAutomaticCalculation}
        onChange={onChange.endOfLife}
        automaticCalculationConfig={{
          planningMode,
          birthYear,
          expectedLifespan,
          gender,
          spouse,
        }}
        onExpectedLifespanChange={onChange.expectedLifespan}
      />

      {/* Life Expectancy Table Configuration */}
      <LifeExpectancyTableConfiguration
        config={{
          planningMode,
          gender,
          spouse,
          lifeExpectancyTable,
          customLifeExpectancy,
        }}
        onChange={{
          lifeExpectancyTable: onChange.lifeExpectancyTable,
          customLifeExpectancy: onChange.customLifeExpectancy,
        }}
      />
    </div>
  )
}
