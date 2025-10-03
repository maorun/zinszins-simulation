import { describe, it, expect } from 'vitest'
import type { SegmentedComparisonStrategy } from './config-storage'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'

describe('Config Storage - Segmented Comparison Interface Tests', () => {
  it('validates SegmentedComparisonStrategy interface structure', () => {
    const mockSegmentedComparisonStrategy: SegmentedComparisonStrategy = {
      id: 'test-strategy-1',
      name: 'Conservative-Aggressive Mix',
      segments: [
        {
          id: 'early-phase',
          name: 'Early Conservative Phase',
          startYear: 2041,
          endYear: 2050,
          strategy: '3prozent' as WithdrawalStrategy,
          withdrawalFrequency: 'yearly',
          returnConfig: {
            mode: 'fixed',
            fixedRate: 0.04,
          },
          inflationConfig: {
            inflationRate: 0.02,
          },
          incomeTaxRate: 0.18,
          steuerReduzierenEndkapital: true,
        },
        {
          id: 'late-phase',
          name: 'Later Aggressive Phase',
          startYear: 2051,
          endYear: 2060,
          strategy: '4prozent' as WithdrawalStrategy,
          withdrawalFrequency: 'yearly',
          returnConfig: {
            mode: 'fixed',
            fixedRate: 0.06,
          },
          inflationConfig: {
            inflationRate: 0.02,
          },
          incomeTaxRate: 0.18,
          steuerReduzierenEndkapital: true,
        },
      ],
    }

    // Test interface compliance
    expect(mockSegmentedComparisonStrategy.id).toBe('test-strategy-1')
    expect(mockSegmentedComparisonStrategy.name).toBe('Conservative-Aggressive Mix')
    expect(mockSegmentedComparisonStrategy.segments).toHaveLength(2)

    const firstSegment = mockSegmentedComparisonStrategy.segments[0]
    expect(firstSegment.id).toBe('early-phase')
    expect(firstSegment.name).toBe('Early Conservative Phase')
    expect(firstSegment.startYear).toBe(2041)
    expect(firstSegment.endYear).toBe(2050)
    expect(firstSegment.strategy).toBe('3prozent')
    expect(firstSegment.withdrawalFrequency).toBe('yearly')
    expect(firstSegment.returnConfig.mode).toBe('fixed')
    expect(firstSegment.returnConfig.fixedRate).toBe(0.04)
    expect(firstSegment.inflationConfig?.inflationRate).toBe(0.02)
  })

  it('handles multiple withdrawal strategies correctly', () => {
    const strategies = ['3prozent', '4prozent', 'monatlich_fest', 'bucket_strategie', 'dynamisch'] as WithdrawalStrategy[]

    strategies.forEach((strategyType, index) => {
      const testStrategy: SegmentedComparisonStrategy = {
        id: `test-strategy-${index}`,
        name: `Test ${strategyType}`,
        segments: [
          {
            id: `segment-${index}`,
            name: `Phase ${index}`,
            startYear: 2041,
            endYear: 2050,
            strategy: strategyType,
            withdrawalFrequency: 'yearly',
            returnConfig: {
              mode: 'fixed',
              fixedRate: 0.05,
            },
            inflationConfig: {
              inflationRate: 0.02,
            },
            incomeTaxRate: 0.18,
            steuerReduzierenEndkapital: true,
          },
        ],
      }

      expect(testStrategy.segments[0].strategy).toBe(strategyType)
    })
  })

  it('validates segment configurations with different return modes', () => {
    const fixedReturnSegment = {
      id: 'fixed-segment',
      name: 'Fixed Return Phase',
      startYear: 2041,
      endYear: 2045,
      strategy: '4prozent' as WithdrawalStrategy,
      withdrawalFrequency: 'monthly',
      returnConfig: {
        mode: 'fixed',
        fixedRate: 0.05,
      },
      inflationConfig: {
        inflationRate: 0.025,
      },
      incomeTaxRate: 0.20,
      steuerReduzierenEndkapital: false,
    }

    expect(fixedReturnSegment.returnConfig.mode).toBe('fixed')
    expect(fixedReturnSegment.returnConfig.fixedRate).toBe(0.05)
    expect(fixedReturnSegment.withdrawalFrequency).toBe('monthly')
  })
})
