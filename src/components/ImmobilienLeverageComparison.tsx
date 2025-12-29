import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Building, ChevronDown, ChevronUp } from 'lucide-react'
import {
  type PropertyFinancingConfig,
  createDefaultPropertyFinancingConfig,
  createStandardLeverageScenarios,
  compareLeverageScenarios,
  type LeverageComparisonResults,
} from '../../helpers/immobilien-leverage'
import { PropertyConfiguration } from './immobilien-leverage/PropertyConfiguration'
import { SummaryCards } from './immobilien-leverage/SummaryCards'
import { ScenarioComparisonTable } from './immobilien-leverage/ScenarioComparisonTable'
import { ScenarioDetailCard } from './immobilien-leverage/ScenarioDetailCard'
import { LeverageInfoBox } from './immobilien-leverage/LeverageInfoBox'
import { useLeverageFormIds } from './immobilien-leverage/useLeverageFormIds'

function LeverageAnalysisContent({
  comparisonResults,
  propertyConfig,
  baseInterestRate,
  ids,
  onConfigChange,
  onBaseInterestChange,
}: {
  comparisonResults: LeverageComparisonResults
  propertyConfig: PropertyFinancingConfig
  baseInterestRate: number
  ids: ReturnType<typeof useLeverageFormIds>
  onConfigChange: (key: keyof PropertyFinancingConfig, value: number) => void
  onBaseInterestChange: (value: number) => void
}) {
  return (
    <>
      <LeverageInfoBox />
      <PropertyConfiguration
        config={propertyConfig}
        baseInterestRate={baseInterestRate}
        ids={ids}
        onConfigChange={onConfigChange}
        onBaseInterestChange={onBaseInterestChange}
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
            {comparisonResults.scenarios.map((result, index: number) => (
              <ScenarioDetailCard key={index} result={result} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export function ImmobilienLeverageComparison() {
  const [isOpen, setIsOpen] = useState(false)
  const [propertyConfig, setPropertyConfig] = useState<PropertyFinancingConfig>(
    createDefaultPropertyFinancingConfig(),
  )
  const [baseInterestRate, setBaseInterestRate] = useState(3.5)
  const ids = useLeverageFormIds()

  const comparisonResults = useMemo(() => {
    return compareLeverageScenarios(createStandardLeverageScenarios(baseInterestRate), propertyConfig)
  }, [propertyConfig, baseInterestRate])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-3 sm:mb-4">
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <CardTitle>Immobilien-Leverage-Analyse</CardTitle>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
          </CollapsibleTrigger>
          <CardDescription>
            Optimale Finanzierungsstrukturen für Immobilieninvestitionen analysieren und vergleichen. Verstehen Sie den Hebeleffekt (Leverage) und dessen Auswirkungen auf Rendite und Risiko.
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            <LeverageAnalysisContent
              comparisonResults={comparisonResults}
              propertyConfig={propertyConfig}
              baseInterestRate={baseInterestRate}
              ids={ids}
              onConfigChange={(key, value) => setPropertyConfig(prev => ({ ...prev, [key]: value }))}
              onBaseInterestChange={setBaseInterestRate}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
