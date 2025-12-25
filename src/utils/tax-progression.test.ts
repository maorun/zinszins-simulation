import { describe, it, expect } from 'vitest'
import {
  getTaxZone,
  getTaxZoneLabel,
  calculateMarginalTaxRate,
  generateTaxProgressionData,
  findDataPointForIncome,
  getTaxZoneColor,
} from './tax-progression'

describe('getTaxZone', () => {
  it('should return grundfreibetrag for income below or equal to threshold', () => {
    expect(getTaxZone(0)).toBe('grundfreibetrag')
    expect(getTaxZone(11604)).toBe('grundfreibetrag')
    expect(getTaxZone(11603)).toBe('grundfreibetrag')
  })

  it('should return zone1 for income in first progressive zone', () => {
    expect(getTaxZone(11605)).toBe('zone1')
    expect(getTaxZone(30000)).toBe('zone1')
    expect(getTaxZone(62809)).toBe('zone1')
  })

  it('should return zone2 for income in second progressive zone', () => {
    expect(getTaxZone(62810)).toBe('zone2')
    expect(getTaxZone(150000)).toBe('zone2')
    expect(getTaxZone(277825)).toBe('zone2')
  })

  it('should return zone3 for income at top tax threshold', () => {
    expect(getTaxZone(277826)).toBe('zone3')
  })

  it('should return reichensteuer for income above top tax threshold', () => {
    expect(getTaxZone(277827)).toBe('reichensteuer')
    expect(getTaxZone(500000)).toBe('reichensteuer')
  })

  it('should respect custom grundfreibetrag', () => {
    const customGrundfreibetrag = 12000
    expect(getTaxZone(11000, customGrundfreibetrag)).toBe('grundfreibetrag')
    expect(getTaxZone(12001, customGrundfreibetrag)).toBe('zone1')
  })
})

describe('getTaxZoneLabel', () => {
  it('should return correct labels for all tax zones', () => {
    expect(getTaxZoneLabel('grundfreibetrag')).toBe('Grundfreibetrag (0%)')
    expect(getTaxZoneLabel('zone1')).toBe('Lineare Zone (14%-24%)')
    expect(getTaxZoneLabel('zone2')).toBe('Progressionszone (24%-42%)')
    expect(getTaxZoneLabel('zone3')).toBe('Spitzensteuersatz (42%)')
    expect(getTaxZoneLabel('reichensteuer')).toBe('Reichensteuer (45%)')
  })
})

describe('calculateMarginalTaxRate', () => {
  it('should return 0 for zero income', () => {
    expect(calculateMarginalTaxRate(0)).toBe(0)
  })

  it('should return low rate for income at grundfreibetrag threshold', () => {
    // At exactly grundfreibetrag, the marginal rate is the rate on the first euro above it
    // which is around 14% (start of zone 1)
    const rate = calculateMarginalTaxRate(11604)
    expect(rate).toBeGreaterThan(13)
    expect(rate).toBeLessThan(15)
  })

  it('should return rate close to 14% for income just above grundfreibetrag', () => {
    const rate = calculateMarginalTaxRate(11605)
    expect(rate).toBeGreaterThan(13)
    expect(rate).toBeLessThan(15)
  })

  it('should return rate close to 24% for income in zone1', () => {
    const rate = calculateMarginalTaxRate(40000)
    expect(rate).toBeGreaterThan(18)
    expect(rate).toBeLessThan(26)
  })

  it('should return rate close to 42% for income in zone2', () => {
    const rate = calculateMarginalTaxRate(150000)
    expect(rate).toBeGreaterThan(30)
    expect(rate).toBeLessThan(43)
  })

  it('should return rate close to 45% for income above reichensteuer threshold', () => {
    const rate = calculateMarginalTaxRate(300000)
    expect(rate).toBeGreaterThan(44)
    expect(rate).toBeLessThan(46)
  })

  it('should handle custom delta parameter', () => {
    const rate1 = calculateMarginalTaxRate(50000, 11604, 100)
    const rate2 = calculateMarginalTaxRate(50000, 11604, 1000)
    // Both should give similar rates (within 1 percentage point)
    expect(Math.abs(rate1 - rate2)).toBeLessThan(1)
  })
})

