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

  it('should use Abgeltungssteuer when personal tax rate is higher', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
      incomeTaxRate: 0.45, // 45% personal tax rate - higher than Abgeltungssteuer
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains?.isFavorable).toBe('abgeltungssteuer')
    expect(yearData.guenstigerPruefungResultRealizedGains?.explanation).toContain('Abgeltungssteuer')
  })

  it('should use personal tax rate when it is lower', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
      incomeTaxRate: 0.10, // 10% personal tax rate - lower than effective Abgeltungssteuer
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains?.isFavorable).toBe('personal')
    expect(yearData.guenstigerPruefungResultRealizedGains?.explanation).toContain('Persönlicher Steuersatz')
  })

  it('should not perform Günstigerprüfung when disabled', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: false,
      incomeTaxRate: 0.10,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeUndefined()
  })

  it('should not perform Günstigerprüfung when incomeTaxRate is undefined', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
      incomeTaxRate: undefined,
    })

    const yearData = result.result[2025]
    expect(yearData).toBeDefined()
    expect(yearData.guenstigerPruefungResultRealizedGains).toBeUndefined()
  })

  it('should calculate different tax amounts for different strategies', () => {
    const abgeltungssteuerResult = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
      incomeTaxRate: 0.45, // Should use Abgeltungssteuer
    })

    const personalTaxResult = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
      incomeTaxRate: 0.10, // Should use personal tax
    })

    const abgeltungssteuerData = abgeltungssteuerResult.result[2025]
    const personalTaxData = personalTaxResult.result[2025]

    expect(abgeltungssteuerData.guenstigerPruefungResultRealizedGains?.isFavorable).toBe('abgeltungssteuer')
    expect(personalTaxData.guenstigerPruefungResultRealizedGains?.isFavorable).toBe('personal')
    expect(abgeltungssteuerData.bezahlteSteuer).toBeGreaterThan(personalTaxData.bezahlteSteuer)
  })

  it('should store both tax amounts for comparison in results', () => {
    const result = calculateWithdrawal({
      ...baseParams,
      guenstigerPruefungAktiv: true,
      incomeTaxRate: 0.25,
    })

    const yearData = result.result[2025]
    const pruefungResult = yearData.guenstigerPruefungResultRealizedGains

    expect(pruefungResult).toBeDefined()
    expect(pruefungResult?.abgeltungssteuerAmount).toBeGreaterThan(0)
    expect(pruefungResult?.personalTaxAmount).toBeGreaterThan(0)
    expect(pruefungResult?.usedTaxRate).toBeGreaterThan(0)
    expect(['abgeltungssteuer', 'personal', 'equal']).toContain(pruefungResult?.isFavorable)
    expect(pruefungResult?.explanation).toBeTruthy()
  })
})
