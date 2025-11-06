import { useMemo } from 'react'
import {
  runSensitivityAnalysis,
  getMostImpactfulParameters,
  SENSITIVITY_PARAMETERS,
  type SensitivityAnalysisConfig,
  type SensitivityResult,
} from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'

interface AnalysisResults {
  results: Map<string, SensitivityResult[]>
  baseResults: Map<string, SensitivityResult>
}

export function useSensitivityAnalysis(config: SensitivityAnalysisConfig, returnConfig: ReturnConfiguration) {
  // Run sensitivity analysis for all parameters
  const analysisResults = useMemo<AnalysisResults>(() => {
    const results = new Map<string, SensitivityResult[]>()
    const baseResults = new Map<string, SensitivityResult>()

    for (const [paramName, parameter] of Object.entries(SENSITIVITY_PARAMETERS)) {
      const paramResults = runSensitivityAnalysis(parameter, config, returnConfig)

      if (paramResults.length > 0) {
        results.set(paramName, paramResults)

        // Find the base result (closest to parameter's base value)
        const baseResult = paramResults.reduce((prev, curr) =>
          Math.abs(curr.parameterValue - parameter.baseValue) < Math.abs(prev.parameterValue - parameter.baseValue)
            ? curr
            : prev,
        )
        baseResults.set(paramName, baseResult)
      }
    }

    return { results, baseResults }
  }, [config, returnConfig])

  // Get parameter ranking by impact
  const parameterRanking = useMemo(() => {
    return getMostImpactfulParameters(analysisResults.results, analysisResults.baseResults)
  }, [analysisResults])

  return {
    analysisResults,
    parameterRanking,
  }
}
