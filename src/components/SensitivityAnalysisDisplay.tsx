import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'
import IntroductionSection from './IntroductionSection'
import ParameterRankingSection from './ParameterRankingSection'
import DetailedParameterAnalysis from './DetailedParameterAnalysis'
import ActionItemsSection from './ActionItemsSection'
import { useSensitivityAnalysis } from '../hooks/useSensitivityAnalysis'

interface SensitivityAnalysisDisplayProps {
  config: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  title?: string
}

const SensitivityAnalysisDisplay: React.FC<SensitivityAnalysisDisplayProps> = ({
  config,
  returnConfig,
  title = '📊 Sensitivitätsanalyse',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { analysisResults, parameterRanking } = useSensitivityAnalysis(config, returnConfig)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-6">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span>{title}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <IntroductionSection />

            {/* Parameter Ranking */}
            <ParameterRankingSection rankings={parameterRanking} />

            {/* Detailed Analysis for Each Parameter */}
            {parameterRanking.slice(0, 3).map(ranking => {
              const results = analysisResults.results.get(ranking.parameter)
              const baseResult = analysisResults.baseResults.get(ranking.parameter)

              if (!results || !baseResult) return null

              return (
                <DetailedParameterAnalysis
                  key={ranking.parameter}
                  ranking={ranking}
                  results={results}
                  baseResult={baseResult}
                />
              )
            })}

            {/* Action Items */}
            <ActionItemsSection />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default SensitivityAnalysisDisplay
