import { CoupleStatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { CareCostConfiguration } from './CareCostConfiguration'
import { TermLifeInsuranceConfiguration } from './TermLifeInsuranceConfiguration'
import { CareInsuranceConfiguration } from './CareInsuranceConfiguration'
import { EMRenteConfiguration } from './EMRenteConfiguration'
import type { CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { CareCostConfiguration as CareCostConfig } from '../../helpers/care-cost-simulation'
import type { TermLifeInsuranceConfig } from '../../helpers/term-life-insurance'
import type { CareInsuranceConfig } from '../../helpers/care-insurance'
import type { EMRenteConfig } from '../../helpers/em-rente'

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
  careInsuranceConfig: CareInsuranceConfig | null
  setCareInsuranceConfig: (config: CareInsuranceConfig | null) => void
  emRenteConfig: EMRenteConfig | null
  setEMRenteConfig: (config: EMRenteConfig | null) => void
}

export function AdditionalConfigSections(props: AdditionalConfigSectionsProps) {
  const {
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
    careInsuranceConfig,
    setCareInsuranceConfig,
    emRenteConfig,
    setEMRenteConfig,
  } = props

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
        <EMRenteConfiguration
          config={emRenteConfig}
          onChange={setEMRenteConfig}
          currentYear={currentYear}
          birthYear={birthYear}
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
      <div className="mb-6">
        <CareInsuranceConfiguration
          config={careInsuranceConfig}
          onChange={setCareInsuranceConfig}
          currentYear={currentYear}
          birthYear={birthYear}
          planningMode={planningMode}
        />
      </div>
    </>
  )
}
