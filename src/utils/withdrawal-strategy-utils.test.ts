import { describe, it, expect } from 'vitest'
import { getStrategyDisplayName } from './withdrawal-strategy-utils'

describe('getStrategyDisplayName', () => {
  it('returns correct display name for 4prozent', () => {
    expect(getStrategyDisplayName('4prozent')).toBe('4% Regel')
  })

  it('returns correct display name for 3prozent', () => {
    expect(getStrategyDisplayName('3prozent')).toBe('3% Regel')
  })

  it('returns correct display name for variabel_prozent', () => {
    expect(getStrategyDisplayName('variabel_prozent')).toBe('Variable Prozent')
  })

  it('returns correct display name for monatlich_fest', () => {
    expect(getStrategyDisplayName('monatlich_fest')).toBe('Monatlich fest')
  })

  it('returns correct display name for dynamisch', () => {
    expect(getStrategyDisplayName('dynamisch')).toBe('Dynamische Strategie')
  })

  it('returns correct display name for bucket_strategie', () => {
    expect(getStrategyDisplayName('bucket_strategie')).toBe('Drei-Eimer-Strategie')
  })

  it('returns correct display name for rmd', () => {
    expect(getStrategyDisplayName('rmd')).toBe('RMD (Lebenserwartung)')
  })

  it('returns correct display name for kapitalerhalt', () => {
    expect(getStrategyDisplayName('kapitalerhalt')).toBe('Kapitalerhalt / Ewige Rente')
  })

  it('returns original strategy for unknown strategy type', () => {
    expect(getStrategyDisplayName('unknown_strategy')).toBe('unknown_strategy')
  })

  it('handles empty string', () => {
    expect(getStrategyDisplayName('')).toBe('')
  })
})
