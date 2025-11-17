import { describe, it, expect } from 'vitest'
import {
  getRecommendedMonths,
  calculateTargetAmount,
  calculateEmergencyFundStatus,
  getInvestmentEligibleCapital,
  getReserveAllocationRecommendation,
  getEmploymentTypeLabel,
  getReserveStrategyLabel,
  getReserveStrategyDescription,
  defaultEmergencyFundConfig,
  type EmergencyFundConfig,
  type ReserveStrategy,
} from './emergency-fund'

describe('emergency-fund', () => {
  describe('getRecommendedMonths', () => {
    it('should return correct months for employee with different strategies', () => {
      expect(getRecommendedMonths('employee', 'conservative')).toBe(6)
      expect(getRecommendedMonths('employee', 'balanced')).toBe(4)
      expect(getRecommendedMonths('employee', 'aggressive')).toBe(3)
    })

    it('should return correct months for self-employed with different strategies', () => {
      expect(getRecommendedMonths('self-employed', 'conservative')).toBe(12)
      expect(getRecommendedMonths('self-employed', 'balanced')).toBe(9)
      expect(getRecommendedMonths('self-employed', 'aggressive')).toBe(6)
    })

    it('should return correct months for retired with different strategies', () => {
      expect(getRecommendedMonths('retired', 'conservative')).toBe(3)
      expect(getRecommendedMonths('retired', 'balanced')).toBe(2)
      expect(getRecommendedMonths('retired', 'aggressive')).toBe(1)
    })
  })

  describe('calculateTargetAmount', () => {
    it('should calculate correct target amount', () => {
      expect(calculateTargetAmount(2000, 3)).toBe(6000)
      expect(calculateTargetAmount(3000, 6)).toBe(18000)
      expect(calculateTargetAmount(1500, 12)).toBe(18000)
    })

    it('should handle zero monthly expenses', () => {
      expect(calculateTargetAmount(0, 6)).toBe(0)
    })

    it('should handle zero target months', () => {
      expect(calculateTargetAmount(2000, 0)).toBe(0)
    })
  })

  describe('calculateEmergencyFundStatus', () => {
    const baseConfig: EmergencyFundConfig = {
      enabled: true,
      monthlyExpenses: 2000,
      targetMonths: 6,
      employmentType: 'employee',
      reserveStrategy: 'balanced',
      excludeFromInvestment: false,
    }

    it('should calculate status when fully funded', () => {
      const status = calculateEmergencyFundStatus(12000, baseConfig)

      expect(status.currentAmount).toBe(12000)
      expect(status.targetAmount).toBe(12000)
      expect(status.progress).toBe(100)
      expect(status.isFunded).toBe(true)
      expect(status.shortfall).toBe(0)
      expect(status.monthsCovered).toBe(6)
      expect(status.recommendedMonths).toBe(4) // balanced employee
    })

    it('should calculate status when partially funded', () => {
      const status = calculateEmergencyFundStatus(6000, baseConfig)

      expect(status.currentAmount).toBe(6000)
      expect(status.targetAmount).toBe(12000)
      expect(status.progress).toBe(50)
      expect(status.isFunded).toBe(false)
      expect(status.shortfall).toBe(6000)
      expect(status.monthsCovered).toBe(3)
    })

    it('should calculate status when overfunded', () => {
      const status = calculateEmergencyFundStatus(15000, baseConfig)

      expect(status.currentAmount).toBe(15000)
      expect(status.targetAmount).toBe(12000)
      expect(status.progress).toBe(125)
      expect(status.isFunded).toBe(true)
      expect(status.shortfall).toBe(0)
      expect(status.monthsCovered).toBe(7.5)
    })

    it('should calculate status when no capital', () => {
      const status = calculateEmergencyFundStatus(0, baseConfig)

      expect(status.currentAmount).toBe(0)
      expect(status.targetAmount).toBe(12000)
      expect(status.progress).toBe(0)
      expect(status.isFunded).toBe(false)
      expect(status.shortfall).toBe(12000)
      expect(status.monthsCovered).toBe(0)
    })

    it('should respect excludeFromInvestment flag', () => {
      const configExcluded: EmergencyFundConfig = {
        ...baseConfig,
        excludeFromInvestment: true,
      }

      const status = calculateEmergencyFundStatus(15000, configExcluded)

      // When excluded, currentAmount is capped at targetAmount
      expect(status.currentAmount).toBe(12000)
      expect(status.targetAmount).toBe(12000)
      expect(status.progress).toBe(100)
      expect(status.isFunded).toBe(true)
    })

    it('should handle zero monthly expenses', () => {
      const configZeroExpenses: EmergencyFundConfig = {
        ...baseConfig,
        monthlyExpenses: 0,
      }

      const status = calculateEmergencyFundStatus(10000, configZeroExpenses)

      expect(status.targetAmount).toBe(0)
      expect(status.progress).toBe(0)
      expect(status.monthsCovered).toBe(0)
    })

    it('should calculate recommended months based on employment type', () => {
      const selfEmployedConfig: EmergencyFundConfig = {
        ...baseConfig,
        employmentType: 'self-employed',
        reserveStrategy: 'conservative',
      }

      const status = calculateEmergencyFundStatus(12000, selfEmployedConfig)
      expect(status.recommendedMonths).toBe(12) // conservative self-employed
    })
  })

  describe('getInvestmentEligibleCapital', () => {
    const baseConfig: EmergencyFundConfig = {
      enabled: true,
      monthlyExpenses: 2000,
      targetMonths: 6,
      employmentType: 'employee',
      reserveStrategy: 'balanced',
      excludeFromInvestment: true,
    }

    it('should exclude emergency fund when flag is set', () => {
      const eligible = getInvestmentEligibleCapital(20000, baseConfig)
      expect(eligible).toBe(8000) // 20000 - (2000 * 6)
    })

    it('should return full capital when excludeFromInvestment is false', () => {
      const config: EmergencyFundConfig = {
        ...baseConfig,
        excludeFromInvestment: false,
      }

      const eligible = getInvestmentEligibleCapital(20000, config)
      expect(eligible).toBe(20000)
    })

    it('should return full capital when emergency fund is disabled', () => {
      const config: EmergencyFundConfig = {
        ...baseConfig,
        enabled: false,
      }

      const eligible = getInvestmentEligibleCapital(20000, config)
      expect(eligible).toBe(20000)
    })

    it('should return zero when capital is less than emergency fund', () => {
      const eligible = getInvestmentEligibleCapital(10000, baseConfig)
      expect(eligible).toBe(0) // 10000 < 12000 target
    })

    it('should handle exact match', () => {
      const eligible = getInvestmentEligibleCapital(12000, baseConfig)
      expect(eligible).toBe(0) // Exactly the target amount
    })

    it('should handle zero capital', () => {
      const eligible = getInvestmentEligibleCapital(0, baseConfig)
      expect(eligible).toBe(0)
    })
  })

  describe('getReserveAllocationRecommendation', () => {
    it('should return conservative allocation', () => {
      const allocation = getReserveAllocationRecommendation('conservative')
      expect(allocation.checking).toBe(30)
      expect(allocation.savings).toBe(60)
      expect(allocation.shortTerm).toBe(10)
      // Total should be 100%
      expect(allocation.checking + allocation.savings + allocation.shortTerm).toBe(100)
    })

    it('should return balanced allocation', () => {
      const allocation = getReserveAllocationRecommendation('balanced')
      expect(allocation.checking).toBe(20)
      expect(allocation.savings).toBe(50)
      expect(allocation.shortTerm).toBe(30)
      expect(allocation.checking + allocation.savings + allocation.shortTerm).toBe(100)
    })

    it('should return aggressive allocation', () => {
      const allocation = getReserveAllocationRecommendation('aggressive')
      expect(allocation.checking).toBe(10)
      expect(allocation.savings).toBe(40)
      expect(allocation.shortTerm).toBe(50)
      expect(allocation.checking + allocation.savings + allocation.shortTerm).toBe(100)
    })
  })

  describe('getEmploymentTypeLabel', () => {
    it('should return correct German labels', () => {
      expect(getEmploymentTypeLabel('employee')).toBe('Angestellter')
      expect(getEmploymentTypeLabel('self-employed')).toBe('Selbstständig')
      expect(getEmploymentTypeLabel('retired')).toBe('Rentner')
    })
  })

  describe('getReserveStrategyLabel', () => {
    it('should return correct German labels', () => {
      expect(getReserveStrategyLabel('conservative')).toBe('Konservativ')
      expect(getReserveStrategyLabel('balanced')).toBe('Ausgewogen')
      expect(getReserveStrategyLabel('aggressive')).toBe('Aggressiv')
    })
  })

  describe('getReserveStrategyDescription', () => {
    it('should return non-empty descriptions for all strategies', () => {
      const strategies: ReserveStrategy[] = ['conservative', 'balanced', 'aggressive']

      strategies.forEach(strategy => {
        const description = getReserveStrategyDescription(strategy)
        expect(description).toBeTruthy()
        expect(description.length).toBeGreaterThan(20)
      })
    })

    it('should return German descriptions', () => {
      expect(getReserveStrategyDescription('conservative')).toContain('Liquidität')
      expect(getReserveStrategyDescription('balanced')).toContain('Ausgewogen')
      expect(getReserveStrategyDescription('aggressive')).toContain('Rendite')
    })
  })

  describe('defaultEmergencyFundConfig', () => {
    it('should have sensible defaults', () => {
      expect(defaultEmergencyFundConfig.enabled).toBe(false)
      expect(defaultEmergencyFundConfig.monthlyExpenses).toBe(2000)
      expect(defaultEmergencyFundConfig.targetMonths).toBe(3)
      expect(defaultEmergencyFundConfig.employmentType).toBe('employee')
      expect(defaultEmergencyFundConfig.reserveStrategy).toBe('balanced')
      expect(defaultEmergencyFundConfig.excludeFromInvestment).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should handle typical employee scenario', () => {
      const config: EmergencyFundConfig = {
        enabled: true,
        monthlyExpenses: 2500,
        targetMonths: 6,
        employmentType: 'employee',
        reserveStrategy: 'balanced',
        excludeFromInvestment: true,
      }

      const status = calculateEmergencyFundStatus(30000, config)

      expect(status.targetAmount).toBe(15000)
      expect(status.currentAmount).toBe(15000)
      expect(status.isFunded).toBe(true)
      expect(status.monthsCovered).toBe(6)
      expect(status.recommendedMonths).toBe(4)

      const investmentCapital = getInvestmentEligibleCapital(30000, config)
      expect(investmentCapital).toBe(15000)
    })

    it('should handle self-employed with higher reserve needs', () => {
      const config: EmergencyFundConfig = {
        enabled: true,
        monthlyExpenses: 3000,
        targetMonths: 12,
        employmentType: 'self-employed',
        reserveStrategy: 'conservative',
        excludeFromInvestment: true,
      }

      const status = calculateEmergencyFundStatus(40000, config)

      expect(status.targetAmount).toBe(36000)
      expect(status.currentAmount).toBe(36000)
      expect(status.isFunded).toBe(true)
      expect(status.recommendedMonths).toBe(12)

      const investmentCapital = getInvestmentEligibleCapital(40000, config)
      expect(investmentCapital).toBe(4000)
    })

    it('should handle retired person with lower reserve needs', () => {
      const config: EmergencyFundConfig = {
        enabled: true,
        monthlyExpenses: 1800,
        targetMonths: 2,
        employmentType: 'retired',
        reserveStrategy: 'balanced',
        excludeFromInvestment: true,
      }

      const status = calculateEmergencyFundStatus(10000, config)

      expect(status.targetAmount).toBe(3600)
      expect(status.currentAmount).toBe(3600)
      expect(status.isFunded).toBe(true)
      expect(status.recommendedMonths).toBe(2)

      const investmentCapital = getInvestmentEligibleCapital(10000, config)
      expect(investmentCapital).toBe(6400)
    })
  })
})
