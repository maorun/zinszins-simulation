import React from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { GlobalPlanningCardHeader } from './GlobalPlanningCardHeader'
import { GlobalPlanningContentSections } from './GlobalPlanningContentSections'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { CareCostConfiguration as CareCostConfig } from '../../helpers/care-cost-simulation'
import type { TermLifeInsuranceConfig } from '../../helpers/term-life-insurance'

type PlanningMode = 'individual' | 'couple'
type Gender = 'male' | 'female'
type SpouseConfig = { birthYear?: number; gender: Gender; expectedLifespan?: number }
type LifeExpectancyTable = 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'

interface GlobalPlanningConfigurationContentProps {
  navigationRef: React.RefObject<HTMLDivElement | null>
  startOfIndependence: number
  // Planning mode
  planningMode: PlanningMode
  setPlanningMode: (mode: PlanningMode) => void
  // Gender
  gender: Gender | undefined
  setGender: (gender: Gender | undefined) => void
  // Spouse
  spouse: SpouseConfig | undefined
  setSpouse: (spouse: SpouseConfig | undefined) => void
  // Birth year
  birthYear: number | undefined
  setBirthYear: (year: number | undefined) => void
  // Expected lifespan
  expectedLifespan: number | undefined
  setExpectedLifespan: (lifespan: number | undefined) => void
  // End of life
  globalEndOfLife: number
  setEndOfLife: (year: number) => void
  // Automatic calculation
  useAutomaticCalculation: boolean
  setUseAutomaticCalculation: (value: boolean) => void
  // Life expectancy table
  lifeExpectancyTable: LifeExpectancyTable
  setLifeExpectancyTable: (table: LifeExpectancyTable) => void
  // Custom life expectancy
  customLifeExpectancy: number | undefined
  setCustomLifeExpectancy: (value: number | undefined) => void
  // Statutory pension
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
  // Care costs
  careCostConfiguration: CareCostConfig
  setCareCostConfiguration: (config: CareCostConfig) => void
  // Term life insurance
  termLifeInsuranceConfig: TermLifeInsuranceConfig | null
  setTermLifeInsuranceConfig: (config: TermLifeInsuranceConfig | null) => void
}

/**
 * Presentation component for the global planning configuration.
 * Renders the collapsible card with all configuration sections.
 */
export function GlobalPlanningConfigurationContent({
  navigationRef,
  ...contentProps
}: GlobalPlanningConfigurationContentProps) {
  return (
    <Card className="mb-6" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <GlobalPlanningCardHeader />
        <CollapsibleContent>
          <CardContent>
            <GlobalPlanningContentSections {...contentProps} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
