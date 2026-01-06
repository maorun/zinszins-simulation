/**
 * Tests for scenario storage utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadSavedScenarios,
  saveScenario,
  updateScenario,
  deleteScenario,
  getScenarioById,
  loadSavedComparisons,
  saveComparison,
  deleteComparison,
  getComparisonById,
  exportScenariosToJSON,
  importScenariosFromJSON,
} from './scenario-storage'
import { SCENARIOS_STORAGE_KEY, COMPARISONS_STORAGE_KEY } from '../types/scenario-comparison'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('scenario-storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('loadSavedScenarios', () => {
    it('should return empty array when no scenarios are stored', () => {
      const scenarios = loadSavedScenarios()
      expect(scenarios).toEqual([])
    })

    it('should return stored scenarios', () => {
      const mockScenarios = [
        {
          id: 'test-1',
          name: 'Test Scenario',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          configuration: {} as ExtendedSavedConfiguration,
        },
      ]
      localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(mockScenarios))

      const scenarios = loadSavedScenarios()
      expect(scenarios).toHaveLength(1)
      expect(scenarios[0].name).toBe('Test Scenario')
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(SCENARIOS_STORAGE_KEY, 'invalid json')
      const scenarios = loadSavedScenarios()
      expect(scenarios).toEqual([])
    })

    it('should handle non-array data gracefully', () => {
      localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify({ not: 'array' }))
      const scenarios = loadSavedScenarios()
      expect(scenarios).toEqual([])
    })
  })

  describe('saveScenario', () => {
    it('should save a new scenario', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario = saveScenario('My Scenario', config, 'Test description')

      expect(scenario.id).toBeTruthy()
      expect(scenario.name).toBe('My Scenario')
      expect(scenario.description).toBe('Test description')
      expect(scenario.configuration.rendite).toBe(5)

      const loaded = loadSavedScenarios()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].id).toBe(scenario.id)
    })

    it('should add scenario to existing list', () => {
      const config1 = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      saveScenario('Scenario 1', config1)
      saveScenario('Scenario 2', config1)

      const scenarios = loadSavedScenarios()
      expect(scenarios).toHaveLength(2)
    })
  })

  describe('updateScenario', () => {
    it('should update an existing scenario', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario = saveScenario('Original Name', config)
      const updated = updateScenario(scenario.id, { name: 'Updated Name' })

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.id).toBe(scenario.id)

      const loaded = getScenarioById(scenario.id)
      expect(loaded?.name).toBe('Updated Name')
    })

    it('should return null for non-existent scenario', () => {
      const result = updateScenario('non-existent-id', { name: 'Test' })
      expect(result).toBeNull()
    })

    it('should update updatedAt timestamp', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario = saveScenario('Test', config)
      const originalUpdatedAt = scenario.updatedAt

      // Wait a bit to ensure timestamp changes
      vi.useFakeTimers()
      vi.advanceTimersByTime(100)

      const updated = updateScenario(scenario.id, { name: 'Updated' })

      vi.useRealTimers()

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt)
    })
  })

  describe('deleteScenario', () => {
    it('should delete an existing scenario', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario = saveScenario('To Delete', config)
      expect(loadSavedScenarios()).toHaveLength(1)

      const result = deleteScenario(scenario.id)
      expect(result).toBe(true)
      expect(loadSavedScenarios()).toHaveLength(0)
    })

    it('should return false for non-existent scenario', () => {
      const result = deleteScenario('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('getScenarioById', () => {
    it('should return scenario by ID', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario = saveScenario('Test', config)
      const found = getScenarioById(scenario.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(scenario.id)
      expect(found?.name).toBe('Test')
    })

    it('should return null for non-existent ID', () => {
      const found = getScenarioById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('loadSavedComparisons', () => {
    it('should return empty array when no comparisons are stored', () => {
      const comparisons = loadSavedComparisons()
      expect(comparisons).toEqual([])
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(COMPARISONS_STORAGE_KEY, 'invalid json')
      const comparisons = loadSavedComparisons()
      expect(comparisons).toEqual([])
    })
  })

  describe('saveComparison', () => {
    it('should save a comparison with multiple scenarios', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario1 = saveScenario('Scenario 1', config)
      const scenario2 = saveScenario('Scenario 2', config)

      const comparison = saveComparison('My Comparison', [scenario1.id, scenario2.id])

      expect(comparison).not.toBeNull()
      expect(comparison?.name).toBe('My Comparison')
      expect(comparison?.scenarios).toHaveLength(2)
    })

    it('should return null if fewer than 2 scenarios', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario1 = saveScenario('Scenario 1', config)
      const comparison = saveComparison('Invalid', [scenario1.id])

      expect(comparison).toBeNull()
    })

    it('should filter out non-existent scenario IDs', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario1 = saveScenario('Scenario 1', config)
      const comparison = saveComparison('Test', [scenario1.id, 'non-existent'])

      expect(comparison).toBeNull() // Only 1 valid scenario
    })
  })

  describe('deleteComparison', () => {
    it('should delete an existing comparison', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario1 = saveScenario('S1', config)
      const scenario2 = saveScenario('S2', config)
      const comparison = saveComparison('Test', [scenario1.id, scenario2.id])

      expect(comparison).not.toBeNull()
      expect(loadSavedComparisons()).toHaveLength(1)

      const result = deleteComparison(comparison!.id)
      expect(result).toBe(true)
      expect(loadSavedComparisons()).toHaveLength(0)
    })

    it('should return false for non-existent comparison', () => {
      const result = deleteComparison('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('getComparisonById', () => {
    it('should return comparison by ID', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario1 = saveScenario('S1', config)
      const scenario2 = saveScenario('S2', config)
      const comparison = saveComparison('Test', [scenario1.id, scenario2.id])

      expect(comparison).not.toBeNull()

      const found = getComparisonById(comparison!.id)
      expect(found).not.toBeNull()
      expect(found?.id).toBe(comparison!.id)
    })

    it('should return null for non-existent ID', () => {
      const found = getComparisonById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('exportScenariosToJSON', () => {
    it('should export all scenarios', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      saveScenario('Scenario 1', config)
      saveScenario('Scenario 2', config)

      const json = exportScenariosToJSON()
      const parsed = JSON.parse(json)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(2)
    })

    it('should export specific scenarios by ID', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenario1 = saveScenario('Scenario 1', config)
      saveScenario('Scenario 2', config)

      const json = exportScenariosToJSON([scenario1.id])
      const parsed = JSON.parse(json)

      expect(parsed).toHaveLength(1)
      expect(parsed[0].name).toBe('Scenario 1')
    })
  })

  describe('importScenariosFromJSON', () => {
    it('should import scenarios from valid JSON', () => {
      const config = {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: {},
        returnMode: 'fixed' as const,
        averageReturn: 5,
        standardDeviation: 0,
        variableReturns: {},
        startEnd: [2024, 2040] as [number, number],
        sparplan: [],
        simulationAnnual: 'yearly' as const,
      }

      const scenarios = [
        {
          id: 'old-id',
          name: 'Imported Scenario',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          configuration: config,
        },
      ]

      const json = JSON.stringify(scenarios)
      const imported = importScenariosFromJSON(json)

      expect(imported).toHaveLength(1)
      expect(imported[0].name).toBe('Imported Scenario')
      expect(imported[0].id).not.toBe('old-id') // Should get new ID

      const all = loadSavedScenarios()
      expect(all).toHaveLength(1)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => importScenariosFromJSON('invalid json')).toThrow()
    })

    it('should throw error for non-array data', () => {
      expect(() => importScenariosFromJSON(JSON.stringify({ not: 'array' }))).toThrow()
    })

    it('should throw error for invalid scenario structure', () => {
      const invalid = [{ id: 'test' }] // Missing required fields
      expect(() => importScenariosFromJSON(JSON.stringify(invalid))).toThrow()
    })
  })
})
