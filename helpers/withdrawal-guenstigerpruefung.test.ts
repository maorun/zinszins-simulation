import { describe, it, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import type { SparplanElement } from '../src/utils/sparplan-utils'

describe('calculateWithdrawal with Günstigerprüfung', () => {
  const mockElement: SparplanElement = {
    type: 'sparplan',
    start: '2023-01',
    einzahlung: 100000, // €100k invested
    ter: 0,
    transactionCostPercent: 0,
    simulation: {
      2024: {
        startkapital: 100000,
        endkapital: 110000, // 10% gain
        zinsen: 10000,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    },
  }

  const baseParams = {
    elements: [mockElement],
    startYear: 2025,
    endYear: 2025,
    strategy: '4prozent' as const,
    returnConfig: { mode: 'fixed' as const, fixedRate: 0.05 },
    taxRate: 0.26375, // 26.375% Abgeltungssteuer
    teilfreistellungsquote: 0.3, // 30%
    freibetragPerYear: { 2025: 0 }, // Remove tax allowance to test differences
  }

  it('should perform Günstigerprüfung with progressive tax when enabled', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeDefined()
    // Progressive tax is always used, which may be more favorable than Abgeltungssteuer
    expect(yearData.guenstigerPruefungResultRealizedGains?.isFavorable).toMatch(/personal|abgeltungssteuer|equal/)
    expect(yearData.guenstigerPruefungResultRealizedGains?.explanation).toBeDefined()
  })

  it('should use progressive tax calculation for Günstigerprüfung', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeDefined()
    // With progressive tax, small gains may result in lower tax than Abgeltungssteuer
    expect(yearData.guenstigerPruefungResultRealizedGains?.explanation).toContain('Progressiver Tarif')
  })

  it('should not perform Günstigerprüfung when disabled', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: false,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeUndefined()
  })

  it('should perform Günstigerprüfung when enabled (no longer requires incomeTaxRate)', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    // Günstigerprüfung is now performed with progressive tax
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeDefined()
  })

  it('should show tax calculation results with Günstigerprüfung', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeDefined()
    
    // Both tax amounts should be calculated
    expect(yearData.guenstigerPruefungResultRealizedGains?.abgeltungssteuerAmount).toBeGreaterThanOrEqual(0)
    expect(yearData.guenstigerPruefungResultRealizedGains?.personalTaxAmount).toBeGreaterThanOrEqual(0)
  })

  it('should store both tax amounts for comparison in results', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
    })

    const yearData = result.result[2025]
    const pruefungResult = yearData.guenstigerPruefungResultRealizedGains

    expect(pruefungResult).toBeDefined()
    expect(pruefungResult?.abgeltungssteuerAmount).toBeGreaterThan(0)
    // Progressive tax may result in 0 tax for small gains
    expect(pruefungResult?.personalTaxAmount).toBeGreaterThanOrEqual(0)
    expect(pruefungResult?.usedTaxRate).toBeGreaterThanOrEqual(0)
    expect(['abgeltungssteuer', 'personal', 'equal']).toContain(pruefungResult?.isFavorable)
    expect(pruefungResult?.explanation).toBeTruthy()
  })
})
