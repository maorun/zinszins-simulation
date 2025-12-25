import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { EMRenteInfoCard } from './EMRenteInfoCard'
import { EMRenteMainConfiguration } from './EMRenteMainConfiguration'
import { EMRenteEstimationCard } from './EMRenteEstimationCard'
import { EMRenteAdditionalSettings } from './EMRenteAdditionalSettings'
import type { EMRenteConfig } from '../../../helpers/em-rente'

interface EMRenteEnabledStateProps {
  nestingLevel: number
  enabledSwitchId: string
  currentConfig: EMRenteConfig
  currentYear: number
  disabilityStartYearId: string
  birthYearId: string
  pensionPointsId: string
  contributionYearsId: string
  estimateMonthlyPensionId: string
  annualIncreaseRateId: string
  taxablePercentageId: string
  monthlyAdditionalIncomeId: string
  zurechnungszeitenSwitchId: string
  abschlaegeSwitchId: string
  onToggle: (enabled: boolean) => void
  onUpdate: (updates: Partial<EMRenteConfig>) => void
  onEstimate: (monthlyPension: number) => void
}

export function EMRenteEnabledState(props: EMRenteEnabledStateProps) {
  const { nestingLevel, enabledSwitchId, currentConfig, currentYear, disabilityStartYearId, birthYearId, pensionPointsId, contributionYearsId, estimateMonthlyPensionId, annualIncreaseRateId, taxablePercentageId, monthlyAdditionalIncomeId, zurechnungszeitenSwitchId, abschlaegeSwitchId, onToggle, onUpdate, onEstimate } = props

  return (
    <Card nestingLevel={nestingLevel}>
      <CardHeader nestingLevel={nestingLevel} className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">EM-Rente (Erwerbsminderungsrente)</span>
          <Switch checked={true} onCheckedChange={onToggle} id={enabledSwitchId} />
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-6">
          <EMRenteInfoCard nestingLevel={nestingLevel} />
          <EMRenteMainConfiguration config={currentConfig} onUpdate={onUpdate} currentYear={currentYear} disabilityStartYearId={disabilityStartYearId} birthYearId={birthYearId} pensionPointsId={pensionPointsId} contributionYearsId={contributionYearsId} />
          <EMRenteEstimationCard nestingLevel={nestingLevel} estimateMonthlyPensionId={estimateMonthlyPensionId} onEstimate={onEstimate} />
          <EMRenteAdditionalSettings config={currentConfig} onUpdate={onUpdate} annualIncreaseRateId={annualIncreaseRateId} taxablePercentageId={taxablePercentageId} monthlyAdditionalIncomeId={monthlyAdditionalIncomeId} zurechnungszeitenSwitchId={zurechnungszeitenSwitchId} abschlaegeSwitchId={abschlaegeSwitchId} />
        </div>
      </CardContent>
    </Card>
  )
}