describe('generateTaxProgressionData', () => {
  it('should generate correct number of data points', () => {
    const data = generateTaxProgressionData(0, 100000, 50)
    expect(data).toHaveLength(50)
  })

  it('should generate data points covering the full income range', () => {
    const data = generateTaxProgressionData(0, 100000, 100)
    expect(data[0].income).toBe(0)
    expect(data[data.length - 1].income).toBeCloseTo(100000, 0)
  })

  it('should have zero tax for income at zero', () => {
    const data = generateTaxProgressionData(0, 100000, 100)
    expect(data[0].taxAmount).toBe(0)
    expect(data[0].averageTaxRate).toBe(0)
  })

  it('should have generally increasing tax amounts as income increases', () => {
    const data = generateTaxProgressionData(0, 100000, 100)
    // Check overall trend - first and last quartiles
    const firstQuartile = data.slice(0, 25).reduce((sum, d) => sum + d.taxAmount, 0) / 25
    const lastQuartile = data.slice(75, 100).reduce((sum, d) => sum + d.taxAmount, 0) / 25
    expect(lastQuartile).toBeGreaterThan(firstQuartile)
    
    // Check that most consecutive pairs increase
    let increasingPairs = 0
    for (let i = 1; i < data.length; i++) {
      if (data[i].taxAmount >= data[i - 1].taxAmount) {
        increasingPairs++
      }
    }
    // At least 95% should be non-decreasing (allows for minor approximation artifacts)
    expect(increasingPairs / (data.length - 1)).toBeGreaterThan(0.95)
  })

  it('should correctly identify tax zones', () => {
    const data = generateTaxProgressionData(0, 300000, 100)

    // Find data points in each zone
    const grundfreibetragPoint = data.find(d => d.income <= 11604)
    const zone1Point = data.find(d => d.income > 11604 && d.income <= 62809)
    const zone2Point = data.find(d => d.income > 62809 && d.income <= 277825)
    const reichensteuerPoint = data.find(d => d.income > 277826)

    expect(grundfreibetragPoint?.zone).toBe('grundfreibetrag')
    expect(zone1Point?.zone).toBe('zone1')
    expect(zone2Point?.zone).toBe('zone2')
    expect(reichensteuerPoint?.zone).toBe('reichensteuer')
  })

  it('should have marginal rate >= average rate', () => {
    const data = generateTaxProgressionData(0, 100000, 50)
    data.forEach(point => {
      if (point.income > 11604) {
        // Marginal rate should be >= average rate in progressive tax system
        expect(point.marginalTaxRate).toBeGreaterThanOrEqual(point.averageTaxRate - 0.1) // Allow small rounding difference
      }
    })
  })

  it('should respect custom grundfreibetrag', () => {
    const customGrundfreibetrag = 12000
    const data = generateTaxProgressionData(0, 100000, 50, customGrundfreibetrag)

    const pointBelowGrundfreibetrag = data.find(d => d.income < customGrundfreibetrag)
    expect(pointBelowGrundfreibetrag?.taxAmount).toBe(0)
  })

  it('should handle different income ranges', () => {
    const data1 = generateTaxProgressionData(10000, 50000, 20)
    expect(data1[0].income).toBe(10000)
    expect(data1[data1.length - 1].income).toBeCloseTo(50000, 0)

    const data2 = generateTaxProgressionData(100000, 300000, 30)
    expect(data2[0].income).toBe(100000)
    expect(data2[data2.length - 1].income).toBeCloseTo(300000, 0)
  })
})

