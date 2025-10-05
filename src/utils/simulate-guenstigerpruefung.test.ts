import { describe, it, expect } from 'vitest'
import { simulate } from './simulate'
import type { SparplanElement } from './sparplan-utils'

describe('simulate with Günstigerprüfung', () => {
  const mockElement: SparplanElement = {
    type: 'sparplan',
    start: '2024-01',
    einzahlung: 50000, // Higher amount to generate more tax
    ter: 0,
    transactionCostPercent: 0,
    simulation: {},
  }

  const baseOptions = {
    startYear: 2024,
    endYear: 2024,
    elements: [mockElement],
    returnConfig: { mode: 'fixed' as const, fixedRate: 0.05 },
    steuerlast: 0.26375, // 26.375% Abgeltungssteuer
    simulationAnnual: 'yearly' as const,
    teilfreistellungsquote: 0.3, // 30%
    freibetragPerYear: { 2024: 0 }, // Remove tax allowance to test tax differences
    steuerReduzierenEndkapital: true,
  }

  it('should use Abgeltungssteuer when personal tax rate is higher', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 42, // 42% personal tax rate - higher than Abgeltungssteuer
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.isFavorable).toBe('abgeltungssteuer')
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.explanation).toContain('Abgeltungssteuer')
  })

  it('should use personal tax rate when it is lower', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 15, // 15% personal tax rate - lower than effective Abgeltungssteuer
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.isFavorable).toBe('personal')
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.explanation).toContain('Persönlicher Steuersatz')
  })

  it('should not perform Günstigerprüfung when disabled', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: false,
      personalTaxRate: 15,
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeUndefined()
  })

  it('should not perform Günstigerprüfung when personalTaxRate is undefined', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: undefined,
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeUndefined()
  })

  it('should calculate different tax amounts for Abgeltungssteuer vs personal tax', () => {
    const abgeltungssteuerResult = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 45, // High personal rate - should use Abgeltungssteuer
    })

    const personalTaxResult = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 10, // Very low personal rate - should use personal tax
    })

    const abgeltungssteuerData = abgeltungssteuerResult[0].simulation[2024]
    const personalTaxData = personalTaxResult[0].simulation[2024]

    // Check the Günstigerprüfung results first
    expect(abgeltungssteuerData.vorabpauschaleDetails?.guenstigerPruefungResult?.isFavorable).toBe('abgeltungssteuer')
    expect(personalTaxData.vorabpauschaleDetails?.guenstigerPruefungResult?.isFavorable).toBe('personal')

    // Then check the actual tax amounts
    expect(abgeltungssteuerData.bezahlteSteuer).toBeGreaterThan(personalTaxData.bezahlteSteuer)
  })

  it('should store both tax amounts for comparison in results', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 25,
    })

    const simulationData = result[0].simulation[2024]
    const pruefungResult = simulationData.vorabpauschaleDetails?.guenstigerPruefungResult

    expect(pruefungResult).toBeDefined()
    expect(pruefungResult?.abgeltungssteuerAmount).toBeGreaterThan(0)
    expect(pruefungResult?.personalTaxAmount).toBeGreaterThan(0)
    expect(pruefungResult?.usedTaxRate).toBeGreaterThan(0)
    expect(['abgeltungssteuer', 'personal', 'equal']).toContain(pruefungResult?.isFavorable)
    expect(pruefungResult?.explanation).toBeTruthy()
  })
})
