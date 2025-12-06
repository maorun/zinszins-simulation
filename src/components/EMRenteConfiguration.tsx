import { useNestingLevel } from '../lib/nesting-utils'
import { useFormId } from '../utils/unique-id'
import { createDefaultEMRenteConfig, estimatePensionPointsFromMonthlyPension, type EMRenteConfig } from '../../helpers/em-rente'
import { EMRenteDisabledState } from './EMRenteConfiguration/EMRenteDisabledState'
import { EMRenteEnabledState } from './EMRenteConfiguration/EMRenteEnabledState'

interface EMRenteConfigurationProps {
  config: EMRenteConfig | null
  onChange: (config: EMRenteConfig | null) => void
  currentYear?: number
  birthYear?: number
}

export function EMRenteConfiguration({ config, onChange, currentYear = new Date().getFullYear(), birthYear }: EMRenteConfigurationProps) {
  const nestingLevel = useNestingLevel()
  const enabledSwitchId = useFormId('em-rente', 'enabled')
  const disabilityStartYearId = useFormId('em-rente', 'disability-start-year')
  const birthYearId = useFormId('em-rente', 'birth-year')
  const pensionPointsId = useFormId('em-rente', 'pension-points')
  const contributionYearsId = useFormId('em-rente', 'contribution-years')
  const estimateMonthlyPensionId = useFormId('em-rente', 'estimate-monthly-pension')
  const annualIncreaseRateId = useFormId('em-rente', 'annual-increase-rate')
  const taxablePercentageId = useFormId('em-rente', 'taxable-percentage')
  const monthlyAdditionalIncomeId = useFormId('em-rente', 'monthly-additional-income')
  const zurechnungszeitenSwitchId = useFormId('em-rente', 'zurechnungszeiten')
  const abschlaegeSwitchId = useFormId('em-rente', 'abschlaege')
  const currentConfig = config || createDefaultEMRenteConfig()
  const handleToggleEnabled = (enabled: boolean) => {
    if (!enabled) return onChange(null)
    const newConfig = createDefaultEMRenteConfig()
    newConfig.enabled = true
    if (birthYear) newConfig.birthYear = birthYear
    newConfig.disabilityStartYear = currentYear
    onChange(newConfig)
  }
  const handleUpdate = (updates: Partial<EMRenteConfig>) => onChange({ ...currentConfig, ...updates })
  const handleEstimateFromMonthlyPension = (monthlyPension: number) => {
    if (monthlyPension > 0) {
      const estimatedPoints = estimatePensionPointsFromMonthlyPension(monthlyPension, currentConfig.region, currentConfig.type, currentConfig.customPensionValue)
      handleUpdate({ accumulatedPensionPoints: Math.round(estimatedPoints * 100) / 100 })
    }
  }
  if (!config?.enabled) return <EMRenteDisabledState nestingLevel={nestingLevel} enabledSwitchId={enabledSwitchId} onToggle={handleToggleEnabled} />
  return <EMRenteEnabledState nestingLevel={nestingLevel} enabledSwitchId={enabledSwitchId} currentConfig={currentConfig} currentYear={currentYear} disabilityStartYearId={disabilityStartYearId} birthYearId={birthYearId} pensionPointsId={pensionPointsId} contributionYearsId={contributionYearsId} estimateMonthlyPensionId={estimateMonthlyPensionId} annualIncreaseRateId={annualIncreaseRateId} taxablePercentageId={taxablePercentageId} monthlyAdditionalIncomeId={monthlyAdditionalIncomeId} zurechnungszeitenSwitchId={zurechnungszeitenSwitchId} abschlaegeSwitchId={abschlaegeSwitchId} onToggle={handleToggleEnabled} onUpdate={handleUpdate} onEstimate={handleEstimateFromMonthlyPension} />
}