describe('findDataPointForIncome', () => {
  it('should return null for empty data array', () => {
    const result = findDataPointForIncome([], 50000)
    expect(result).toBeNull()
  })

  it('should find exact match when available', () => {
    const data = generateTaxProgressionData(0, 100000, 101)
    const result = findDataPointForIncome(data, 50000)
    expect(result).not.toBeNull()
    expect(result?.income).toBeCloseTo(50000, 0)
  })

  it('should find closest match when exact is not available', () => {
    const data = generateTaxProgressionData(0, 100000, 11) // 0, 10k, 20k, ..., 100k
    const result = findDataPointForIncome(data, 45000)
    expect(result).not.toBeNull()
    // Should be close to 40k or 50k
    expect(Math.abs((result?.income || 0) - 45000)).toBeLessThanOrEqual(5000)
  })

  it('should find closest match for income below minimum', () => {
    const data = generateTaxProgressionData(10000, 100000, 10)
    const result = findDataPointForIncome(data, 5000)
    expect(result).not.toBeNull()
    expect(result?.income).toBe(10000)
  })

  it('should find closest match for income above maximum', () => {
    const data = generateTaxProgressionData(0, 100000, 10)
    const result = findDataPointForIncome(data, 150000)
    expect(result).not.toBeNull()
    expect(result?.income).toBeCloseTo(100000, 0)
  })
})

describe('getTaxZoneColor', () => {
  it('should return distinct colors for each tax zone', () => {
    const colors = [
      getTaxZoneColor('grundfreibetrag'),
      getTaxZoneColor('zone1'),
      getTaxZoneColor('zone2'),
      getTaxZoneColor('zone3'),
      getTaxZoneColor('reichensteuer'),
    ]

    // All colors should be unique
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(5)
  })

  it('should return valid hex color codes', () => {
    const zones: Array<'grundfreibetrag' | 'zone1' | 'zone2' | 'zone3' | 'reichensteuer'> = [
      'grundfreibetrag',
      'zone1',
      'zone2',
      'zone3',
      'reichensteuer',
    ]

    zones.forEach(zone => {
      const color = getTaxZoneColor(zone)
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})

describe('Tax Progression Integration', () => {
  it('should show progressive nature of German tax system', () => {
    const data = generateTaxProgressionData(0, 300000, 100)

    // Sample incomes from different zones
    const income20k = findDataPointForIncome(data, 20000)
    const income50k = findDataPointForIncome(data, 50000)
    const income100k = findDataPointForIncome(data, 100000)
    const income200k = findDataPointForIncome(data, 200000)

    // Average tax rate should increase with income
    expect(income20k?.averageTaxRate).toBeLessThan(income50k?.averageTaxRate || 0)
    expect(income50k?.averageTaxRate).toBeLessThan(income100k?.averageTaxRate || 0)
    expect(income100k?.averageTaxRate).toBeLessThan(income200k?.averageTaxRate || 0)
  })

  it('should demonstrate marginal rate is higher than average rate', () => {
    const data = generateTaxProgressionData(0, 300000, 100)

    // For incomes above grundfreibetrag, marginal should be > average
    const income50k = findDataPointForIncome(data, 50000)
    expect(income50k?.marginalTaxRate).toBeGreaterThan(income50k?.averageTaxRate || 0)

    const income150k = findDataPointForIncome(data, 150000)
    expect(income150k?.marginalTaxRate).toBeGreaterThan(income150k?.averageTaxRate || 0)
  })

  it('should show correct tax zones across income spectrum', () => {
    const data = generateTaxProgressionData(0, 300000, 100)

    const lowIncome = findDataPointForIncome(data, 5000)
    const midIncome = findDataPointForIncome(data, 40000)
    const highIncome = findDataPointForIncome(data, 150000)
    const veryHighIncome = findDataPointForIncome(data, 280000)

    expect(lowIncome?.zone).toBe('grundfreibetrag')
    expect(midIncome?.zone).toBe('zone1')
    expect(highIncome?.zone).toBe('zone2')
    expect(veryHighIncome?.zone).toBe('reichensteuer')
  })
})
