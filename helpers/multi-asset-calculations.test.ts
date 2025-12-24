import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateMultiAssetReturns,
  simulateMultiAssetPortfolio,
  calculateEquivalentSingleAssetReturn,
} from './multi-asset-calculations'
import { createDefaultMultiAssetConfig, type MultiAssetPortfolioConfig } from './multi-asset-portfolio'

// Mock the random number generator for consistent tests
// Using spyOn instead of stubGlobal to preserve other Math functions
const mockRandom = vi.spyOn(Math, 'random')

describe('multi-asset-calculations', () => {
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

      // Should return 0 when portfolio is disabled
      expect(returns[2023]).toBe(0)
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

  describe('Rebalancing Protocol', () => {
    it('creates rebalancing protocol when scheduled rebalancing occurs', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'
      config.rebalancing.useThreshold = false

      const years = [2023, 2024, 2025]
      const contributions = { 2023: 100000, 2024: 0, 2025: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      // Should have rebalancing protocols for years 2024 and 2025 (not first year)
      expect(result.rebalancingProtocols.length).toBeGreaterThan(0)

      const protocol = result.rebalancingProtocols[0]
      expect(protocol).toBeDefined()
      expect(protocol.reason).toBe('scheduled')
      expect(protocol.transactions).toBeDefined()
      expect(Array.isArray(protocol.transactions)).toBe(true)
    })

    it('tracks buy and sell transactions during rebalancing', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'

      const years = [2023, 2024]
      const contributions = { 2023: 100000, 2024: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      expect(result.rebalancingProtocols.length).toBeGreaterThan(0)

      const protocol = result.rebalancingProtocols[0]
      expect(protocol.transactions.length).toBeGreaterThan(0)

      // Check that transactions have proper types
      for (const transaction of protocol.transactions) {
        expect(['buy', 'sell']).toContain(transaction.type)
        expect(transaction.amount).toBeGreaterThan(0)
        expect(transaction.percentageOfPortfolio).toBeGreaterThan(0)
      }
    })

    it('calculates capital gains tax for sell transactions', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'

      const years = [2023, 2024]
      const contributions = { 2023: 100000, 2024: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      expect(result.rebalancingProtocols.length).toBeGreaterThan(0)

      const protocol = result.rebalancingProtocols[0]
      const sellTransactions = protocol.transactions.filter(t => t.type === 'sell')

      // At least some sell transactions should have capital gains and tax
      const transactionsWithGains = sellTransactions.filter(t => t.capitalGains && t.capitalGains > 0)

      if (transactionsWithGains.length > 0) {
        const transaction = transactionsWithGains[0]
        expect(transaction.tax).toBeDefined()
        expect(transaction.tax).toBeGreaterThan(0)
        // Tax should be less than capital gains (due to German tax rate ~26.375%)
        expect(transaction.tax!).toBeLessThan(transaction.capitalGains!)
      }
    })

    it('applies partial exemption for equity funds', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'

      // Enable only equity funds
      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.stocks_domestic.targetAllocation = 1.0
      config.assetClasses.stocks_international.enabled = false
      config.assetClasses.bonds_government.enabled = false
      config.assetClasses.bonds_corporate.enabled = false

      const years = [2023, 2024]
      const contributions = { 2023: 100000, 2024: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      if (result.rebalancingProtocols.length > 0) {
        const protocol = result.rebalancingProtocols[0]

        // Total tax should account for 30% partial exemption
        // Tax = capitalGains * 0.7 * 0.26375
        if (protocol.totalCapitalGains > 0) {
          const expectedMaxTax = protocol.totalCapitalGains * 0.7 * 0.26375
          expect(protocol.totalTax).toBeLessThanOrEqual(expectedMaxTax * 1.01) // Allow 1% tolerance
        }
      }
    })

    it('tracks allocations before and after rebalancing', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'

      const years = [2023, 2024]
      const contributions = { 2023: 100000, 2024: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      expect(result.rebalancingProtocols.length).toBeGreaterThan(0)

      const protocol = result.rebalancingProtocols[0]
      expect(protocol.allocationsBefore).toBeDefined()
      expect(protocol.allocationsAfter).toBeDefined()

      // After rebalancing, allocations should match target allocations
      const enabledAssets = Object.keys(config.assetClasses).filter(
        key => config.assetClasses[key as keyof typeof config.assetClasses].enabled,
      )

      for (const asset of enabledAssets) {
        const targetAllocation = config.assetClasses[asset as keyof typeof config.assetClasses].targetAllocation
        const afterAllocation = protocol.allocationsAfter[asset as keyof typeof protocol.allocationsAfter]

        // Should be very close to target (within 0.1%)
        expect(Math.abs(afterAllocation - targetAllocation)).toBeLessThan(0.001)
      }
    })

    it('calculates net cost of rebalancing', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'

      const years = [2023, 2024]
      const contributions = { 2023: 100000, 2024: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      if (result.rebalancingProtocols.length > 0) {
        const protocol = result.rebalancingProtocols[0]

        // Net cost should equal total tax (no transaction costs currently)
        expect(protocol.netCost).toBe(protocol.totalTax)

        // Portfolio value after should account for tax
        const expectedValueAfter = protocol.portfolioValueBefore - protocol.totalTax
        expect(Math.abs(protocol.portfolioValueAfter - expectedValueAfter)).toBeLessThan(0.01)
      }
    })

    it('does not create protocol when rebalancing is disabled', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'never'

      const years = [2023, 2024, 2025]
      const contributions = { 2023: 100000, 2024: 0, 2025: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      // Should have no rebalancing protocols
      expect(result.rebalancingProtocols.length).toBe(0)

      // Year results should not have rebalancing protocols
      for (const year of years) {
        const yearResult = result.yearResults[year]
        if (yearResult) {
          expect(yearResult.rebalanced).toBe(false)
          expect(yearResult.rebalancingProtocol).toBeUndefined()
        }
      }
    })

    it('collects all rebalancing protocols from simulation', () => {
      const config = { ...defaultConfig }
      config.rebalancing.frequency = 'annually'

      const years = [2023, 2024, 2025, 2026]
      const contributions = { 2023: 100000, 2024: 0, 2025: 0, 2026: 0 }

      const result = simulateMultiAssetPortfolio(config, years, contributions)

      // Should have protocols for years where rebalancing occurred
      expect(result.rebalancingProtocols.length).toBeGreaterThan(0)
      expect(result.rebalancingProtocols.length).toBeLessThanOrEqual(years.length)

      // Each protocol should have a unique year
      const protocolYears = result.rebalancingProtocols.map(p => p.year)
      const uniqueYears = new Set(protocolYears)
      expect(uniqueYears.size).toBe(protocolYears.length)

      // All protocol years should be in the simulation years
      for (const year of protocolYears) {
        expect(years).toContain(year)
      }
    })
  })
})
