import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCompactCurrency } from './currency'

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
