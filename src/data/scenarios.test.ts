import { describe, it, expect } from 'vitest'
import {
  predefinedScenarios,
  getScenarioById,
  getScenariosByCategory,
  getScenarioCategories,
  searchScenarios,
} from './scenarios'

describe('scenarios data', () => {
  describe('predefinedScenarios', () => {
    it('should contain multiple scenarios', () => {
      expect(predefinedScenarios).toBeDefined()
      expect(predefinedScenarios.length).toBeGreaterThan(0)
    })

    it('should have valid scenario structure', () => {
      predefinedScenarios.forEach(scenario => {
        expect(scenario.id).toBeDefined()
        expect(scenario.name).toBeDefined()
        expect(scenario.description).toBeDefined()
        expect(scenario.category).toBeDefined()
        expect(scenario.icon).toBeDefined()
        expect(scenario.config).toBeDefined()
        expect(scenario.learningPoints).toBeDefined()
        expect(scenario.risks).toBeDefined()
        expect(scenario.suitableFor).toBeDefined()
      })
    })

    it('should have valid config structure', () => {
      predefinedScenarios.forEach(scenario => {
        const { config } = scenario
        expect(config.startYear).toBeGreaterThan(0)
        expect(config.retirementYear).toBeGreaterThanOrEqual(config.startYear)
        expect(config.returnMode).toBeDefined()
        expect(config.expectedReturn).toBeGreaterThan(0)
        expect(config.monthlyContribution).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have educational content', () => {
      predefinedScenarios.forEach(scenario => {
        expect(scenario.learningPoints.length).toBeGreaterThan(0)
        expect(scenario.risks.length).toBeGreaterThan(0)
        expect(scenario.suitableFor.length).toBeGreaterThan(0)
      })
    })

    it('should have unique IDs', () => {
      const ids = predefinedScenarios.map(s => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('getScenarioById', () => {
    it('should return scenario by valid ID', () => {
      const firstScenario = predefinedScenarios[0]
      const found = getScenarioById(firstScenario.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(firstScenario.id)
    })

    it('should return undefined for invalid ID', () => {
      const found = getScenarioById('non-existent-id')
      expect(found).toBeUndefined()
    })
  })

  describe('getScenariosByCategory', () => {
    it('should return conservative scenarios', () => {
      const scenarios = getScenariosByCategory('conservative')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach(s => {
        expect(s.category).toBe('conservative')
      })
    })

    it('should return balanced scenarios', () => {
      const scenarios = getScenariosByCategory('balanced')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach(s => {
        expect(s.category).toBe('balanced')
      })
    })

    it('should return aggressive scenarios', () => {
      const scenarios = getScenariosByCategory('aggressive')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach(s => {
        expect(s.category).toBe('aggressive')
      })
    })

    it('should return special scenarios', () => {
      const scenarios = getScenariosByCategory('special')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach(s => {
        expect(s.category).toBe('special')
      })
    })

    it('should return empty array for unknown category', () => {
      const scenarios = getScenariosByCategory('unknown' as any)
      expect(scenarios).toEqual([])
    })
  })

  describe('getScenarioCategories', () => {
    it('should return all categories', () => {
      const categories = getScenarioCategories()
      expect(categories.length).toBe(4)
      expect(categories).toEqual([
        { id: 'conservative', name: 'Konservativ', icon: '🛡️' },
        { id: 'balanced', name: 'Ausgewogen', icon: '⚖️' },
        { id: 'aggressive', name: 'Wachstumsorientiert', icon: '🚀' },
        { id: 'special', name: 'Spezielle Situationen', icon: '⭐' },
      ])
    })
  })

  describe('searchScenarios', () => {
    it('should find scenarios by name', () => {
      const results = searchScenarios('Einsteiger')
      expect(results.length).toBeGreaterThan(0)
      const hasMatch = results.some(s => s.name.toLowerCase().includes('einsteiger'))
      expect(hasMatch).toBe(true)
    })

    it('should find scenarios by description', () => {
      const results = searchScenarios('konservativ')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find scenarios by learning points', () => {
      const results = searchScenarios('Risiko')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find scenarios by suitableFor', () => {
      const results = searchScenarios('Rentner')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should be case insensitive', () => {
      const lowerResults = searchScenarios('ruhestand')
      const upperResults = searchScenarios('RUHESTAND')
      expect(lowerResults.length).toBe(upperResults.length)
    })

    it('should return empty array for no matches', () => {
      const results = searchScenarios('xyznonexistent123')
      expect(results).toEqual([])
    })
  })

  describe('scenario categories coverage', () => {
    it('should have at least 2 scenarios per category', () => {
      const categories = getScenarioCategories()
      categories.forEach(category => {
        const scenarios = getScenariosByCategory(category.id)
        expect(scenarios.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('scenario return modes', () => {
    it('should use valid return modes', () => {
      const validModes = ['fixed', 'random', 'variable', 'historical', 'multiasset']
      predefinedScenarios.forEach(scenario => {
        expect(validModes).toContain(scenario.config.returnMode)
      })
    })

    it('should have volatility when return mode is random', () => {
      const randomScenarios = predefinedScenarios.filter(s => s.config.returnMode === 'random')
      randomScenarios.forEach(scenario => {
        expect(scenario.config.volatility).toBeGreaterThan(0)
      })
    })
  })

  describe('scenario realistic values', () => {
    it('should have reasonable return rates', () => {
      predefinedScenarios.forEach(scenario => {
        expect(scenario.config.expectedReturn).toBeGreaterThan(0)
        expect(scenario.config.expectedReturn).toBeLessThan(20) // Max 20% expected return
      })
    })

    it('should have reasonable time horizons', () => {
      predefinedScenarios.forEach(scenario => {
        const years = scenario.config.retirementYear - scenario.config.startYear
        expect(years).toBeGreaterThanOrEqual(0) // Allow 0 for immediate retirement scenarios
        expect(years).toBeLessThanOrEqual(40) // Max 40 years savings phase
      })
    })

    it('should have reasonable monthly contributions', () => {
      predefinedScenarios.forEach(scenario => {
        expect(scenario.config.monthlyContribution).toBeGreaterThanOrEqual(0)
        expect(scenario.config.monthlyContribution).toBeLessThan(10000) // Max 10k/month
      })
    })
  })
})
