import { Card } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { LifeExpectancyCalculationHeader } from './LifeExpectancyCalculationHeader'
import { LifeExpectancyCalculationContent } from './LifeExpectancyCalculationContent'

interface LifeExpectancyCalculationProps {
  config: {
    startOfIndependence: number
    globalEndOfLife: number
    useAutomaticCalculation: boolean
    planningMode: 'individual' | 'couple'
    birthYear: number | undefined
    expectedLifespan: number | undefined
    gender: 'male' | 'female' | undefined
    spouse: { gender: 'male' | 'female'; birthYear?: number } | undefined
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

export function LifeExpectancyCalculation({ config, onChange }: LifeExpectancyCalculationProps) {
  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <LifeExpectancyCalculationHeader />
        <CollapsibleContent>
          <LifeExpectancyCalculationContent config={config} onChange={onChange} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
