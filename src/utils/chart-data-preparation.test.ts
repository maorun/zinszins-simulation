import { describe, it, expect } from 'vitest'
import { prepareAreaChartData, prepareBarChartData } from './chart-data-preparation'
import type { SimulationResult } from './simulate'

describe('chart-data-preparation', () => {
  const mockSimulationData: SimulationResult = {
    2023: {
      startkapital: 10000,
      endkapital: 10500,
      zinsen: 500,
      bezahlteSteuer: 150,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 150,
    },
    2024: {
      startkapital: 22500,
      endkapital: 23700,
      zinsen: 1200,
      bezahlteSteuer: 360,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 360,
    },
    2025: {
      startkapital: 35700,
      endkapital: 37700,
      zinsen: 2000,
      bezahlteSteuer: 600,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 600,
    },
  }

  const mockSimulationDataWithReal: SimulationResult = {
    2023: {
      startkapital: 10000,
      endkapital: 10500,
      zinsen: 500,
      bezahlteSteuer: 150,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 150,
      startkapitalReal: 9800,
      endkapitalReal: 10290,
      zinsenReal: 490,
    },
    2024: {
      startkapital: 22500,
      endkapital: 23700,
      zinsen: 1200,
      bezahlteSteuer: 360,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 360,
      startkapitalReal: 21600,
      endkapitalReal: 22752,
      zinsenReal: 1152,
    },
  }

  describe('prepareAreaChartData', () => {
    it('returns correct number of data points', () => {
      const result = prepareAreaChartData(mockSimulationData)
      expect(result).toHaveLength(3)
    })

    it('returns data points sorted by year', () => {
      const result = prepareAreaChartData(mockSimulationData)
      expect(result[0].year).toBe(2023)
      expect(result[1].year).toBe(2024)
      expect(result[2].year).toBe(2025)
    })

    it('calculates cumulative contributions correctly', () => {
      const result = prepareAreaChartData(mockSimulationData)
      
      // Year 2023: Initial 10000
      expect(result[0].contributions).toBe(10000)
      
      // Year 2024: Previous 10000 + new deposits (22500 - 10500)
      expect(result[1].contributions).toBe(10000 + 12000)
      
      // Year 2025: Previous 22000 + new deposits (35700 - 23700)
      expect(result[2].contributions).toBe(22000 + 12000)
    })

    it('calculates cumulative gains correctly', () => {
      const result = prepareAreaChartData(mockSimulationData)
      
      expect(result[0].gains).toBe(500)
      expect(result[1].gains).toBe(500 + 1200)
      expect(result[2].gains).toBe(500 + 1200 + 2000)
    })

    it('calculates cumulative taxes correctly', () => {
      const result = prepareAreaChartData(mockSimulationData)
      
      expect(result[0].taxes).toBe(150)
      expect(result[1].taxes).toBe(150 + 360)
      expect(result[2].taxes).toBe(150 + 360 + 600)
    })

    it('includes endkapital for each year', () => {
      const result = prepareAreaChartData(mockSimulationData)
      
      expect(result[0].endkapital).toBe(10500)
      expect(result[1].endkapital).toBe(23700)
      expect(result[2].endkapital).toBe(37700)
    })

    it('handles real values when available', () => {
      const result = prepareAreaChartData(mockSimulationDataWithReal)
      
      expect(result[0].endkapitalReal).toBe(10290)
      expect(result[1].endkapitalReal).toBe(22752)
    })

    it('handles empty simulation data', () => {
      const result = prepareAreaChartData({})
      expect(result).toHaveLength(0)
    })
  })

  describe('prepareBarChartData', () => {
    it('returns correct number of data points', () => {
      const result = prepareBarChartData(mockSimulationData)
      expect(result).toHaveLength(3)
    })

    it('returns data points sorted by year', () => {
      const result = prepareBarChartData(mockSimulationData)
      expect(result[0].year).toBe(2023)
      expect(result[1].year).toBe(2024)
      expect(result[2].year).toBe(2025)
    })

    it('calculates annual contributions correctly', () => {
      const result = prepareBarChartData(mockSimulationData)
      
      // Year 2023: Initial deposit
      expect(result[0].contributions).toBe(10000)
      
      // Year 2024: New deposits (22500 - 10500)
      expect(result[1].contributions).toBe(12000)
      
      // Year 2025: New deposits (35700 - 23700)
      expect(result[2].contributions).toBe(12000)
    })

    it('includes annual gains for each year', () => {
      const result = prepareBarChartData(mockSimulationData)
      
      expect(result[0].gains).toBe(500)
      expect(result[1].gains).toBe(1200)
      expect(result[2].gains).toBe(2000)
    })

    it('includes annual taxes for each year', () => {
      const result = prepareBarChartData(mockSimulationData)
      
      expect(result[0].taxes).toBe(150)
      expect(result[1].taxes).toBe(360)
      expect(result[2].taxes).toBe(600)
    })

    it('handles real values when available', () => {
      const result = prepareBarChartData(mockSimulationDataWithReal)
      
      expect(result[0].gainsReal).toBe(490)
      expect(result[1].gainsReal).toBe(1152)
    })

    it('handles empty simulation data', () => {
      const result = prepareBarChartData({})
      expect(result).toHaveLength(0)
    })

    it('handles single year data', () => {
      const singleYearData: SimulationResult = {
        2023: {
          startkapital: 10000,
          endkapital: 10500,
          zinsen: 500,
          bezahlteSteuer: 150,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
          genutzterFreibetrag: 150,
        },
      }
      
      const result = prepareBarChartData(singleYearData)
      expect(result).toHaveLength(1)
      expect(result[0].contributions).toBe(10000)
      expect(result[0].gains).toBe(500)
      expect(result[0].taxes).toBe(150)
    })
  })
})
