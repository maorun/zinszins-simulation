import type React from 'react'
import { CollapsibleCard, CollapsibleCardHeader, CollapsibleCardContent } from '../ui/collapsible-card'
import type { IndividualStatutoryPensionConfig } from '../../../helpers/statutory-pension'

interface PersonPensionConfigurationProps {
  config: IndividualStatutoryPensionConfig
  onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  currentYear: number
  birthYear?: number
  personName: string
}

interface PersonConfigurationCardProps {
  person: IndividualStatutoryPensionConfig
  personName: string
  personLabel: string
  onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  currentYear: number
  birthYear?: number
  PersonConfigComponent: React.ComponentType<PersonPensionConfigurationProps>
}

export function PersonConfigurationCard({
  person,
  personName,
  personLabel,
  onChange,
  currentYear,
  birthYear,
  PersonConfigComponent,
}: PersonConfigurationCardProps) {
  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>{personLabel}</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <PersonConfigComponent
          config={person}
          onChange={onChange}
          currentYear={currentYear}
          birthYear={birthYear}
          personName={personName}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
