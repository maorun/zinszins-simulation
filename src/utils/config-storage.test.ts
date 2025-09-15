import { describe, it, expect, beforeEach } from 'vitest'
import { saveConfiguration, loadConfiguration, clearConfiguration, hasConfiguration, type SavedConfiguration } from './config-storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => store[key] = value,
    removeItem: (key: string) => delete store[key],
    clear: () => store = {},
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('config-storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  const mockConfig: SavedConfiguration = {
    rendite: 7,
    steuerlast: 25,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2023: 2000 },
    steuerReduzierenEndkapitalSparphase: true,
    steuerReduzierenEndkapitalEntspharphase: true,
    returnMode: 'fixed',
    averageReturn: 8,
    standardDeviation: 15,
    randomSeed: 123,
    variableReturns: { 2024: 6 },
    startEnd: [2045, 2080],
    sparplan: [{
      id: 1,
      start: '2023-01-01',
      end: '2045-01-01',
      einzahlung: 12000,
    }],
    simulationAnnual: 'monthly',
    // Global End of Life and life expectancy settings
    endOfLife: 2080,
    lifeExpectancyTable: 'german_2020_22',
  }

  it('should save and load configuration correctly', () => {
    saveConfiguration(mockConfig)
    const loaded = loadConfiguration()

    expect(loaded).toEqual(mockConfig)
  })

  it('should return null when no configuration exists', () => {
    const loaded = loadConfiguration()
    expect(loaded).toBeNull()
  })

  it('should clear configuration correctly', () => {
    saveConfiguration(mockConfig)
    expect(hasConfiguration()).toBe(true)

    clearConfiguration()
    expect(hasConfiguration()).toBe(false)
    expect(loadConfiguration()).toBeNull()
  })

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = () => { 
      throw new Error('Storage full') 
    }

    // Should not throw
    expect(() => saveConfiguration(mockConfig)).not.toThrow()

    // Restore
    localStorageMock.setItem = originalSetItem
  })

  it('should handle invalid JSON gracefully', () => {
    localStorageMock.setItem('zinszins-simulation-config', 'invalid json')

    const loaded = loadConfiguration()
    expect(loaded).toBeNull()
  })

  it('should handle version mismatch gracefully', () => {
    const invalidVersionData = {
      version: 999,
      timestamp: new Date().toISOString(),
      config: mockConfig,
    }

    localStorageMock.setItem('zinszins-simulation-config', JSON.stringify(invalidVersionData))

    const loaded = loadConfiguration()
    expect(loaded).toBeNull()
  })
})
