import { CorePlanningConfigSections } from './CorePlanningConfigSections'
import { LifeExpectancyCalculation } from './LifeExpectancyCalculation'
import { AdditionalConfigSections } from './AdditionalConfigSections'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { CareCostConfiguration as CareCostConfig } from '../../helpers/care-cost-simulation'

type PlanningMode = 'individual' | 'couple'
type Gender = 'male' | 'female'
type SpouseConfig = { birthYear?: number, gender: Gender, expectedLifespan?: number }
type LifeExpectancyTable = 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'

interface GlobalPlanningContentSectionsProps {
  startOfIndependence: number
  planningMode: PlanningMode
  setPlanningMode: (mode: PlanningMode) => void
  gender: Gender | undefined
  setGender: (gender: Gender | undefined) => void
  spouse: SpouseConfig | undefined
  setSpouse: (spouse: SpouseConfig | undefined) => void
  birthYear: number | undefined
  setBirthYear: (year: number | undefined) => void
  expectedLifespan: number | undefined
  setExpectedLifespan: (lifespan: number | undefined) => void
  globalEndOfLife: number
  setEndOfLife: (year: number) => void
  useAutomaticCalculation: boolean
  setUseAutomaticCalculation: (value: boolean) => void
  lifeExpectancyTable: LifeExpectancyTable
  setLifeExpectancyTable: (table: LifeExpectancyTable) => void
  customLifeExpectancy: number | undefined
  setCustomLifeExpectancy: (value: number | undefined) => void
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
  careCostConfiguration: CareCostConfig
  setCareCostConfiguration: (config: CareCostConfig) => void
}

export function GlobalPlanningContentSections(props: GlobalPlanningContentSectionsProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <CorePlanningConfigSections
        planningMode={props.planningMode}
        setPlanningMode={props.setPlanningMode}
        gender={props.gender}
        setGender={props.setGender}
        spouse={props.spouse}
        setSpouse={props.setSpouse}
        birthYear={props.birthYear}
        setBirthYear={props.setBirthYear}
        expectedLifespan={props.expectedLifespan}
        setExpectedLifespan={props.setExpectedLifespan}
      />

      <LifeExpectancyCalculation
        config={{
          startOfIndependence: props.startOfIndependence,
          globalEndOfLife: props.globalEndOfLife,
          useAutomaticCalculation: props.useAutomaticCalculation,
          planningMode: props.planningMode,
          birthYear: props.birthYear,
          expectedLifespan: props.expectedLifespan,
          gender: props.gender,
          spouse: props.spouse,
          lifeExpectancyTable: props.lifeExpectancyTable,
          customLifeExpectancy: props.customLifeExpectancy,
        }}
        onChange={{
          endOfLife: props.setEndOfLife,
          useAutomaticCalculation: props.setUseAutomaticCalculation,
          expectedLifespan: props.setExpectedLifespan,
          lifeExpectancyTable: props.setLifeExpectancyTable,
          customLifeExpectancy: props.setCustomLifeExpectancy,
        }}
      />

      <AdditionalConfigSections
        currentYear={currentYear}
        birthYear={props.birthYear}
        spouseBirthYear={props.spouse?.birthYear}
        planningMode={props.planningMode}
        coupleStatutoryPensionConfig={props.coupleStatutoryPensionConfig}
        setCoupleStatutoryPensionConfig={props.setCoupleStatutoryPensionConfig}
        careCostConfiguration={props.careCostConfiguration}
        setCareCostConfiguration={props.setCareCostConfiguration}
      />
    </div>
  )
}
