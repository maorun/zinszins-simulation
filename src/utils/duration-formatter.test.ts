import { describe, it, expect } from 'vitest'
import { formatDuration } from './duration-formatter'

describe('formatDuration', () => {
  it('formats single year correctly', () => {
    expect(formatDuration(1)).toBe('1 Jahr')
  })

  it('formats multiple years correctly', () => {
    expect(formatDuration(5)).toBe('5 Jahre')
    expect(formatDuration(25)).toBe('25 Jahre')
    expect(formatDuration(100)).toBe('100 Jahre')
  })

  it('formats zero as unlimited', () => {
    expect(formatDuration(0)).toBe('unbegrenzt (Vermögen wächst weiter)')
  })

  it('formats null as unlimited', () => {
    expect(formatDuration(null)).toBe('unbegrenzt (Vermögen wächst weiter)')
  })

  it('handles edge case of 2 years', () => {
    expect(formatDuration(2)).toBe('2 Jahre')
  })
})
