import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BucketStrategyConfiguration } from './bucket-strategy/BucketStrategyConfiguration'
import { RMDWithdrawalConfiguration } from './rmd-withdrawal/RMDWithdrawalConfiguration'
import { SimulationProvider } from '../contexts/SimulationContext'

describe('Unified Strategy Configurations', () => {
  describe('BucketStrategyConfiguration', () => {
    it('should work in form mode (unified strategy)', async () => {
      const formValue = {
        bucketConfig: {
          initialCashCushion: 25000,
          refillThreshold: 10000,
          refillPercentage: 0.6,
          baseWithdrawalRate: 0.035,
          subStrategy: 'variabel_prozent' as const,
          variabelProzent: 3.5,
        },
      }

      const updateFormValue = vi.fn()

      render(
        <BucketStrategyConfiguration
          formValue={formValue}
          updateFormValue={updateFormValue}
        />,
      )

      // Check that form values are displayed
      expect(screen.getByDisplayValue('25000')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10000')).toBeInTheDocument()
      expect(screen.getByText('3.5%')).toBeInTheDocument() // Variable percentage
      expect(screen.getByText('60%')).toBeInTheDocument() // Refill percentage

      // Check that the Variable Prozent strategy is selected
      expect(screen.getByRole('radio', { name: /Variable Prozent/ })).toBeChecked()

      // Check form mode specific text
      expect(screen.getByText('Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen')).toBeInTheDocument()
    })

    it('should work in direct mode (segmented strategy)', async () => {
      const values = {
        initialCashCushion: 15000,
        refillThreshold: 8000,
        refillPercentage: 0.4,
        baseWithdrawalRate: 0.045,
        subStrategy: 'variabel_prozent' as const,
        variabelProzent: 4.5,
      }

      const onChange = {
        onInitialCashCushionChange: vi.fn(),
        onRefillThresholdChange: vi.fn(),
        onRefillPercentageChange: vi.fn(),
        onBaseWithdrawalRateChange: vi.fn(),
        onSubStrategyChange: vi.fn(),
        onVariabelProzentChange: vi.fn(),
        onMonatlicheBetragChange: vi.fn(),
        onDynamischBasisrateChange: vi.fn(),
        onDynamischObereSchwell: vi.fn(),
        onDynamischObereAnpassung: vi.fn(),
        onDynamischUntereSchwell: vi.fn(),
        onDynamischUntereAnpassung: vi.fn(),
      }

      render(
        <BucketStrategyConfiguration
          values={values}
          onChange={onChange}
        />,
      )

      // Check that direct values are displayed
      expect(screen.getByDisplayValue('15000')).toBeInTheDocument()
      expect(screen.getByDisplayValue('8000')).toBeInTheDocument()
      expect(screen.getByText('4.5%')).toBeInTheDocument() // Variable percentage
      expect(screen.getByText('40%')).toBeInTheDocument() // Refill percentage

      // Check that the Variable Prozent strategy is selected
      expect(screen.getByRole('radio', { name: /Variable Prozent/ })).toBeChecked()

      // Check direct mode specific text
      expect(screen.getByText('Anfänglicher Cash-Puffer für negative Rendite-Jahre')).toBeInTheDocument()
    })

    it('should validate that both modes work', () => {
      // Test that form mode doesn't throw
      expect(() => {
        render(
          <BucketStrategyConfiguration
            formValue={{
              bucketConfig: {
                initialCashCushion: 25000,
                refillThreshold: 10000,
                refillPercentage: 0.6,
                baseWithdrawalRate: 0.035,
              },
            }}
            updateFormValue={() => {}}
          />,
        )
      }).not.toThrow()

      // Test that direct mode doesn't throw
      expect(() => {
        render(
          <BucketStrategyConfiguration
            values={{
              initialCashCushion: 15000,
              refillThreshold: 8000,
              refillPercentage: 0.4,
              baseWithdrawalRate: 0.045,
            }}
            onChange={{
              onInitialCashCushionChange: () => {},
              onRefillThresholdChange: () => {},
              onRefillPercentageChange: () => {},
              onBaseWithdrawalRateChange: () => {},
              onSubStrategyChange: () => {},
              onVariabelProzentChange: () => {},
              onMonatlicheBetragChange: () => {},
              onDynamischBasisrateChange: () => {},
              onDynamischObereSchwell: () => {},
              onDynamischObereAnpassung: () => {},
              onDynamischUntereSchwell: () => {},
              onDynamischUntereAnpassung: () => {},
            }}
          />,
        )
      }).not.toThrow()
    })
  })

  describe('RMDWithdrawalConfiguration', () => {
    it('should work in form mode (unified strategy)', async () => {
      const formValue = {
        // endOfLife moved to global configuration
        strategie: 'rmd' as const,
        rendite: 0.05,
        withdrawalFrequency: 'yearly' as const,
        inflationAktiv: false,
        inflationsrate: 0.02,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 0.1,
        variabelProzent: 0.04,
        dynamischBasisrate: 4,
        dynamischObereSchwell: 8,
        dynamischObereAnpassung: 5,
        dynamischUntereSchwell: 2,
        dynamischUntereAnpassung: -5,
        bucketConfig: {
          initialCashCushion: 20000,
          refillThreshold: 5000,
          refillPercentage: 0.5,
          baseWithdrawalRate: 0.04,
        },
        rmdStartAge: 67,
        kapitalerhaltNominalReturn: 7,
        kapitalerhaltInflationRate: 2,
        steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
        steueroptimierteEntnahmeTargetTaxRate: 0.26375,
        steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
        steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
        steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
        einkommensteuersatz: 0.42,
      }

      const updateFormValue = vi.fn()

      render(
        <SimulationProvider>
          <RMDWithdrawalConfiguration
            formValue={formValue}
            updateFormValue={updateFormValue}
          />
        </SimulationProvider>,
      )

      // Check that form values are displayed
      expect(screen.getByDisplayValue('67')).toBeInTheDocument()
      // Custom life expectancy is now global, not part of form value

      // Check form mode specific text
      expect(screen.getByText('Das Alter, mit dem die RMD-Entnahme beginnt (Standard: 65 Jahre)')).toBeInTheDocument()
      expect(screen.getByText('Datengrundlage für Lebenserwartung')).toBeInTheDocument()
    })

    it('should work in direct mode (segmented strategy)', async () => {
      const values = {
        startAge: 70,
        lifeExpectancyTable: 'german_2020_22' as const,
        customLifeExpectancy: undefined,
      }

      const onChange = {
        onStartAgeChange: vi.fn(),
        onLifeExpectancyTableChange: vi.fn(),
        onCustomLifeExpectancyChange: vi.fn(),
      }

      render(
        <SimulationProvider>
          <RMDWithdrawalConfiguration
            values={values}
            onChange={onChange}
          />
        </SimulationProvider>,
      )

      // Check that direct values are displayed
      expect(screen.getByDisplayValue('70')).toBeInTheDocument()

      // Check direct mode specific text
      expect(screen.getByText('Das Alter zu Beginn dieser Entnahme-Phase (wird für die Berechnung der Lebenserwartung verwendet)')).toBeInTheDocument()
      expect(screen.getByText('Sterbetabelle')).toBeInTheDocument()
    })

    it('should validate that both modes work', () => {
      // Test that form mode doesn't throw
      expect(() => {
        const formValue = {
          endOfLife: 2080,
          strategie: 'rmd' as const,
          rendite: 0.05,
          withdrawalFrequency: 'yearly' as const,
          inflationAktiv: false,
          inflationsrate: 0.02,
          monatlicheBetrag: 2000,
          guardrailsAktiv: false,
          guardrailsSchwelle: 0.1,
          variabelProzent: 0.04,
          dynamischBasisrate: 4,
          dynamischObereSchwell: 8,
          dynamischObereAnpassung: 5,
          dynamischUntereSchwell: 2,
          dynamischUntereAnpassung: -5,
          bucketConfig: {
            initialCashCushion: 20000,
            refillThreshold: 5000,
            refillPercentage: 0.5,
            baseWithdrawalRate: 0.04,
          },
          rmdStartAge: 65,
          kapitalerhaltNominalReturn: 7,
          kapitalerhaltInflationRate: 2,
          steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
          steueroptimierteEntnahmeTargetTaxRate: 0.26375,
          steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
          steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
          steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
          einkommensteuersatz: 0.42,
        }

        render(
          <SimulationProvider>
            <RMDWithdrawalConfiguration
              formValue={formValue}
              updateFormValue={() => {}}
            />
          </SimulationProvider>,
        )
      }).not.toThrow()

      // Test that direct mode doesn't throw
      expect(() => {
        render(
          <SimulationProvider>
            <RMDWithdrawalConfiguration
              values={{
                startAge: 70,
                lifeExpectancyTable: 'german_2020_22',
                customLifeExpectancy: undefined,
              }}
              onChange={{
                onStartAgeChange: () => {},
                onLifeExpectancyTableChange: () => {},
                onCustomLifeExpectancyChange: () => {},
              }}
            />
          </SimulationProvider>,
        )
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should throw error if BucketStrategyConfiguration has invalid props', () => {
      expect(() => {
        render(<BucketStrategyConfiguration />)
      }).toThrow('BucketStrategyConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
    })

    it('should throw error if RMDWithdrawalConfiguration has invalid props', () => {
      expect(() => {
        render(
          <SimulationProvider>
            <RMDWithdrawalConfiguration />
          </SimulationProvider>,
        )
      }).toThrow('RMDWithdrawalConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
    })
  })
})
