import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { WithdrawalStrategySummary } from './WithdrawalStrategySummary'
import type { WithdrawalFormValue } from '../utils/config-storage'

const baseFormValue: WithdrawalFormValue = {
  strategie: '4prozent',
  rendite: 5,
  withdrawalFrequency: 'yearly',
  inflationAktiv: false,
  inflationsrate: 2,
  monatlicheBetrag: 2000,
  guardrailsAktiv: false,
  guardrailsSchwelle: 10,
  variabelProzent: 5,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 8,
  dynamischObereAnpassung: 5,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -5,
  rmdStartAge: 65,
  kapitalerhaltNominalReturn: 7,
  kapitalerhaltInflationRate: 2,
  steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
  steueroptimierteEntnahmeTargetTaxRate: 0.26375,
  steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
  steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
}

describe('WithdrawalStrategySummary', () => {
  it('displays starting capital', () => {
    render(<WithdrawalStrategySummary startingCapital={500000} formValue={baseFormValue} />)

    expect(screen.getByText(/Startkapital bei Entnahme/)).toBeInTheDocument()
    expect(screen.getByText('500.000,00 €')).toBeInTheDocument()
  })

  it('displays expected return rate', () => {
    render(<WithdrawalStrategySummary startingCapital={500000} formValue={baseFormValue} />)

    expect(screen.getByText(/Erwartete Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/5.*Prozent p\.a\./)).toBeInTheDocument()
  })

  describe('4% Rule Strategy', () => {
    it('displays 4% rule withdrawal amount', () => {
      const formValue = { ...baseFormValue, strategie: '4prozent' as const }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Jährliche Entnahme.*4 Prozent.*Regel/)).toBeInTheDocument()
      expect(screen.getByText('20.000,00 €')).toBeInTheDocument()
    })
  })

  describe('3% Rule Strategy', () => {
    it('displays 3% rule withdrawal amount', () => {
      const formValue = { ...baseFormValue, strategie: '3prozent' as const }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Jährliche Entnahme.*3 Prozent.*Regel/)).toBeInTheDocument()
      expect(screen.getByText('15.000,00 €')).toBeInTheDocument()
    })
  })

  describe('Variable Percent Strategy', () => {
    it('displays variable percent withdrawal amount', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'variabel_prozent' as const,
        variabelProzent: 5,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Jährliche Entnahme.*5.*Prozent.*Regel/)).toBeInTheDocument()
      expect(screen.getByText('25.000,00 €')).toBeInTheDocument()
    })
  })

  describe('Monthly Fixed Strategy', () => {
    it('displays monthly and annual withdrawal amounts', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'monatlich_fest' as const,
        monatlicheBetrag: 2000,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Monatliche Entnahme.*Basis/)).toBeInTheDocument()
      expect(screen.getByText('2.000,00 €')).toBeInTheDocument()
      expect(screen.getByText(/Jährliche Entnahme.*Jahr 1/)).toBeInTheDocument()
      expect(screen.getByText('24.000,00 €')).toBeInTheDocument()
    })

    it('displays guardrails when active', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'monatlich_fest' as const,
        monatlicheBetrag: 2000,
        guardrailsAktiv: true,
        guardrailsSchwelle: 15,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Dynamische Anpassung/)).toBeInTheDocument()
      expect(screen.getByText(/Aktiviert/)).toBeInTheDocument()
      expect(screen.getByText(/Schwelle.*15/)).toBeInTheDocument()
    })

    it('does not display guardrails when inactive', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'monatlich_fest' as const,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.queryByText(/Dynamische Anpassung/)).not.toBeInTheDocument()
    })
  })

  describe('Dynamic Strategy', () => {
    it('displays base rate and annual withdrawal', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'dynamisch' as const,
        dynamischBasisrate: 4,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Basis-Entnahmerate/)).toBeInTheDocument()
      expect(screen.getByText(/4%/)).toBeInTheDocument()
      expect(screen.getByText(/Jährliche Basis-Entnahme/)).toBeInTheDocument()
      expect(screen.getByText('20.000,00 €')).toBeInTheDocument()
    })

    it('displays upper threshold configuration', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'dynamisch' as const,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Obere Schwelle/)).toBeInTheDocument()
      expect(screen.getByText(/8% Rendite/)).toBeInTheDocument()
      expect(screen.getByText(/\+5% Anpassung/)).toBeInTheDocument()
    })

    it('displays lower threshold configuration', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'dynamisch' as const,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Untere Schwelle/)).toBeInTheDocument()
      expect(screen.getByText(/2% Rendite/)).toBeInTheDocument()
      expect(screen.getByText(/-5% Anpassung/)).toBeInTheDocument()
    })
  })

  describe('Inflation Configuration', () => {
    it('displays inflation rate when active', () => {
      const formValue = {
        ...baseFormValue,
        inflationAktiv: true,
        inflationsrate: 2.5,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Inflationsrate/)).toBeInTheDocument()
      expect(screen.getByText(/2\.5% p\.a\./)).toBeInTheDocument()
      expect(screen.getByText(/Entnahmebeträge werden jährlich angepasst/)).toBeInTheDocument()
    })

    it('does not display inflation when inactive', () => {
      const formValue = {
        ...baseFormValue,
        inflationAktiv: false,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.queryByText(/Inflationsrate/)).not.toBeInTheDocument()
    })
  })

  describe('Grundfreibetrag Configuration', () => {
    it('displays Grundfreibetrag when active', () => {
      const formValue = {
        ...baseFormValue,
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 11604,
        einkommensteuersatz: 20,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Grundfreibetrag/)).toBeInTheDocument()
      expect(screen.getByText(/11\.604,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/pro Jahr/)).toBeInTheDocument()
      expect(screen.getByText(/Einkommensteuersatz.*20%/)).toBeInTheDocument()
    })

    it('displays Grundfreibetrag without tax rate when not set', () => {
      const formValue = {
        ...baseFormValue,
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 11604,
        einkommensteuersatz: 0,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/Grundfreibetrag/)).toBeInTheDocument()
      expect(screen.getByText(/11\.604,00 €/)).toBeInTheDocument()
      expect(screen.queryByText(/Einkommensteuersatz/)).not.toBeInTheDocument()
    })

    it('does not display Grundfreibetrag when inactive', () => {
      const formValue = {
        ...baseFormValue,
        grundfreibetragAktiv: false,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.queryByText(/Grundfreibetrag/)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero starting capital', () => {
      render(<WithdrawalStrategySummary startingCapital={0} formValue={baseFormValue} />)

      expect(screen.getAllByText('0,00 €')).toHaveLength(2) // Both starting capital and withdrawal amount
    })

    it('handles large starting capital', () => {
      render(<WithdrawalStrategySummary startingCapital={10000000} formValue={baseFormValue} />)

      expect(screen.getByText(/10\.000\.000,00 €/)).toBeInTheDocument()
    })

    it('handles negative dynamic adjustment', () => {
      const formValue = {
        ...baseFormValue,
        strategie: 'dynamisch' as const,
        dynamischObereAnpassung: -3,
      }

      render(<WithdrawalStrategySummary startingCapital={500000} formValue={formValue} />)

      expect(screen.getByText(/-3% Anpassung/)).toBeInTheDocument()
    })
  })
})
