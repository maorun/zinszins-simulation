import { CoupleStatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { CareCostConfiguration } from './CareCostConfiguration'
import { TermLifeInsuranceConfiguration } from './TermLifeInsuranceConfiguration'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { CareCostConfiguration as CareCostConfig } from '../../helpers/care-cost-simulation'
import type { TermLifeInsuranceConfig } from '../../helpers/term-life-insurance'

type PlanningMode = 'individual' | 'couple'

interface AdditionalConfigSectionsProps {
  currentYear: number
  birthYear: number | undefined
  spouseBirthYear: number | undefined
  planningMode: PlanningMode
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
  careCostConfiguration: CareCostConfig
  setCareCostConfiguration: (config: CareCostConfig) => void
  termLifeInsuranceConfig: TermLifeInsuranceConfig | null
  setTermLifeInsuranceConfig: (config: TermLifeInsuranceConfig | null) => void
}

export function AdditionalConfigSections({
  currentYear,
  birthYear,
  spouseBirthYear,
  planningMode,
  coupleStatutoryPensionConfig,
  setCoupleStatutoryPensionConfig,
  careCostConfiguration,
  setCareCostConfiguration,
  termLifeInsuranceConfig,
  setTermLifeInsuranceConfig,
}: AdditionalConfigSectionsProps) {
  return (
    <>
      <div className="mb-6">
        <CoupleStatutoryPensionConfiguration
          config={coupleStatutoryPensionConfig}
          onChange={setCoupleStatutoryPensionConfig}
          currentYear={currentYear}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
          planningMode={planningMode}
        />
      </div>

      <div className="mb-6">
        <CareCostConfiguration
          values={careCostConfiguration}
          onChange={setCareCostConfiguration}
          currentYear={currentYear}
          birthYear={birthYear}
          spouseBirthYear={spouseBirthYear}
          planningMode={planningMode}
          nestingLevel={1}
        />
      </div>

      <div className="mb-6">
        <TermLifeInsuranceConfiguration
          config={termLifeInsuranceConfig}
          onChange={setTermLifeInsuranceConfig}
          currentYear={currentYear}
          birthYear={birthYear}
          planningMode={planningMode}
        />
      </div>
    </>
  )
}
