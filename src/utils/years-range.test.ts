import { describe, it, expect } from 'vitest'
import { getYearsRange } from './years-range'
import type { SimulationData } from '../contexts/helpers/config-types'

describe('getYearsRange', () => {
  it('returns empty string when simulationData is null', () => {
    const result = getYearsRange(null, 2040)
    expect(result).toBe('')
  })

  it('calculates year range correctly with single savings plan', () => {
    const simulationData: SimulationData = {
      sparplanElements: [{ start: '2023-01-01', einzahlung: 1000 }],
    } as SimulationData

    const result = getYearsRange(simulationData, 2040)
    expect(result).toBe('2023 - 2040')
  })

  it('calculates year range correctly with multiple savings plans', () => {
    const simulationData: SimulationData = {
      sparplanElements: [
        { start: '2025-06-15', einzahlung: 1000 },
        { start: '2023-01-01', einzahlung: 500 },
        { start: '2024-03-20', einzahlung: 750 },
      ],
    } as SimulationData

    const result = getYearsRange(simulationData, 2040)
    expect(result).toBe('2023 - 2040')
  })

  it('handles same start and end year', () => {
    const simulationData: SimulationData = {
      sparplanElements: [{ start: '2040-01-01', einzahlung: 1000 }],
    } as SimulationData

    const result = getYearsRange(simulationData, 2040)
    expect(result).toBe('2040 - 2040')
  })

  it('handles future dates correctly', () => {
    const simulationData: SimulationData = {
      sparplanElements: [
        { start: '2030-01-01', einzahlung: 1000 },
        { start: '2035-01-01', einzahlung: 500 },
      ],
    } as SimulationData

    const result = getYearsRange(simulationData, 2050)
    expect(result).toBe('2030 - 2050')
  })

  it('handles dates with different month and day values', () => {
    const simulationData: SimulationData = {
      sparplanElements: [
        { start: '2023-12-31', einzahlung: 1000 },
        { start: '2025-01-01', einzahlung: 500 },
      ],
    } as SimulationData

    const result = getYearsRange(simulationData, 2040)
    expect(result).toBe('2023 - 2040')
  })
})
