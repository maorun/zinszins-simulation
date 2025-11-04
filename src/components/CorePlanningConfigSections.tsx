import { PlanningModeSelector } from './PlanningModeSelector'
import { GenderConfiguration } from './GenderConfiguration'
import { BirthYearConfiguration } from './BirthYearConfiguration'

type PlanningMode = 'individual' | 'couple'
type Gender = 'male' | 'female'
type SpouseConfig = { birthYear?: number, gender: Gender, expectedLifespan?: number }

interface CorePlanningConfigSectionsProps {
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
}

export function CorePlanningConfigSections(props: CorePlanningConfigSectionsProps) {
  return (
    <>
      <PlanningModeSelector
        planningMode={props.planningMode}
        onChange={props.setPlanningMode}
      />

      <GenderConfiguration
        planningMode={props.planningMode}
        gender={props.gender}
        setGender={props.setGender}
        spouse={props.spouse}
        setSpouse={props.setSpouse}
      />

      <BirthYearConfiguration
        config={{
          planningMode: props.planningMode,
          gender: props.gender,
          birthYear: props.birthYear,
          expectedLifespan: props.expectedLifespan,
          spouse: props.spouse,
        }}
        onChange={{
          birthYear: props.setBirthYear,
          expectedLifespan: props.setExpectedLifespan,
          spouse: props.setSpouse,
        }}
      />
    </>
  )
}
