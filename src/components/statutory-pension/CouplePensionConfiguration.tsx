import type { ComponentType } from 'react'
import type { IndividualStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import { CoupleOverviewSummary } from './CoupleOverviewSummary'
import { PersonConfigurationCard } from './PersonConfigurationCard'

interface CouplePensionConfigurationProps {
  person1: IndividualStatutoryPensionConfig
  person2: IndividualStatutoryPensionConfig
  birthYear?: number
  spouseBirthYear?: number
  currentYear: number
  nestingLevel: number
  onPerson1Change: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  onPerson2Change: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  PersonConfigComponent: ComponentType<{
    config: IndividualStatutoryPensionConfig
    onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
    currentYear: number
    birthYear?: number
    personName: string
  }>
}

export function CouplePensionConfiguration({
  person1,
  person2,
  birthYear,
  spouseBirthYear,
  currentYear,
  nestingLevel,
  onPerson1Change,
  onPerson2Change,
  PersonConfigComponent,
}: CouplePensionConfigurationProps) {
  return (
    <div className="space-y-4">
      <CoupleOverviewSummary
        person1={person1}
        person2={person2}
        birthYear={birthYear}
        spouseBirthYear={spouseBirthYear}
        nestingLevel={nestingLevel}
      />

      <PersonConfigurationCard
        person={person1}
        personName="Person 1"
        personLabel="👤 Person 1 - Rentenplanung"
        onChange={onPerson1Change}
        currentYear={currentYear}
        birthYear={birthYear}
        PersonConfigComponent={PersonConfigComponent}
      />

      <PersonConfigurationCard
        person={person2}
        personName="Person 2"
        personLabel="👤 Person 2 - Rentenplanung"
        onChange={onPerson2Change}
        currentYear={currentYear}
        birthYear={spouseBirthYear}
        PersonConfigComponent={PersonConfigComponent}
      />
    </div>
  )
}
