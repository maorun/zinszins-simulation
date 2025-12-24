import { describe, it, expect } from 'vitest'
import {
  applyStressTest,
  runStressTestAnalysis,
  createCustomStressScenario,
  getStressTestDescription,
  getStressSeverity,
  getSeverityColorClass,
  HISTORICAL_STRESS_SCENARIOS,
  HYPOTHETICAL_STRESS_SCENARIOS,
  type StressScenario,
} from './stress-test'

describe('Stress Test Functionality', () => {
  describe('HISTORICAL_STRESS_SCENARIOS', () => {
    it('should have at least 5 historical scenarios', () => {
      expect(HISTORICAL_STRESS_SCENARIOS).toHaveLength(5)
    })

    it('should all be categorized as historical', () => {
      HISTORICAL_STRESS_SCENARIOS.forEach(scenario => {
        expect(scenario.category).toBe('historical')
      })
    })

    it('should all have negative market shocks', () => {
      HISTORICAL_STRESS_SCENARIOS.forEach(scenario => {
        expect(scenario.marketShock).toBeLessThan(0)
        expect(scenario.marketShock).toBeGreaterThan(-1) // Not more than 100% loss
      })
    })

    it('should have German names and descriptions', () => {
      HISTORICAL_STRESS_SCENARIOS.forEach(scenario => {
        expect(scenario.name).toBeTruthy()
        expect(scenario.description).toBeTruthy()
        expect(typeof scenario.name).toBe('string')
        expect(typeof scenario.description).toBe('string')
      })
    })

    it('should include major historical crises', () => {
      const scenarioNames = HISTORICAL_STRESS_SCENARIOS.map(s => s.name)
      expect(scenarioNames).toContain('Finanzkrise 2008')
      expect(scenarioNames).toContain('COVID-19 Crash')
      expect(scenarioNames).toContain('Dotcom-Blase')
    })

    it('should have historical references and periods', () => {
      HISTORICAL_STRESS_SCENARIOS.forEach(scenario => {
        expect(scenario.historicalReference).toBeTruthy()
        expect(scenario.historicalPeriod).toBeTruthy()
      })
    })
  })

  describe('HYPOTHETICAL_STRESS_SCENARIOS', () => {
    it('should have at least 4 hypothetical scenarios', () => {
      expect(HYPOTHETICAL_STRESS_SCENARIOS).toHaveLength(4)
    })

    it('should all be categorized as hypothetical', () => {
      HYPOTHETICAL_STRESS_SCENARIOS.forEach(scenario => {
        expect(scenario.category).toBe('hypothetical')
      })
    })

    it('should all have negative market shocks', () => {
      HYPOTHETICAL_STRESS_SCENARIOS.forEach(scenario => {
        expect(scenario.marketShock).toBeLessThan(0)
        expect(scenario.marketShock).toBeGreaterThan(-1)
      })
    })

    it('should cover different severity levels', () => {
      const shocks = HYPOTHETICAL_STRESS_SCENARIOS.map(s => Math.abs(s.marketShock))
      expect(Math.max(...shocks)).toBeGreaterThan(0.5) // At least one extreme scenario
      expect(Math.min(...shocks)).toBeLessThan(0.15) // At least one mild scenario
    })
  })

  describe('applyStressTest', () => {
    it('should calculate stressed value correctly', () => {
      const portfolioValue = 100000
      const scenario: StressScenario = {
        name: 'Test Crash',
        description: 'Test scenario',
        marketShock: -0.4, // -40%
        category: 'hypothetical',
      }

      const result = applyStressTest(portfolioValue, scenario)

      expect(result.originalValue).toBe(100000)
      expect(result.stressedValue).toBe(60000) // 100000 * 0.6
      expect(result.absoluteLoss).toBe(40000)
      expect(result.lossPercent).toBe(40)
    })

    it('should handle different portfolio values', () => {
      const scenario: StressScenario = {
        name: 'Test',
        description: 'Test',
        marketShock: -0.3,
        category: 'hypothetical',
      }

      const result1 = applyStressTest(50000, scenario)
      expect(result1.stressedValue).toBe(35000)
      expect(result1.absoluteLoss).toBe(15000)

      const result2 = applyStressTest(250000, scenario)
      expect(result2.stressedValue).toBe(175000)
      expect(result2.absoluteLoss).toBe(75000)
    })

    it('should not allow negative stressed values', () => {
      const portfolioValue = 100000
      const extremeScenario: StressScenario = {
        name: 'Total Loss',
        description: 'Extreme scenario',
        marketShock: -1.5, // More than 100% loss
        category: 'hypothetical',
      }

      const result = applyStressTest(portfolioValue, extremeScenario)

      expect(result.stressedValue).toBe(0) // Clamped to 0
      expect(result.stressedValue).toBeGreaterThanOrEqual(0)
    })

    it('should preserve scenario information', () => {
      const scenario: StressScenario = {
        name: 'Finanzkrise 2008',
        description: 'Major crisis',
        marketShock: -0.57,
        historicalReference: 'S&P 500',
        historicalPeriod: '2007-2009',
        category: 'historical',
      }

      const result = applyStressTest(100000, scenario)

      expect(result.scenario).toEqual(scenario)
      expect(result.scenario.name).toBe('Finanzkrise 2008')
      expect(result.scenario.category).toBe('historical')
    })

    it('should calculate loss percentages correctly', () => {
      const portfolioValue = 100000
      const scenarios = [
        { marketShock: -0.1, expectedLossPercent: 10 },
        { marketShock: -0.25, expectedLossPercent: 25 },
        { marketShock: -0.5, expectedLossPercent: 50 },
        { marketShock: -0.75, expectedLossPercent: 75 },
      ]

      scenarios.forEach(({ marketShock, expectedLossPercent }) => {
        const scenario: StressScenario = {
          name: 'Test',
          description: 'Test',
          marketShock,
          category: 'hypothetical',
        }
        const result = applyStressTest(portfolioValue, scenario)
        expect(result.lossPercent).toBe(expectedLossPercent)
      })
    })

    it('should handle zero portfolio value', () => {
      const scenario: StressScenario = {
        name: 'Test',
        description: 'Test',
        marketShock: -0.4,
        category: 'hypothetical',
      }

      const result = applyStressTest(0, scenario)

      expect(result.originalValue).toBe(0)
      expect(result.stressedValue).toBe(0)
      expect(result.absoluteLoss).toBe(0)
      expect(result.lossPercent).toBe(40) // Still shows the shock percentage
    })
  })

  describe('runStressTestAnalysis', () => {
    it('should run all historical scenarios by default', () => {
      const portfolioValue = 100000
      const analysis = runStressTestAnalysis(portfolioValue)

      expect(analysis.results).toHaveLength(HISTORICAL_STRESS_SCENARIOS.length)
      expect(analysis.portfolioValue).toBe(portfolioValue)
    })

    it('should identify worst-case scenario', () => {
      const portfolioValue = 100000
      const analysis = runStressTestAnalysis(portfolioValue)

      // Find the scenario with the largest loss manually
      const manualWorst = analysis.results.reduce((worst, current) => {
        return current.absoluteLoss > worst.absoluteLoss ? current : worst
      }, analysis.results[0])

      expect(analysis.worstCase).toEqual(manualWorst)
      expect(analysis.worstCase.absoluteLoss).toBeGreaterThanOrEqual(analysis.results[0].absoluteLoss)
    })

    it('should calculate average loss correctly', () => {
      const portfolioValue = 100000
      const analysis = runStressTestAnalysis(portfolioValue)

      const manualAverage = analysis.results.reduce((sum, r) => sum + r.absoluteLoss, 0) / analysis.results.length

      expect(analysis.averageLoss).toBe(manualAverage)
      expect(analysis.averageLoss).toBeGreaterThan(0)
    })

    it('should accept custom scenarios', () => {
      const portfolioValue = 100000
      const customScenarios: StressScenario[] = [
        {
          name: 'Custom 1',
          description: 'First custom',
          marketShock: -0.2,
          category: 'hypothetical',
        },
        {
          name: 'Custom 2',
          description: 'Second custom',
          marketShock: -0.5,
          category: 'hypothetical',
        },
      ]

      const analysis = runStressTestAnalysis(portfolioValue, customScenarios)

      expect(analysis.results).toHaveLength(2)
      expect(analysis.results[0].scenario.name).toBe('Custom 1')
      expect(analysis.results[1].scenario.name).toBe('Custom 2')
    })

    it('should handle hypothetical scenarios', () => {
      const portfolioValue = 100000
      const analysis = runStressTestAnalysis(portfolioValue, HYPOTHETICAL_STRESS_SCENARIOS)

      expect(analysis.results).toHaveLength(HYPOTHETICAL_STRESS_SCENARIOS.length)
      analysis.results.forEach(result => {
        expect(result.scenario.category).toBe('hypothetical')
      })
    })

    it('should produce consistent results', () => {
      const portfolioValue = 150000

      const analysis1 = runStressTestAnalysis(portfolioValue)
      const analysis2 = runStressTestAnalysis(portfolioValue)

      expect(analysis1.averageLoss).toBe(analysis2.averageLoss)
      expect(analysis1.worstCase.absoluteLoss).toBe(analysis2.worstCase.absoluteLoss)
    })

    it('should handle single scenario', () => {
      const portfolioValue = 100000
      const singleScenario: StressScenario[] = [
        {
          name: 'Only Scenario',
          description: 'Single test',
          marketShock: -0.3,
          category: 'hypothetical',
        },
      ]

      const analysis = runStressTestAnalysis(portfolioValue, singleScenario)

      expect(analysis.results).toHaveLength(1)
      expect(analysis.worstCase).toEqual(analysis.results[0])
      expect(analysis.averageLoss).toBe(analysis.results[0].absoluteLoss)
    })
  })

  describe('createCustomStressScenario', () => {
    it('should create a valid custom scenario', () => {
      const scenario = createCustomStressScenario('Mein Szenario', 'Benutzerdefiniertes Test-Szenario', -0.35)

      expect(scenario.name).toBe('Mein Szenario')
      expect(scenario.description).toBe('Benutzerdefiniertes Test-Szenario')
      expect(scenario.marketShock).toBe(-0.35)
      expect(scenario.category).toBe('hypothetical')
    })

    it('should work with different market shocks', () => {
      const scenario1 = createCustomStressScenario('Test 1', 'Description', -0.1)
      expect(scenario1.marketShock).toBe(-0.1)

      const scenario2 = createCustomStressScenario('Test 2', 'Description', -0.75)
      expect(scenario2.marketShock).toBe(-0.75)
    })

    it('should handle German characters in names', () => {
      const scenario = createCustomStressScenario('Börsenkrise in Österreich', 'Szenario für spezielle Märkte', -0.25)

      expect(scenario.name).toContain('Österreich')
      expect(scenario.description).toContain('Märkte')
    })
  })

  describe('getStressTestDescription', () => {
    it('should provide German description with currency formatting', () => {
      const scenario: StressScenario = {
        name: 'Test Crash',
        description: 'Test',
        marketShock: -0.4,
        category: 'hypothetical',
      }
      const result = applyStressTest(100000, scenario)
      const description = getStressTestDescription(result)

      expect(description).toContain('Test Crash')
      expect(description).toContain('40.000')
      expect(description).toContain('€')
      expect(description).toContain('40,0%')
      expect(description).toContain('60.000')
    })

    it('should format large numbers correctly', () => {
      const scenario: StressScenario = {
        name: 'Major Crisis',
        description: 'Large portfolio test',
        marketShock: -0.5,
        category: 'hypothetical',
      }
      const result = applyStressTest(1000000, scenario)
      const description = getStressTestDescription(result)

      expect(description).toContain('500.000')
      expect(description).toContain('50,0%')
    })

    it('should use German number formatting', () => {
      const scenario: StressScenario = {
        name: 'Test',
        description: 'Test',
        marketShock: -0.337, // Odd percentage
        category: 'hypothetical',
      }
      const result = applyStressTest(100000, scenario)
      const description = getStressTestDescription(result)

      // Should use comma for decimals
      expect(description).toContain('33,7%')
      // Should use dot for thousands
      expect(description).toContain('33.700')
    })
  })

  describe('getStressSeverity', () => {
    it('should classify severity levels correctly', () => {
      expect(getStressSeverity(5)).toBe('low')
      expect(getStressSeverity(10)).toBe('low')
      expect(getStressSeverity(14.9)).toBe('low')

      expect(getStressSeverity(15)).toBe('medium')
      expect(getStressSeverity(20)).toBe('medium')
      expect(getStressSeverity(29.9)).toBe('medium')

      expect(getStressSeverity(30)).toBe('high')
      expect(getStressSeverity(40)).toBe('high')
      expect(getStressSeverity(49.9)).toBe('high')

      expect(getStressSeverity(50)).toBe('extreme')
      expect(getStressSeverity(60)).toBe('extreme')
      expect(getStressSeverity(100)).toBe('extreme')
    })

    it('should handle boundary values', () => {
      expect(getStressSeverity(0)).toBe('low')
      expect(getStressSeverity(15)).toBe('medium')
      expect(getStressSeverity(30)).toBe('high')
      expect(getStressSeverity(50)).toBe('extreme')
    })
  })

  describe('getSeverityColorClass', () => {
    it('should return correct CSS classes', () => {
      expect(getSeverityColorClass('low')).toBe('warning-row')
      expect(getSeverityColorClass('medium')).toBe('info-row')
      expect(getSeverityColorClass('high')).toBe('danger-row')
      expect(getSeverityColorClass('extreme')).toBe('danger-row')
    })
  })

  describe('Integration Tests', () => {
    it('should handle realistic portfolio scenario', () => {
      const portfolioValue = 250000

      const analysis = runStressTestAnalysis(portfolioValue)

      // All results should be valid
      analysis.results.forEach(result => {
        expect(result.originalValue).toBe(portfolioValue)
        expect(result.stressedValue).toBeGreaterThanOrEqual(0)
        expect(result.stressedValue).toBeLessThan(portfolioValue)
        expect(result.absoluteLoss).toBeGreaterThan(0)
        expect(result.lossPercent).toBeGreaterThan(0)
      })

      // Worst case should be more severe than average
      expect(analysis.worstCase.absoluteLoss).toBeGreaterThanOrEqual(analysis.averageLoss)

      // Average should be meaningful
      expect(analysis.averageLoss).toBeGreaterThan(portfolioValue * 0.1) // At least 10%
      expect(analysis.averageLoss).toBeLessThan(portfolioValue) // Less than total
    })

    it('should work with mixed scenario types', () => {
      const portfolioValue = 100000
      const mixedScenarios = [...HISTORICAL_STRESS_SCENARIOS.slice(0, 2), ...HYPOTHETICAL_STRESS_SCENARIOS.slice(0, 2)]

      const analysis = runStressTestAnalysis(portfolioValue, mixedScenarios)

      expect(analysis.results).toHaveLength(4)

      const historicalCount = analysis.results.filter(r => r.scenario.category === 'historical').length
      const hypotheticalCount = analysis.results.filter(r => r.scenario.category === 'hypothetical').length

      expect(historicalCount).toBe(2)
      expect(hypotheticalCount).toBe(2)
    })

    it('should produce results that can be sorted by severity', () => {
      const portfolioValue = 100000
      const analysis = runStressTestAnalysis(portfolioValue)

      // Sort by loss
      const sortedResults = [...analysis.results].sort((a, b) => b.absoluteLoss - a.absoluteLoss)

      // First should be worst case
      expect(sortedResults[0].absoluteLoss).toBe(analysis.worstCase.absoluteLoss)

      // Should be in descending order
      for (let i = 1; i < sortedResults.length; i++) {
        expect(sortedResults[i - 1].absoluteLoss).toBeGreaterThanOrEqual(sortedResults[i].absoluteLoss)
      }
    })

    it('should handle stress test for withdrawal phase portfolio', () => {
      // Simulate retired person with €500k portfolio
      const portfolioValue = 500000

      const analysis = runStressTestAnalysis(portfolioValue, [
        ...HISTORICAL_STRESS_SCENARIOS,
        ...HYPOTHETICAL_STRESS_SCENARIOS,
      ])

      // Verify all scenarios tested
      expect(analysis.results).toHaveLength(9) // 5 historical + 4 hypothetical

      // Check that worst case is identified correctly
      const manualWorst = analysis.results.reduce(
        (worst, current) => (current.absoluteLoss > worst.absoluteLoss ? current : worst),
        analysis.results[0],
      )

      expect(analysis.worstCase.absoluteLoss).toBe(manualWorst.absoluteLoss)
    })
  })
})
