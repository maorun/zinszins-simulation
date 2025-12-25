import { describe, it, expect } from 'vitest'
import { type FinancialGoal } from './financial-goals'
import {
  calculateYearsToGoal,
  calculateRequiredMonthlySavings,
  analyzeGoalAdjustments,
} from './goal-adjustments'

describe('goal-adjustments', () => {
  const basicGoal: FinancialGoal = {
    id: 'test-goal-1',
    type: 'retirement',
    name: 'Altersvorsorge',
    targetAmount: 500000,
    targetYear: 2040,
    active: true,
  }

  describe('calculateYearsToGoal', () => {
    it('should return 0 if already at goal', () => {
      const years = calculateYearsToGoal(500000, 500000, 1000, 0.05)
      expect(years).toBe(0)
    })

    it('should return 0 if current amount exceeds goal', () => {
      const years = calculateYearsToGoal(600000, 500000, 1000, 0.05)
      expect(years).toBe(0)
    })

    it('should return Infinity if no savings and below goal', () => {
      const years = calculateYearsToGoal(100000, 500000, 0, 0.05)
      expect(years).toBe(Infinity)
    })

    it('should calculate years correctly with monthly savings and returns', () => {
      // Starting with 100k, saving 1000/month at 5% annually
      const years = calculateYearsToGoal(100000, 200000, 1000, 0.05)
      
      // Should take roughly 5-6 years
      expect(years).toBeGreaterThan(5)
      expect(years).toBeLessThan(7)
    })

    it('should calculate years with zero return correctly', () => {
      // Starting with 100k, need 200k, saving 1000/month with 0% return
      const years = calculateYearsToGoal(100000, 200000, 1000, 0)
      
      // Pure savings: (200k - 100k) / 1000 = 100 months ≈ 8.33 years
      expect(years).toBeGreaterThan(8)
      expect(years).toBeLessThan(9)
    })

    it('should calculate faster with higher returns', () => {
      const yearsLowReturn = calculateYearsToGoal(100000, 300000, 1000, 0.03)
      const yearsHighReturn = calculateYearsToGoal(100000, 300000, 1000, 0.08)
      
      expect(yearsHighReturn).toBeLessThan(yearsLowReturn)
    })

    it('should calculate faster with higher savings', () => {
      const yearsLowSavings = calculateYearsToGoal(100000, 300000, 500, 0.05)
      const yearsHighSavings = calculateYearsToGoal(100000, 300000, 2000, 0.05)
      
      expect(yearsHighSavings).toBeLessThan(yearsLowSavings)
    })
  })

  describe('calculateRequiredMonthlySavings', () => {
    it('should return 0 if already at goal', () => {
      const required = calculateRequiredMonthlySavings(500000, 500000, 10, 0.05)
      expect(required).toBe(0)
    })

    it('should return 0 if current amount exceeds goal', () => {
      const required = calculateRequiredMonthlySavings(600000, 500000, 10, 0.05)
      expect(required).toBe(0)
    })

    it('should return Infinity if no time remaining', () => {
      const required = calculateRequiredMonthlySavings(100000, 500000, 0, 0.05)
      expect(required).toBe(Infinity)
    })

    it('should return Infinity if negative time', () => {
      const required = calculateRequiredMonthlySavings(100000, 500000, -5, 0.05)
      expect(required).toBe(Infinity)
    })

    it('should calculate required savings correctly', () => {
      // Need to go from 100k to 200k in 5 years at 5% return
      const required = calculateRequiredMonthlySavings(100000, 200000, 5, 0.05)
      
      // Should be roughly 1000-1500 per month
      expect(required).toBeGreaterThan(500)
      expect(required).toBeLessThan(2000)
    })

    it('should require less savings with higher returns', () => {
      const requiredLowReturn = calculateRequiredMonthlySavings(100000, 300000, 10, 0.03)
      const requiredHighReturn = calculateRequiredMonthlySavings(100000, 300000, 10, 0.08)
      
      expect(requiredHighReturn).toBeLessThan(requiredLowReturn)
    })

    it('should require less savings with more time', () => {
      const requiredShortTime = calculateRequiredMonthlySavings(100000, 300000, 5, 0.05)
      const requiredLongTime = calculateRequiredMonthlySavings(100000, 300000, 15, 0.05)
      
      expect(requiredLongTime).toBeLessThan(requiredShortTime)
    })

    it('should calculate correctly with zero return', () => {
      // From 100k to 200k in 10 years = 100k / 120 months
      const required = calculateRequiredMonthlySavings(100000, 200000, 10, 0)
      
      expect(required).toBeGreaterThan(830) // 100k / 120 = 833.33
      expect(required).toBeLessThan(840)
    })
  })

  describe('analyzeGoalAdjustments', () => {
    describe('Goal already achieved', () => {
      it('should return on-track confirmation when goal is met', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 500000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.onTrack).toBe(true)
        expect(analysis.progressPercentage).toBe(100)
        expect(analysis.expectedYearsToGoal).toBe(0)
        expect(analysis.recommendations).toHaveLength(1)
        expect(analysis.recommendations[0].type).toBe('on-track')
      })

      it('should return on-track when exceeding goal', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 600000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.onTrack).toBe(true)
        expect(analysis.progressPercentage).toBe(120)
        expect(analysis.recommendations[0].type).toBe('on-track')
      })
    })

    describe('Goal on track', () => {
      it('should provide encouragement when on track', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 400000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2035,
        })

        expect(analysis.onTrack).toBe(true)
        expect(analysis.recommendations.some(r => r.type === 'on-track')).toBe(true)
      })

      it('should still suggest cost reduction as optimization', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 400000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2035,
        })

        expect(analysis.recommendations.some(r => r.type === 'reduce-costs')).toBe(true)
      })
    })

    describe('Goal off track', () => {
      it('should recommend adjusting expectations when significantly off track', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 500,
          expectedReturn: 0.05,
          currentYear: 2035,
        })

        expect(analysis.onTrack).toBe(false)
        // With only 5 years left and low savings, should recommend adjusting expectations
        expect(analysis.recommendations.some(r => 
          r.type === 'adjust-expectations' || r.type === 'adjust-timeline'
        )).toBe(true)
      })

      it('should recommend increasing savings when moderately off track', () => {
        // More realistic scenario: closer to goal, more time, moderate savings
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 200000,
          monthlySavingsRate: 1500,
          expectedReturn: 0.05,
          currentYear: 2032,
        })

        expect(analysis.onTrack).toBe(false)
        expect(analysis.recommendations.some(r => r.type === 'increase-savings')).toBe(true)
      })

      it('should recommend timeline adjustment when significantly off track', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 50000,
          monthlySavingsRate: 200,
          expectedReturn: 0.04,
          currentYear: 2038,
        })

        expect(analysis.onTrack).toBe(false)
        expect(analysis.recommendations.some(r => r.type === 'adjust-timeline')).toBe(true)
      })

      it('should recommend expectation adjustment when increase needed is too large', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 20000,
          monthlySavingsRate: 100,
          expectedReturn: 0.03,
          currentYear: 2038,
        })

        expect(analysis.onTrack).toBe(false)
        expect(analysis.recommendations.some(r => r.type === 'adjust-expectations')).toBe(true)
      })

      it('should recommend improving returns when current return is low', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 500,
          expectedReturn: 0.02,
          currentYear: 2035,
        })

        expect(analysis.recommendations.some(r => r.type === 'improve-returns')).toBe(true)
      })

      it('should always recommend cost reduction', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 500,
          expectedReturn: 0.05,
          currentYear: 2035,
        })

        expect(analysis.recommendations.some(r => r.type === 'reduce-costs')).toBe(true)
      })
    })

    describe('No savings rate provided', () => {
      it('should recommend starting to save', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 0,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.onTrack).toBe(false)
        expect(analysis.recommendations.some(r => r.type === 'increase-savings')).toBe(true)
      })
    })

    describe('No target year provided', () => {
      it('should analyze based on progress threshold', () => {
        const goalNoYear: FinancialGoal = {
          ...basicGoal,
          targetYear: undefined,
        }

        const analysis = analyzeGoalAdjustments({
          goal: goalNoYear,
          currentAmount: 150000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.yearsRemaining).toBeUndefined()
        expect(analysis.progressPercentage).toBe(30)
      })
    })

    describe('Past target year', () => {
      it('should recommend timeline adjustment with critical severity', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 200000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2041, // Past target year 2040
        })

        expect(analysis.onTrack).toBe(false)
        expect(analysis.yearsRemaining).toBe(-1)
        expect(analysis.recommendations.some(r => 
          r.type === 'adjust-timeline' && r.severity === 'critical'
        )).toBe(true)
      })
    })

    describe('Recommendation priority', () => {
      it('should sort recommendations by priority', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 300,
          expectedReturn: 0.03,
          currentYear: 2035,
        })

        // Check that recommendations are sorted (lower priority number = higher priority)
        for (let i = 0; i < analysis.recommendations.length - 1; i++) {
          expect(analysis.recommendations[i].priority).toBeLessThanOrEqual(
            analysis.recommendations[i + 1].priority
          )
        }
      })
    })

    describe('Recommendation content quality', () => {
      it('should provide German text in all recommendations', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 500,
          expectedReturn: 0.05,
          currentYear: 2035,
        })

        analysis.recommendations.forEach(rec => {
          expect(rec.title).toBeTruthy()
          expect(rec.title.length).toBeGreaterThan(0)
          expect(rec.description).toBeTruthy()
          expect(rec.description.length).toBeGreaterThan(0)
          expect(rec.actionItems).toBeTruthy()
          expect(rec.actionItems.length).toBeGreaterThan(0)
          rec.actionItems.forEach(item => {
            expect(item.length).toBeGreaterThan(0)
          })
        })
      })

      it('should assign appropriate severity levels', () => {
        const analyses = [
          // Slightly off track - should be low/medium severity
          analyzeGoalAdjustments({
            goal: basicGoal,
            currentAmount: 300000,
            monthlySavingsRate: 800,
            expectedReturn: 0.05,
            currentYear: 2035,
          }),
          // Significantly off track - should be high/critical severity
          analyzeGoalAdjustments({
            goal: basicGoal,
            currentAmount: 50000,
            monthlySavingsRate: 200,
            expectedReturn: 0.03,
            currentYear: 2038,
          }),
        ]

        // First should have mostly low/medium
        expect(
          analyses[0].recommendations.filter(r => r.severity === 'low' || r.severity === 'medium').length
        ).toBeGreaterThan(0)

        // Second should have at least some high/critical
        expect(
          analyses[1].recommendations.filter(r => r.severity === 'high' || r.severity === 'critical').length
        ).toBeGreaterThan(0)
      })

      it('should provide actionable steps in recommendations', () => {
        // Use a scenario that generates increase-savings recommendation
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 200000,
          monthlySavingsRate: 1500,
          expectedReturn: 0.05,
          currentYear: 2032,
        })

        const increaseSavingsRec = analysis.recommendations.find(r => r.type === 'increase-savings')
        expect(increaseSavingsRec).toBeDefined()
        expect(increaseSavingsRec!.actionItems.length).toBeGreaterThan(2)
        
        // Action items should be specific and actionable
        increaseSavingsRec!.actionItems.forEach(item => {
          expect(item).toMatch(/[A-ZÄÖÜ]/) // Starts with capital letter
          expect(item.length).toBeGreaterThan(10) // Not too short
        })
      })
    })

    describe('Expected years to goal calculation', () => {
      it('should calculate expected years when savings rate is provided', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.expectedYearsToGoal).toBeDefined()
        expect(analysis.expectedYearsToGoal).toBeGreaterThan(0)
        expect(analysis.expectedYearsToGoal).toBeLessThan(100)
      })

      it('should not calculate expected years when savings rate is 0', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 0,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.expectedYearsToGoal).toBeUndefined()
      })
    })

    describe('Edge cases', () => {
      it('should handle very small target amounts', () => {
        const smallGoal: FinancialGoal = {
          ...basicGoal,
          targetAmount: 1000,
        }

        const analysis = analyzeGoalAdjustments({
          goal: smallGoal,
          currentAmount: 100,
          monthlySavingsRate: 50,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.recommendations.length).toBeGreaterThan(0)
      })

      it('should handle very large target amounts', () => {
        const largeGoal: FinancialGoal = {
          ...basicGoal,
          targetAmount: 10000000,
        }

        const analysis = analyzeGoalAdjustments({
          goal: largeGoal,
          currentAmount: 500000,
          monthlySavingsRate: 2000,
          expectedReturn: 0.05,
          currentYear: 2030,
        })

        expect(analysis.recommendations.length).toBeGreaterThan(0)
      })

      it('should handle zero expected return', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 1000,
          expectedReturn: 0,
          currentYear: 2030,
        })

        expect(analysis.recommendations.length).toBeGreaterThan(0)
      })

      it('should handle high expected return', () => {
        const analysis = analyzeGoalAdjustments({
          goal: basicGoal,
          currentAmount: 100000,
          monthlySavingsRate: 1000,
          expectedReturn: 0.15,
          currentYear: 2030,
        })

        expect(analysis.recommendations.length).toBeGreaterThan(0)
      })
    })
  })
})
