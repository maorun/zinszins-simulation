import { useMemo, useState } from 'react'
import { Card, CardContent } from './ui/card'
import {
  type PropertyFinancingConfig,
  createDefaultPropertyFinancingConfig,
  createStandardLeverageScenarios,
  compareLeverageScenarios,
} from '../../helpers/immobilien-leverage'
import { CollapsedLeverageCard } from './immobilien-leverage/CollapsedLeverageCard'
import { ExpandedHeader } from './immobilien-leverage/ExpandedHeader'
import { PropertyConfiguration } from './immobilien-leverage/PropertyConfiguration'
import { SummaryCards } from './immobilien-leverage/SummaryCards'
import { ScenarioComparisonTable } from './immobilien-leverage/ScenarioComparisonTable'
import { ScenarioDetailCard } from './immobilien-leverage/ScenarioDetailCard'
import { LeverageInfoBox } from './immobilien-leverage/LeverageInfoBox'
import { useLeverageFormIds } from './immobilien-leverage/useLeverageFormIds'

export function ImmobilienLeverageComparison() {
  const [enabled, setEnabled] = useState(false)
  const [propertyConfig, setPropertyConfig] = useState<PropertyFinancingConfig>(
    createDefaultPropertyFinancingConfig(),
  )
  const [baseInterestRate, setBaseInterestRate] = useState(3.5)
  const ids = useLeverageFormIds()

  const comparisonResults = useMemo(() => {
    if (!enabled) return null
    return compareLeverageScenarios(createStandardLeverageScenarios(baseInterestRate), propertyConfig)
  }, [enabled, propertyConfig, baseInterestRate])

  if (!enabled) {
    return <CollapsedLeverageCard enabledId={ids.enabled} enabled={enabled} onEnabledChange={setEnabled} />
  }

  return (
    <Card>
      <ExpandedHeader enabledId={ids.enabled} enabled={enabled} onEnabledChange={setEnabled} />
      <CardContent className="space-y-6">
        <PropertyConfiguration
          config={propertyConfig}
          baseInterestRate={baseInterestRate}
          ids={ids}
          onConfigChange={(key, value) => setPropertyConfig(prev => ({ ...prev, [key]: value }))}
          onBaseInterestChange={setBaseInterestRate}
        />
        {comparisonResults && (
          <div className="space-y-4">
            <SummaryCards
              recommendedScenario={comparisonResults.recommendedScenario}
              bestByReturn={comparisonResults.bestByReturn}
              bestByRisk={comparisonResults.bestByRisk}
            />
            <ScenarioComparisonTable results={comparisonResults} />
            <div className="space-y-4">
              {comparisonResults.scenarios.map((result, index) => (
                <ScenarioDetailCard key={index} result={result} />
              ))}
            </div>
            <LeverageInfoBox />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
