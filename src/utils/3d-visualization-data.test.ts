import { describe, it, expect } from 'vitest'
import {
  prepareThreeDData,
  prepareMonteCarloThreeDData,
  calculateVolatility,
  generateSurfaceGrid,
} from './3d-visualization-data'
import type { SimulationResult, SimulationResultElement } from './simulate'

describe('3d-visualization-data', () => {
  describe('prepareThreeDData', () => {
    it('should prepare basic 3D data from simulation results', () => {
      const simulationResult: SimulationResult = {
        2023: {
          startkapital: 10000,
          zinsen: 500,
          endkapital: 10500,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
        2024: {
          startkapital: 10500,
          zinsen: 525,
          endkapital: 11025,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
      }

      const result = prepareThreeDData(simulationResult)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        year: 2023,
        returnRate: 5, // 500 / 10000 * 100
        capital: 10500,
      })
      expect(result[1]).toMatchObject({
        year: 2024,
        returnRate: 5, // 525 / 10500 * 100
        capital: 11025,
      })
    })

    it('should handle empty simulation results', () => {
      const result = prepareThreeDData({})
      expect(result).toEqual([])
    })

    it('should handle zero starting capital', () => {
      const simulationResult: SimulationResult = {
        2023: {
          startkapital: 0,
          zinsen: 0,
          endkapital: 0,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
      }

      const result = prepareThreeDData(simulationResult)

      expect(result).toHaveLength(1)
      expect(result[0].returnRate).toBe(0)
    })

    it('should normalize capital values when requested', () => {
      const simulationResult: SimulationResult = {
        2023: {
          startkapital: 10000,
          zinsen: 500,
          endkapital: 10000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
        2024: {
          startkapital: 10500,
          zinsen: 525,
          endkapital: 20000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
      }

      const result = prepareThreeDData(simulationResult, { normalizeCapital: true })

      expect(result).toHaveLength(2)
      expect(result[0].capital).toBe(50) // 10000 / 20000 * 100
      expect(result[1].capital).toBe(100) // 20000 / 20000 * 100
    })

    it('should sort years in ascending order', () => {
      const simulationResult: SimulationResult = {
        2025: {
          startkapital: 11025,
          zinsen: 551,
          endkapital: 11576,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
        2023: {
          startkapital: 10000,
          zinsen: 500,
          endkapital: 10500,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
        2024: {
          startkapital: 10500,
          zinsen: 525,
          endkapital: 11025,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        } as SimulationResultElement,
      }

      const result = prepareThreeDData(simulationResult)

      expect(result).toHaveLength(3)
      expect(result[0].year).toBe(2023)
      expect(result[1].year).toBe(2024)
      expect(result[2].year).toBe(2025)
    })
  })

  describe('calculateVolatility', () => {
    it('should calculate standard deviation correctly', () => {
      const returns = [5, 6, 4, 7, 3]
      const volatility = calculateVolatility(returns)

      // Mean = 5, Variance = ((0)² + (1)² + (-1)² + (2)² + (-2)²) / 5 = 10/5 = 2
      // Std Dev = √2 ≈ 1.414
      expect(volatility).toBeCloseTo(1.414, 2)
    })

    it('should return 0 for empty array', () => {
      expect(calculateVolatility([])).toBe(0)
    })

    it('should return 0 for single value', () => {
      expect(calculateVolatility([5])).toBe(0)
    })

    it('should return 0 for identical values', () => {
      const volatility = calculateVolatility([5, 5, 5, 5])
      expect(volatility).toBe(0)
    })

    it('should handle negative returns', () => {
      const returns = [-5, -3, -7, -2]
      const volatility = calculateVolatility(returns)

      // Mean = -4.25, should calculate variance correctly
      expect(volatility).toBeGreaterThan(0)
    })
  })

  describe('prepareMonteCarloThreeDData', () => {
    it('should prepare Monte Carlo data with volatility', () => {
      const monteCarloResults: SimulationResult[] = [
        {
          2023: {
            startkapital: 10000,
            zinsen: 500,
            endkapital: 10500,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
        },
        {
          2023: {
            startkapital: 10000,
            zinsen: 600,
            endkapital: 10600,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
        },
        {
          2023: {
            startkapital: 10000,
            zinsen: 400,
            endkapital: 10400,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
        },
      ]

      const result = prepareMonteCarloThreeDData(monteCarloResults)

      expect(result).toHaveLength(1)
      expect(result[0].year).toBe(2023)
      expect(result[0].capital).toBe(10500) // Median of [10400, 10500, 10600]
      expect(result[0].returnRate).toBe(5) // Median of [4, 5, 6]
      expect(result[0].volatility).toBeGreaterThan(0)
    })

    it('should handle empty Monte Carlo results', () => {
      const result = prepareMonteCarloThreeDData([])
      expect(result).toEqual([])
    })

    it('should normalize capital values when requested', () => {
      const monteCarloResults: SimulationResult[] = [
        {
          2023: {
            startkapital: 10000,
            zinsen: 500,
            endkapital: 10000,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
          2024: {
            startkapital: 10500,
            zinsen: 525,
            endkapital: 20000,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
        },
      ]

      const result = prepareMonteCarloThreeDData(monteCarloResults, { normalizeCapital: true })

      expect(result).toHaveLength(2)
      expect(result[0].capital).toBe(50) // 10000 / 20000 * 100
      expect(result[1].capital).toBe(100) // 20000 / 20000 * 100
    })

    it('should calculate median correctly for even number of values', () => {
      const monteCarloResults: SimulationResult[] = [
        {
          2023: {
            startkapital: 10000,
            zinsen: 500,
            endkapital: 10000,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
        },
        {
          2023: {
            startkapital: 10000,
            zinsen: 700,
            endkapital: 12000,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          } as SimulationResultElement,
        },
      ]

      const result = prepareMonteCarloThreeDData(monteCarloResults)

      expect(result).toHaveLength(1)
      expect(result[0].capital).toBe(11000) // Median of [10000, 12000]
      expect(result[0].returnRate).toBe(6) // Median of [5, 7]
    })
  })

  describe('generateSurfaceGrid', () => {
    it('should generate surface grid with correct dimensions', () => {
      const grid = generateSurfaceGrid(2023, 2025, 3, 7, 5)

      expect(grid).toHaveLength(5) // resolution rows
      expect(grid[0]).toHaveLength(5) // resolution columns
    })

    it('should calculate capital using compound interest', () => {
      const grid = generateSurfaceGrid(2023, 2025, 5, 5, 3)

      // For year 2023 (0 years elapsed), return 5%
      expect(grid[0][0].capital).toBeCloseTo(10000, 0)

      // For year 2024 (1 year elapsed), return 5%
      expect(grid[1][0].capital).toBeCloseTo(10500, 0)

      // For year 2025 (2 years elapsed), return 5%
      expect(grid[2][0].capital).toBeCloseTo(11025, 0)
    })

    it('should handle different return rates', () => {
      const grid = generateSurfaceGrid(2023, 2024, 0, 10, 3)

      // Check different return rates in same year
      expect(grid[0][0].returnRate).toBe(0)
      expect(grid[0][1].returnRate).toBe(5)
      expect(grid[0][2].returnRate).toBe(10)
    })

    it('should round years to integers', () => {
      const grid = generateSurfaceGrid(2023, 2025, 5, 5, 3)

      grid.forEach((row) => {
        row.forEach((point) => {
          expect(point.year % 1).toBe(0) // Should be integer
        })
      })
    })

    it('should generate single point for resolution 1', () => {
      const grid = generateSurfaceGrid(2023, 2025, 5, 7, 1)

      expect(grid).toHaveLength(1)
      expect(grid[0]).toHaveLength(1)
      expect(grid[0][0].year).toBe(2023)
      expect(grid[0][0].returnRate).toBe(5)
    })

    it('should use default resolution when not specified', () => {
      const grid = generateSurfaceGrid(2023, 2025, 3, 7)

      expect(grid).toHaveLength(20) // default resolution
      expect(grid[0]).toHaveLength(20)
    })
  })
})
