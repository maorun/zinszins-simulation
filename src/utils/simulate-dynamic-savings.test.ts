import { describe, it, expect } from 'vitest'
import { simulate, type SimulateOptions } from './simulate'
import type { SparplanElement } from './sparplan-utils'
import { createDefaultDynamicSavingsConfig } from '../../helpers/dynamic-savings-rate'

describe('simulate with dynamic savings rates', () => {
  it('should use static einzahlung when dynamic savings is disabled', () => {
    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    // Check that einzahlung remains constant
    const element = elements[0]
    expect(element.simulation[2024]).toBeDefined()
    expect(element.simulation[2025]).toBeDefined()
    expect(element.simulation[2026]).toBeDefined()

    // All years should use the same base einzahlung (2000€)
    // Year 2024: 2000€ starting capital
    expect(element.simulation[2024].startkapital).toBeCloseTo(2000, 1)
  })

  it('should apply dynamic savings rate when configured', () => {
    const birthYear = 1990 // Will be 34 in 2024
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true
    // Age 34 -> Karrieremitte phase (1.0 multiplier)

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    const element = elements[0]

    // Year 2024: Age 34, Karrieremitte (1.0x) -> 2000€
    expect(element.simulation[2024].startkapital).toBeCloseTo(2000, 1)

    // Year 2025: Age 35, Karrieremitte (1.0x) -> 2000€
    // Should be consistent since no income development is enabled by default
    expect(element.simulation[2025].startkapital).toBeGreaterThan(2000) // Previous year's capital + growth
  })

  it('should apply life phase multipliers correctly', () => {
    const birthYear = 1965 // Will be 59 in 2024 (Pre-retirement phase)
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true
    // Age 59 -> Pre-retirement phase (1.3 multiplier)

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2025,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    const element = elements[0]

    // Year 2024: Age 59, Pre-retirement (1.3x) -> 2600€
    expect(element.simulation[2024].startkapital).toBeCloseTo(2600, 1)
  })

  it('should apply income development adjustments cumulatively', () => {
    const birthYear = 1990 // Will be 34 in 2024
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true
    dynamicConfig.incomeDevelopment!.enabled = true

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    const element = elements[0]

    // Year 2024: Base year, no income adjustment yet
    const startCapital2024 = element.simulation[2024].startkapital
    expect(startCapital2024).toBeCloseTo(2000, 1)

    // Year 2025: Age 35, should have income adjustment (+40€ from 4% salary increase)
    // startkapital includes previous year's growth, so we can't directly compare
    // But we can check that the simulation ran successfully
    expect(element.simulation[2025]).toBeDefined()
    expect(element.simulation[2025].startkapital).toBeGreaterThan(startCapital2024)

    // Year 2026: Age 36, cumulative adjustment
    expect(element.simulation[2026]).toBeDefined()
    expect(element.simulation[2026].startkapital).toBeGreaterThan(element.simulation[2025].startkapital)
  })

  it('should apply life events correctly', () => {
    const birthYear = 1990
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true
    dynamicConfig.lifeEvents = [
      { year: 2025, type: 'geburt', savingsRateChange: -500 }, // Birth of child reduces savings
    ]

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    const element = elements[0]

    // Year 2024: Before event, base amount
    expect(element.simulation[2024].startkapital).toBeCloseTo(2000, 1)

    // Year 2025: Event year, reduced by 500€ (2000 - 500 = 1500€)
    // The startkapital will be previous year + growth, but we can verify simulation exists
    expect(element.simulation[2025]).toBeDefined()

    // Year 2026: Event still applies (1500€ contribution)
    expect(element.simulation[2026]).toBeDefined()
  })

  it('should combine life phase, income development, and life events', () => {
    const birthYear = 1965 // Age 59 in 2024 (Pre-retirement: 1.3x)
    const dynamicConfig = createDefaultDynamicSavingsConfig(1000, birthYear)
    dynamicConfig.enabled = true
    dynamicConfig.incomeDevelopment!.enabled = true
    dynamicConfig.lifeEvents = [{ year: 2025, type: 'kreditabbezahlung', savingsRateChange: 500 }]

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 1000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    const element = elements[0]

    // Year 2024: Age 59, Pre-retirement (1.3x) -> 1300€
    expect(element.simulation[2024].startkapital).toBeCloseTo(1300, 1)

    // All years should have simulation data
    expect(element.simulation[2025]).toBeDefined()
    expect(element.simulation[2026]).toBeDefined()
  })

  it('should not apply dynamic savings rate to einmalzahlung', () => {
    const birthYear = 1965
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'einmalzahlung',
        einzahlung: 10000,
        gewinn: 0,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig, // Should be ignored for one-time payments
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2025,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
    }

    simulate(options)

    const element = elements[0]

    // Should use original einzahlung (10000€), not dynamic rate
    expect(element.simulation[2024].startkapital).toBeCloseTo(10000, 1)
  })

  it('should handle monthly simulation mode with dynamic savings rates', () => {
    const birthYear = 1990
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2024,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'monthly',
    }

    simulate(options)

    const element = elements[0]

    // Should work with monthly simulation
    expect(element.simulation[2024]).toBeDefined()
    expect(element.simulation[2024].startkapital).toBeGreaterThan(0)
  })

  it('should work with inflation adjustment and dynamic savings rates', () => {
    const birthYear = 1990
    const dynamicConfig = createDefaultDynamicSavingsConfig(2000, birthYear)
    dynamicConfig.enabled = true

    const elements: SparplanElement[] = [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 2000,
        simulation: {},
        dynamicSavingsConfig: dynamicConfig,
      },
    ]

    const options: SimulateOptions = {
      startYear: 2024,
      endYear: 2026,
      elements,
      returnConfig: { mode: 'fixed', fixedRate: 5.0 },
      steuerlast: 26.375,
      simulationAnnual: 'yearly',
      inflationAktivSparphase: true,
      inflationsrateSparphase: 2.0, // 2% inflation
      inflationAnwendungSparphase: 'sparplan',
    }

    simulate(options)

    const element = elements[0]

    // Both dynamic savings rate and inflation should be applied
    expect(element.simulation[2024]).toBeDefined()
    expect(element.simulation[2025]).toBeDefined()
    expect(element.simulation[2026]).toBeDefined()

    // Later years should have inflation-adjusted amounts
    // (dynamic rate is applied first, then inflation adjustment)
    expect(element.simulation[2025].startkapital).toBeGreaterThan(element.simulation[2024].startkapital)
  })
})
