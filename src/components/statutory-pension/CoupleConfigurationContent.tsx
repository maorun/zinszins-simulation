import type React from 'react'
import type { CoupleStatutoryPensionConfig, IndividualStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import { CouplePensionConfiguration } from './CouplePensionConfiguration'
import { IndividualModePensionConfig } from './IndividualModePensionConfig'

interface CoupleConfigurationContentProps {
  currentConfig: CoupleStatutoryPensionConfig
  planningMode: 'individual' | 'couple'
  onChange: (config: CoupleStatutoryPensionConfig) => void
  updatePersonConfig: (personId: 1 | 2, updates: Partial<IndividualStatutoryPensionConfig>) => void
  birthYear?: number
  spouseBirthYear?: number
  currentYear: number
  nestingLevel: number
  PersonConfigComponent: React.ComponentType<{
    config: IndividualStatutoryPensionConfig
    onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
    currentYear: number
    birthYear?: number
    personName: string
  }>
}

export function CoupleConfigurationContent({
  currentConfig,
  planningMode,
  onChange,
  updatePersonConfig,
  birthYear,
  spouseBirthYear,
  currentYear,
  nestingLevel,
  PersonConfigComponent,
}: CoupleConfigurationContentProps) {
  if (planningMode === 'individual') {
    return <IndividualModePensionConfig config={currentConfig} onChange={onChange} nestingLevel={nestingLevel} />
  }

  return currentConfig.couple ? (
    <CouplePensionConfiguration
      person1={currentConfig.couple.person1}
      person2={currentConfig.couple.person2}
      birthYear={birthYear}
      spouseBirthYear={spouseBirthYear}
      currentYear={currentYear}
      nestingLevel={nestingLevel}
      onPerson1Change={(updates) => updatePersonConfig(1, updates)}
      onPerson2Change={(updates) => updatePersonConfig(2, updates)}
      PersonConfigComponent={PersonConfigComponent}
    />
  ) : null
}
