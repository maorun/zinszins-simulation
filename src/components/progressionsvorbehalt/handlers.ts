import {
  type ProgressionsvorbehaltConfig,
  DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
} from '../../../helpers/progressionsvorbehalt'
import type { ExampleScenario } from './scenarios'

export function createHandlers(
  config: ProgressionsvorbehaltConfig,
  onChange: (config: ProgressionsvorbehaltConfig) => void,
) {
  return {
    handleAddYear: (year: number, income: number) => {
      onChange({
        ...config,
        progressionRelevantIncomePerYear: { ...config.progressionRelevantIncomePerYear, [year]: income },
      })
    },
    handleRemoveYear: (year: number) => {
      const { [year]: _, ...rest } = config.progressionRelevantIncomePerYear
      onChange({ ...config, progressionRelevantIncomePerYear: rest })
    },
    handleUpdateIncome: (year: number, income: number) => {
      onChange({
        ...config,
        progressionRelevantIncomePerYear: { ...config.progressionRelevantIncomePerYear, [year]: Math.max(0, income) },
      })
    },
    handleApplyScenario: (scenario: ExampleScenario) => {
      const currentYear = new Date().getFullYear()
      onChange({
        ...config,
        enabled: true,
        progressionRelevantIncomePerYear: {
          ...config.progressionRelevantIncomePerYear,
          [currentYear]: scenario.yearlyIncome,
        },
      })
    },
    handleReset: () => onChange(DEFAULT_PROGRESSIONSVORBEHALT_CONFIG),
  }
}
