import { describe, it, expect } from 'vitest'
import { simulate } from './simulate'
import type { SparplanElement } from './sparplan-utils'

describe('simulate with Günstigerprüfung with Progressive Tax', () => {
  // Note: With progressive tax enabled, the behavior is different from flat tax rates.
  // The progressive system has built-in Grundfreibetrag (11,604€ tax-free) and lower rates
  // for lower incomes, which makes it more favorable than Abgeltungssteuer (26.375%)
  // for most typical investment returns.

  const mockElement: SparplanElement = {
    type: 'sparplan',
    start: '2024-01',
    einzahlung: 500000, // High amount to test progressive tax zones
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
    freibetragPerYear: { 2024: 0 }, // Remove Sparerpauschbetrag to isolate progressive tax effects
    steuerReduzierenEndkapital: true,
  }

  it('should use progressive tax and show favorable result for typical returns', () => {
    // With 500k investment @ 5% = 25k gain, after 30% Teilfreistellung = 17.5k taxable
    // Progressive tax on 17.5k is much lower than Abgeltungssteuer (26.375%)
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 42, // Even with high marginal rate input, effective rate will be much lower
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeDefined()
    
    const pruefung = simulationData.vorabpauschaleDetails?.guenstigerPruefungResult
    
    // Progressive tax should be favorable due to lower effective rate
    expect(pruefung?.isFavorable).toBe('personal')
    expect(pruefung?.explanation).toContain('Progressiver Tarif')
    
    // Personal tax amount should be less than Abgeltungssteuer
    expect(pruefung?.personalTaxAmount).toBeLessThan(pruefung?.abgeltungssteuerAmount ?? Infinity)
  })

  it('should use progressive tax for lower returns', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 15, // Lower marginal rate input
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.isFavorable).toBe('personal')
    // With progressive tax, the explanation should mention "Progressiver Tarif"
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.explanation).toContain(
      'Progressiver Tarif',
    )
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

  it('should perform Günstigerprüfung with progressive tax even when personalTaxRate is undefined', () => {
    // After the change, Günstigerprüfung now uses progressive tax and doesn't require personalTaxRate
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: undefined,
    })

    const simulationData = result[0].simulation[2024]
    expect(simulationData).toBeDefined()
    // Günstigerprüfung should be performed with progressive tax
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult).toBeDefined()
    expect(simulationData.vorabpauschaleDetails?.guenstigerPruefungResult?.explanation).toContain(
      'Progressiver Tarif',
    )
  })

  it('should calculate different tax amounts and choose the more favorable', () => {
    const result = simulate({
      ...baseOptions,
      guenstigerPruefungAktiv: true,
      personalTaxRate: 25,
    })

    const simulationData = result[0].simulation[2024]
    const pruefungResult = simulationData.vorabpauschaleDetails?.guenstigerPruefungResult

    expect(pruefungResult).toBeDefined()
    expect(pruefungResult?.abgeltungssteuerAmount).toBeGreaterThan(0)
    expect(pruefungResult?.personalTaxAmount).toBeGreaterThanOrEqual(0) // Can be 0 if below Grundfreibetrag
    expect(pruefungResult?.usedTaxRate).toBeGreaterThanOrEqual(0) // Can be 0 if personal tax is 0
    expect(['abgeltungssteuer', 'personal', 'equal']).toContain(pruefungResult?.isFavorable)
    expect(pruefungResult?.explanation).toBeTruthy()
    
    // With progressive tax, personal tax should typically be more favorable for typical returns
    expect(pruefungResult?.isFavorable).toBe('personal')
  })
})
