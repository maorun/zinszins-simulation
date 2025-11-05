import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCompactCurrency, formatPercent } from './currency'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('1.000')
    expect(result).toContain('€')
    expect(formatCurrency(500000)).toContain('500.000')
  })

  it('formats negative numbers correctly', () => {
    const result = formatCurrency(-1000)
    expect(result).toContain('-1.000')
    expect(result).toContain('€')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formats decimal numbers correctly', () => {
    const result = formatCurrency(1.23)
    expect(result).toContain('1,23')
    expect(result).toContain('€')
  })

  it('formats large numbers correctly', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1.000.000')
    expect(result).toContain('€')
  })
})

describe('formatCompactCurrency', () => {
  it('formats millions correctly', () => {
    const result = formatCompactCurrency(1500000)
    expect(result).toBe('1.5M €')
  })

  it('formats exact millions correctly', () => {
    const result = formatCompactCurrency(2000000)
    expect(result).toBe('2.0M €')
  })

  it('formats thousands correctly', () => {
    const result = formatCompactCurrency(5000)
    expect(result).toBe('5k €')
  })

  it('formats thousands with rounding correctly', () => {
    const result = formatCompactCurrency(5500)
    expect(result).toBe('6k €')
  })

  it('formats hundreds as regular currency', () => {
    const result = formatCompactCurrency(500)
    expect(result).toContain('500')
    expect(result).toContain('€')
  })

  it('formats small amounts as regular currency', () => {
    const result = formatCompactCurrency(50)
    expect(result).toContain('50')
    expect(result).toContain('€')
  })

  it('formats zero correctly', () => {
    const result = formatCompactCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })
})

describe('formatPercent', () => {
  it('formats positive values correctly', () => {
    expect(formatPercent(0.05)).toBe('5.0%')
    expect(formatPercent(0.123)).toBe('12.3%')
  })

  it('formats negative values correctly', () => {
    expect(formatPercent(-0.05)).toBe('-5.0%')
    expect(formatPercent(-0.123)).toBe('-12.3%')
  })

  it('formats zero correctly', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('shows sign when showSign option is true for positive values', () => {
    expect(formatPercent(0.05, { showSign: true })).toBe('+5.0%')
    expect(formatPercent(0.123, { showSign: true })).toBe('+12.3%')
  })

  it('shows sign when showSign option is true for zero', () => {
    expect(formatPercent(0, { showSign: true })).toBe('+0.0%')
  })

  it('does not add extra sign for negative values with showSign', () => {
    expect(formatPercent(-0.05, { showSign: true })).toBe('-5.0%')
  })
})
