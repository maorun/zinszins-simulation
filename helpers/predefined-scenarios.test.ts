import { describe, it, expect } from 'vitest'
import {
  getPredefinedScenarios,
  getScenariosByCategory,
  getScenarioById,
  getAllCategories,
  searchScenarios,
  getCategoryDisplayName,
} from './predefined-scenarios'

describe('predefined-scenarios', () => {
  describe('getPredefinedScenarios', () => {
    it('should return an array of predefined scenarios', () => {
      const scenarios = getPredefinedScenarios()
      expect(Array.isArray(scenarios)).toBe(true)
      expect(scenarios.length).toBeGreaterThan(0)
    })

    it('should return scenarios with all required fields', () => {
      const scenarios = getPredefinedScenarios()
      scenarios.forEach((scenario) => {
        expect(scenario).toHaveProperty('id')
        expect(scenario).toHaveProperty('name')
        expect(scenario).toHaveProperty('category')
        expect(scenario).toHaveProperty('description')
        expect(scenario).toHaveProperty('detailedExplanation')
        expect(scenario).toHaveProperty('targetAudience')
        expect(scenario).toHaveProperty('keyAssumptions')
        expect(scenario).toHaveProperty('configuration')
        expect(scenario).toHaveProperty('tags')

        expect(typeof scenario.id).toBe('string')
        expect(typeof scenario.name).toBe('string')
        expect(typeof scenario.category).toBe('string')
        expect(typeof scenario.description).toBe('string')
        expect(typeof scenario.detailedExplanation).toBe('string')
        expect(typeof scenario.targetAudience).toBe('string')
        expect(Array.isArray(scenario.keyAssumptions)).toBe(true)
        expect(Array.isArray(scenario.tags)).toBe(true)
        expect(typeof scenario.configuration).toBe('object')
      })
    })

    it('should have unique scenario IDs', () => {
      const scenarios = getPredefinedScenarios()
      const ids = scenarios.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid configuration for each scenario', () => {
      const scenarios = getPredefinedScenarios()
      scenarios.forEach((scenario) => {
        const config = scenario.configuration
        expect(config.rendite).toBeGreaterThan(0)
        expect(config.rendite).toBeLessThanOrEqual(15)
        expect(config.steuerlast).toBeGreaterThan(0)
        expect(config.teilfreistellungsquote).toBeGreaterThanOrEqual(0)
        expect(config.teilfreistellungsquote).toBeLessThanOrEqual(100)
        expect(Array.isArray(config.sparplan)).toBe(true)
        expect(config.sparplan.length).toBeGreaterThan(0)
      })
    })

    it('should have realistic time horizons', () => {
      const scenarios = getPredefinedScenarios()
      scenarios.forEach((scenario) => {
        const [start, end] = scenario.configuration.startEnd
        const duration = end - start
        expect(duration).toBeGreaterThan(0)
        expect(duration).toBeLessThanOrEqual(50) // Maximum 50 years
      })
    })
  })

  describe('getScenariosByCategory', () => {
    it('should return scenarios for career-start category', () => {
      const scenarios = getScenariosByCategory('career-start')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach((s) => {
        expect(s.category).toBe('career-start')
      })
    })

    it('should return scenarios for family category', () => {
      const scenarios = getScenariosByCategory('family')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach((s) => {
        expect(s.category).toBe('family')
      })
    })

    it('should return scenarios for mid-career category', () => {
      const scenarios = getScenariosByCategory('mid-career')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach((s) => {
        expect(s.category).toBe('mid-career')
      })
    })

    it('should return scenarios for pre-retirement category', () => {
      const scenarios = getScenariosByCategory('pre-retirement')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach((s) => {
        expect(s.category).toBe('pre-retirement')
      })
    })

    it('should return scenarios for wealth-building category', () => {
      const scenarios = getScenariosByCategory('wealth-building')
      expect(scenarios.length).toBeGreaterThan(0)
      scenarios.forEach((s) => {
        expect(s.category).toBe('wealth-building')
      })
    })

    it('should return empty array for non-existent category', () => {
      const scenarios = getScenariosByCategory('non-existent' as any)
      expect(scenarios).toEqual([])
    })
  })

  describe('getScenarioById', () => {
    it('should return scenario by valid ID', () => {
      const allScenarios = getPredefinedScenarios()
      const firstScenario = allScenarios[0]
      const found = getScenarioById(firstScenario.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(firstScenario.id)
    })

    it('should return undefined for invalid ID', () => {
      const found = getScenarioById('non-existent-id')
      expect(found).toBeUndefined()
    })

    it('should return correct scenario for career-starter-conservative', () => {
      const scenario = getScenarioById('career-starter-conservative')
      expect(scenario).toBeDefined()
      expect(scenario?.name).toBe('Berufsanfänger - Konservativ')
      expect(scenario?.category).toBe('career-start')
    })

    it('should return correct scenario for dink scenario', () => {
      const scenario = getScenarioById('dual-income-no-kids')
      expect(scenario).toBeDefined()
      expect(scenario?.name).toBe('DINK - Doppelverdiener ohne Kinder')
      expect(scenario?.category).toBe('mid-career')
    })
  })

  describe('getAllCategories', () => {
    it('should return all category types', () => {
      const categories = getAllCategories()
      expect(categories).toContain('career-start')
      expect(categories).toContain('family')
      expect(categories).toContain('mid-career')
      expect(categories).toContain('pre-retirement')
      expect(categories).toContain('retirement')
      expect(categories).toContain('wealth-building')
    })

    it('should return correct number of categories', () => {
      const categories = getAllCategories()
      expect(categories.length).toBe(6)
    })
  })

  describe('searchScenarios', () => {
    it('should find scenarios by name', () => {
      const results = searchScenarios('Berufsanfänger')
      expect(results.length).toBeGreaterThan(0)
      results.forEach((s) => {
        expect(s.name.toLowerCase()).toContain('berufsanfänger')
      })
    })

    it('should find scenarios by description keywords', () => {
      const results = searchScenarios('Familie')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find scenarios by tags', () => {
      const results = searchScenarios('konservativ')
      expect(results.length).toBeGreaterThan(0)
      results.forEach((s) => {
        const hasTag = s.tags.some((tag) => tag.toLowerCase().includes('konservativ'))
        const hasInName = s.name.toLowerCase().includes('konservativ')
        expect(hasTag || hasInName).toBe(true)
      })
    })

    it('should be case-insensitive', () => {
      const lower = searchScenarios('berufsanfänger')
      const upper = searchScenarios('BERUFSANFÄNGER')
      const mixed = searchScenarios('BeRuFsAnFäNgEr')
      expect(lower.length).toBeGreaterThan(0)
      expect(lower.length).toBe(upper.length)
      expect(lower.length).toBe(mixed.length)
    })

    it('should return empty array for non-matching search', () => {
      const results = searchScenarios('xyzabc123nonexistent')
      expect(results).toEqual([])
    })

    it('should find DINK scenario by keyword', () => {
      const results = searchScenarios('DINK')
      expect(results.length).toBeGreaterThan(0)
      const dinkScenario = results.find((s) => s.id === 'dual-income-no-kids')
      expect(dinkScenario).toBeDefined()
    })

    it('should find scenarios by target audience keywords', () => {
      const results = searchScenarios('Doppelverdiener')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('getCategoryDisplayName', () => {
    it('should return correct German name for career-start', () => {
      expect(getCategoryDisplayName('career-start')).toBe('Berufsanfänger')
    })

    it('should return correct German name for family', () => {
      expect(getCategoryDisplayName('family')).toBe('Familie')
    })

    it('should return correct German name for mid-career', () => {
      expect(getCategoryDisplayName('mid-career')).toBe('Karrieremitte')
    })

    it('should return correct German name for pre-retirement', () => {
      expect(getCategoryDisplayName('pre-retirement')).toBe('Vor dem Ruhestand')
    })

    it('should return correct German name for retirement', () => {
      expect(getCategoryDisplayName('retirement')).toBe('Im Ruhestand')
    })

    it('should return correct German name for wealth-building', () => {
      expect(getCategoryDisplayName('wealth-building')).toBe('Vermögensaufbau')
    })
  })

  describe('Scenario Validation', () => {
    it('should have scenarios with at least 2 key assumptions', () => {
      const scenarios = getPredefinedScenarios()
      scenarios.forEach((scenario) => {
        expect(scenario.keyAssumptions.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should have scenarios with at least 1 tag', () => {
      const scenarios = getPredefinedScenarios()
      scenarios.forEach((scenario) => {
        expect(scenario.tags.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('should have non-empty descriptions', () => {
      const scenarios = getPredefinedScenarios()
      scenarios.forEach((scenario) => {
        expect(scenario.description.length).toBeGreaterThan(20)
        expect(scenario.detailedExplanation.length).toBeGreaterThan(50)
      })
    })

    it('should have at least one scenario per category', () => {
      const categories = getAllCategories()
      categories.forEach((category) => {
        const scenarios = getScenariosByCategory(category)
        // retirement category might not have scenarios yet
        if (category !== 'retirement') {
          expect(scenarios.length).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('Scenario Content Validation', () => {
    it('career-starter-conservative should have conservative configuration', () => {
      const scenario = getScenarioById('career-starter-conservative')
      expect(scenario).toBeDefined()
      expect(scenario!.configuration.rendite).toBeLessThanOrEqual(6)
      expect(scenario!.configuration.returnMode).toBe('fixed')
    })

    it('career-starter-aggressive should have aggressive configuration', () => {
      const scenario = getScenarioById('career-starter-aggressive')
      expect(scenario).toBeDefined()
      expect(scenario!.configuration.rendite).toBeGreaterThanOrEqual(6)
      expect(scenario!.configuration.standardDeviation).toBeGreaterThanOrEqual(15)
      expect(scenario!.configuration.returnMode).toBe('random')
    })

    it('young-family scenario should have moderate savings rate', () => {
      const scenario = getScenarioById('young-family')
      expect(scenario).toBeDefined()
      // Find the regular savings plan (not the one-time payment)
      const sparplan = scenario!.configuration.sparplan.find((s) => s.end !== null)
      expect(sparplan).toBeDefined()
      expect(sparplan!.einzahlung).toBeLessThanOrEqual(6000) // Family budget constraints (annual amount)
    })

    it('dual-income-no-kids should have high savings rate', () => {
      const scenario = getScenarioById('dual-income-no-kids')
      expect(scenario).toBeDefined()
      // Find the regular savings plan (not the one-time payment)
      const sparplan = scenario!.configuration.sparplan.find((s) => s.end !== null)
      expect(sparplan).toBeDefined()
      expect(sparplan!.einzahlung).toBeGreaterThanOrEqual(12000) // High dual income (annual amount)
    })

    it('pre-retirement-conservative should have low volatility', () => {
      const scenario = getScenarioById('pre-retirement-conservative')
      expect(scenario).toBeDefined()
      expect(scenario!.configuration.standardDeviation).toBeLessThanOrEqual(10)
      expect(scenario!.configuration.rendite).toBeLessThanOrEqual(5)
    })

    it('inheritance-management should have large lump sum', () => {
      const scenario = getScenarioById('inheritance-management')
      expect(scenario).toBeDefined()
      // Find the one-time payment (no end date)
      const einmalzahlung = scenario!.configuration.sparplan.find((s) => s.end === null)
      expect(einmalzahlung).toBeDefined()
      expect(einmalzahlung!.einzahlung).toBeGreaterThanOrEqual(100000)
    })

    it('entrepreneur-exit should have very large lump sum', () => {
      const scenario = getScenarioById('entrepreneur-exit')
      expect(scenario).toBeDefined()
      // Find the one-time payment (no end date)
      const einmalzahlung = scenario!.configuration.sparplan.find((s) => s.end === null)
      expect(einmalzahlung).toBeDefined()
      expect(einmalzahlung!.einzahlung).toBeGreaterThanOrEqual(300000)
    })
  })

  describe('Scenario Coverage', () => {
    it('should have at least 8 scenarios total', () => {
      const scenarios = getPredefinedScenarios()
      expect(scenarios.length).toBeGreaterThanOrEqual(8)
    })

    it('should cover different income levels', () => {
      const scenarios = getPredefinedScenarios()
      // Find scenarios with regular savings plans (end date is not null)
      const lowIncome = scenarios.some((s) => {
        const sparplan = s.configuration.sparplan.find((sp) => sp.end !== null)
        return sparplan && sparplan.einzahlung <= 3600 // 300€/month * 12
      })
      const highIncome = scenarios.some((s) => {
        const sparplan = s.configuration.sparplan.find((sp) => sp.end !== null)
        return sparplan && sparplan.einzahlung >= 12000 // 1000€/month * 12
      })
      expect(lowIncome).toBe(true)
      expect(highIncome).toBe(true)
    })

    it('should cover different risk profiles', () => {
      const scenarios = getPredefinedScenarios()
      const conservative = scenarios.some((s) => s.configuration.rendite <= 5)
      const aggressive = scenarios.some((s) => s.configuration.rendite >= 7)
      expect(conservative).toBe(true)
      expect(aggressive).toBe(true)
    })

    it('should cover different time horizons', () => {
      const scenarios = getPredefinedScenarios()
      const short = scenarios.some((s) => {
        const [start, end] = s.configuration.startEnd
        return end - start <= 15
      })
      const long = scenarios.some((s) => {
        const [start, end] = s.configuration.startEnd
        return end - start >= 30
      })
      expect(short).toBe(true)
      expect(long).toBe(true)
    })
  })
})
