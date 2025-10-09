import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateMultiAssetReturns,
  simulateMultiAssetPortfolio,
  calculateEquivalentSingleAssetReturn,
} from './multi-asset-calculations'
import { createDefaultMultiAssetConfig, type MultiAssetPortfolioConfig } from './multi-asset-portfolio'

// Mock the random number generator for consistent tests
const mockRandom = vi.fn()
vi.stubGlobal('Math', {
  ...Math,
  random: mockRandom,
})

describe.skip('multi-asset-calculations', () => {
  let defaultConfig: MultiAssetPortfolioConfig

  beforeEach(() => {
    defaultConfig = createDefaultMultiAssetConfig()
    defaultConfig.enabled = true
    vi.clearAllMocks()

    // Default to 0.5 for predictable testing
    mockRandom.mockReturnValue(0.5)
  })

  describe('generateMultiAssetReturns', () => {
    it('generates returns for all specified years', () => {
      const years = [2023, 2024, 2025]
      const returns = generateMultiAssetReturns(years, defaultConfig)

      expect(Object.keys(returns)).toHaveLength(3)
      expect(returns[2023]).toBeDefined()
      expect(returns[2024]).toBeDefined()
      expect(returns[2025]).toBeDefined()
    })

    it('returns consistent results with the same seed', () => {
      const years = [2023, 2024]
      const configWithSeed = { ...defaultConfig, simulation: { ...defaultConfig.simulation, seed: 12345 } }

      const returns1 = generateMultiAssetReturns(years, configWithSeed)
      const returns2 = generateMultiAssetReturns(years, configWithSeed)

      expect(returns1).toEqual(returns2)
    })

    it('generates reasonable return values', () => {
      const years = [2023]
      const returns = generateMultiAssetReturns(years, defaultConfig)

      // Returns should be within reasonable bounds (-80% to +200%)
      expect(returns[2023]).toBeGreaterThan(-0.8)
      expect(returns[2023]).toBeLessThan(2.0)
    })

    it('handles empty years array', () => {
      const returns = generateMultiAssetReturns([], defaultConfig)

      expect(returns).toEqual({})
    })

    it('handles disabled portfolio', () => {
      const disabledConfig = { ...defaultConfig, enabled: false }
      const years = [2023]
      const returns = generateMultiAssetReturns(years, disabledConfig)

      // Should return fallback returns (5%)
      expect(returns[2023]).toBe(0.05)
    })
  })

  describe('calculateEquivalentSingleAssetReturn', () => {
    it('calculates equivalent single asset return correctly', () => {
      const equivalentReturn = calculateEquivalentSingleAssetReturn(defaultConfig, 2023)

      expect(typeof equivalentReturn).toBe('number')
      expect(equivalentReturn).toBeGreaterThan(-1) // Should be greater than -100%
      expect(equivalentReturn).toBeLessThan(2) // Should be less than 200%
    })

    it('handles single year correctly', () => {
      const equivalentReturn = calculateEquivalentSingleAssetReturn(defaultConfig, 2023, 12345)

      expect(typeof equivalentReturn).toBe('number')
    })

    it('handles different seeds', () => {
      const equivalentReturn = calculateEquivalentSingleAssetReturn(defaultConfig, 2024, 54321)

      expect(typeof equivalentReturn).toBe('number')
    })
  })

  describe('simulateMultiAssetPortfolio', () => {
    it('simulates portfolio over multiple years', () => {
      const years = [2023, 2024, 2025]
      const contributions = { 2023: 1000, 2024: 1000, 2025: 1000 }

      const result = simulateMultiAssetPortfolio(defaultConfig, years, contributions)

      expect(result.yearResults).toBeDefined()
      expect(Object.keys(result.yearResults)).toHaveLength(3)
    })

    it('tracks portfolio value growth over time', () => {
      const years = [2023, 2024, 2025]
      const contributions = { 2023: 1000, 2024: 1000, 2025: 1000 }

      const result = simulateMultiAssetPortfolio(defaultConfig, years, contributions)

      // Portfolio value should generally be positive
      const firstYear = result.yearResults[2023]
      const lastYear = result.yearResults[2025]

      expect(firstYear).toBeDefined()
      expect(lastYear).toBeDefined()
      expect(firstYear.endHoldings.totalValue).toBeGreaterThan(0)
      expect(lastYear.endHoldings.totalValue).toBeGreaterThan(0)
    })

    it('handles single year simulation', () => {
      const years = [2023]
      const contributions = { 2023: 10000 }

      const result = simulateMultiAssetPortfolio(defaultConfig, years, contributions)

      expect(result.yearResults[2023]).toBeDefined()
      expect(result.yearResults[2023].endHoldings.totalValue).toBeGreaterThan(0)
    })

    it('handles zero contributions', () => {
      const years = [2023, 2024]
      const contributions = { 2023: 1000, 2024: 0 } // Initial contribution, then none

      const result = simulateMultiAssetPortfolio(defaultConfig, years, contributions)

      expect(result.yearResults[2023]).toBeDefined()
      expect(result.yearResults[2024]).toBeDefined()
    })
  })
})
