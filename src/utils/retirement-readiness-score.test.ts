import { describe, it, expect } from 'vitest'
import {
  calculateRetirementReadinessScore,
  getScoreDescription,
  getScoreRecommendations,
  type RetirementReadinessMetrics,
} from './retirement-readiness-score'
import type { EnhancedSummary } from './summary-utils'
import type { WithdrawalResult } from '../../helpers/withdrawal'

describe('retirement-readiness-score', () => {
  describe('calculateRetirementReadinessScore', () => {
    it('should return null when enhancedSummary is null', () => {
      const result = calculateRetirementReadinessScore(null, {} as WithdrawalResult, 20, 25)
      expect(result).toBeNull()
    })

    it('should return null when withdrawalResult is null', () => {
      const enhancedSummary = {
        startkapital: 100000,
        endkapital: 500000,
        zinsen: 400000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 5.0,
      } as EnhancedSummary

      const result = calculateRetirementReadinessScore(enhancedSummary, null, 20, 25)
      expect(result).toBeNull()
    })

    it('should calculate excellent score (90+) for well-funded retirement', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 100000,
        endkapital: 1000000, // 1M capital
        zinsen: 900000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 5.0,
        monatlicheAuszahlung: 3500, // 3500€/month (42k/year = 4.2% withdrawal rate)
        jahreEntspharphase: 25,
        endkapitalEntspharphase: 800000, // Still 800k remaining
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 1000000, entnahme: 42000, endkapital: 980000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
        2041: { startkapital: 980000, entnahme: 42000, endkapital: 960000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
        2042: { startkapital: 960000, entnahme: 42000, endkapital: 940000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 25, 25)

      expect(result).not.toBeNull()
      expect(result!.overallScore).toBeGreaterThanOrEqual(90)
      expect(result!.scoreLabel).toBe('Ausgezeichnet')
      expect(result!.capitalCoverage).toBeGreaterThan(80)
      expect(result!.incomeReplacement).toBeGreaterThan(80)
      expect(result!.sustainabilityScore).toBeGreaterThan(80)
    })

    it('should calculate good score (75-89) for adequately funded retirement', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 100000,
        endkapital: 600000, // 600k capital
        zinsen: 500000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 5.0,
        monatlicheAuszahlung: 2500, // 2500€/month (30k/year = 5% withdrawal rate)
        jahreEntspharphase: 25,
        endkapitalEntspharphase: 300000, // 300k remaining (50% of start)
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 600000, entnahme: 30000, endkapital: 580000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
        2041: { startkapital: 580000, entnahme: 30000, endkapital: 560000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 25, 25)

      expect(result).not.toBeNull()
      expect(result!.overallScore).toBeGreaterThanOrEqual(75)
      expect(result!.overallScore).toBeLessThan(90)
      expect(result!.scoreLabel).toBe('Gut')
    })

    it('should calculate satisfactory score (60-74) for moderately funded retirement', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 100000,
        endkapital: 400000, // 400k capital
        zinsen: 300000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 5.0,
        monatlicheAuszahlung: 2200, // 2200€/month (26.4k/year = 6.6% withdrawal rate)
        jahreEntspharphase: 20,
        endkapitalEntspharphase: 100000, // 100k remaining (25% of start)
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 400000, entnahme: 26400, endkapital: 380000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
        2041: { startkapital: 380000, entnahme: 26400, endkapital: 360000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 20, 25)

      expect(result).not.toBeNull()
      expect(result!.overallScore).toBeGreaterThanOrEqual(60)
      expect(result!.overallScore).toBeLessThan(75)
      expect(result!.scoreLabel).toBe('Befriedigend')
    })

    it('should calculate poor score (<60) for underfunded retirement', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 50000,
        endkapital: 200000, // Only 200k capital
        zinsen: 150000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 5.0,
        monatlicheAuszahlung: 1200, // 1200€/month (14.4k/year = 7.2% withdrawal rate - too high)
        jahreEntspharphase: 15,
        endkapitalEntspharphase: 10000, // Almost depleted
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 200000, entnahme: 14400, endkapital: 190000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
        2041: { startkapital: 190000, entnahme: 14400, endkapital: 180000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 15, 25)

      expect(result).not.toBeNull()
      expect(result!.overallScore).toBeLessThan(60)
      expect(result!.scoreLabel).toMatch(/Ausreichend|Verbesserungswürdig/)
    })

    it('should handle zero monthly withdrawal gracefully', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 100000,
        endkapital: 500000,
        zinsen: 400000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 5.0,
        monatlicheAuszahlung: 0, // No withdrawals planned
        jahreEntspharphase: 25,
        endkapitalEntspharphase: 500000,
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 500000, entnahme: 0, endkapital: 500000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 25, 25)

      expect(result).not.toBeNull()
      expect(result!.monthlyIncome).toBe(0)
      expect(result!.incomeReplacement).toBe(0)
    })

    it('should calculate correct metrics for realistic scenario', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 100000,
        endkapital: 750000,
        zinsen: 650000,
        bezahlteSteuer: 50000,
        renditeAnsparphase: 5.5,
        monatlicheAuszahlung: 3000, // 3000€/month
        jahreEntspharphase: 25,
        endkapitalEntspharphase: 500000,
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 750000, entnahme: 36000, endkapital: 730000, bezahlteSteuer: 5000, genutzterFreibetrag: 1000, zinsen: 20000 },
        2041: { startkapital: 730000, entnahme: 36000, endkapital: 710000, bezahlteSteuer: 5000, genutzterFreibetrag: 1000, zinsen: 20000 },
        2042: { startkapital: 710000, entnahme: 36000, endkapital: 690000, bezahlteSteuer: 5000, genutzterFreibetrag: 1000, zinsen: 20000 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 25, 25)

      expect(result).not.toBeNull()
      expect(result!.totalCapital).toBe(750000)
      expect(result!.monthlyIncome).toBe(3000)
      expect(result!.estimatedAnnualExpenses).toBe(36000)
      expect(result!.remainingCapital).toBe(500000)
      expect(result!.totalWithdrawn).toBe(108000) // 36k * 3 years
      expect(result!.sustainabilityYears).toBe(25)
    })

    it('should cap capital coverage at 100%', () => {
      const enhancedSummary: EnhancedSummary = {
        startkapital: 100000,
        endkapital: 2000000, // Very high capital (2M)
        zinsen: 1900000,
        bezahlteSteuer: 0,
        renditeAnsparphase: 6.0,
        monatlicheAuszahlung: 3000, // Only 36k/year withdrawal (1.8% rate)
        jahreEntspharphase: 30,
        endkapitalEntspharphase: 1800000,
      }

      const withdrawalResult: WithdrawalResult = {
        2040: { startkapital: 2000000, entnahme: 36000, endkapital: 1980000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0 },
      }

      const result = calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, 30, 25)

      expect(result).not.toBeNull()
      expect(result!.capitalCoverage).toBe(100) // Should be capped at 100
    })
  })

  describe('getScoreDescription', () => {
    it('should return excellent description for score >= 90', () => {
      const description = getScoreDescription(95)
      expect(description).toContain('hervorragend')
      expect(description).toContain('ausreichend Kapital')
    })

    it('should return good description for score 75-89', () => {
      const description = getScoreDescription(82)
      expect(description).toContain('gut aufgestellt')
      expect(description).toContain('Optimierungen')
    })

    it('should return satisfactory description for score 60-74', () => {
      const description = getScoreDescription(67)
      expect(description).toContain('zufriedenstellend')
      expect(description).toContain('Verbesserungspotenzial')
    })

    it('should return needs attention description for score 40-59', () => {
      const description = getScoreDescription(50)
      expect(description).toContain('benötigt Aufmerksamkeit')
      expect(description).toContain('Sparrate')
    })

    it('should return critical description for score < 40', () => {
      const description = getScoreDescription(30)
      expect(description).toContain('nicht ausreichend')
      expect(description).toContain('Dringender Handlungsbedarf')
    })
  })

  describe('getScoreRecommendations', () => {
    it('should recommend increasing savings for low capital coverage', () => {
      const metrics: RetirementReadinessMetrics = {
        overallScore: 60,
        scoreLabel: 'Befriedigend',
        capitalCoverage: 60,
        incomeReplacement: 80,
        sustainabilityYears: 25,
        sustainabilityScore: 80,
        totalCapital: 300000,
        estimatedAnnualExpenses: 24000,
        totalWithdrawn: 600000,
        remainingCapital: 200000,
        monthlyIncome: 2000,
      }

      const recommendations = getScoreRecommendations(metrics)
      expect(recommendations).toContain('💰 Erhöhen Sie Ihre monatlichen Sparraten, um mehr Kapital aufzubauen.')
    })

    it('should recommend higher withdrawal or income sources for low income replacement', () => {
      const metrics: RetirementReadinessMetrics = {
        overallScore: 65,
        scoreLabel: 'Befriedigend',
        capitalCoverage: 85,
        incomeReplacement: 60,
        sustainabilityYears: 25,
        sustainabilityScore: 80,
        totalCapital: 500000,
        estimatedAnnualExpenses: 24000,
        totalWithdrawn: 600000,
        remainingCapital: 300000,
        monthlyIncome: 2000,
      }

      const recommendations = getScoreRecommendations(metrics)
      expect(recommendations).toContain('📊 Planen Sie eine höhere Entnahmerate oder bauen Sie zusätzliche Einkommensquellen auf.')
    })

    it('should recommend extending savings phase for low sustainability', () => {
      const metrics: RetirementReadinessMetrics = {
        overallScore: 65,
        scoreLabel: 'Befriedigend',
        capitalCoverage: 85,
        incomeReplacement: 80,
        sustainabilityYears: 20,
        sustainabilityScore: 60,
        totalCapital: 500000,
        estimatedAnnualExpenses: 30000,
        totalWithdrawn: 600000,
        remainingCapital: 100000,
        monthlyIncome: 2500,
      }

      const recommendations = getScoreRecommendations(metrics)
      expect(recommendations).toContain('⏱️ Verlängern Sie die Ansparphase oder reduzieren Sie die Entnahmerate für mehr Nachhaltigkeit.')
    })

    it('should warn about capital depletion', () => {
      const metrics: RetirementReadinessMetrics = {
        overallScore: 55,
        scoreLabel: 'Ausreichend',
        capitalCoverage: 70,
        incomeReplacement: 75,
        sustainabilityYears: 20,
        sustainabilityScore: 50,
        totalCapital: 400000,
        estimatedAnnualExpenses: 30000,
        totalWithdrawn: 600000,
        remainingCapital: 50000, // Less than 25% of start
        monthlyIncome: 2500,
      }

      const recommendations = getScoreRecommendations(metrics)
      expect(recommendations).toContain('⚠️ Ihr Kapital wird voraussichtlich stark schrumpfen. Überdenken Sie Ihre Entnahmestrategie.')
    })

    it('should provide positive feedback for excellent scores', () => {
      const metrics: RetirementReadinessMetrics = {
        overallScore: 95,
        scoreLabel: 'Ausgezeichnet',
        capitalCoverage: 100,
        incomeReplacement: 100,
        sustainabilityYears: 30,
        sustainabilityScore: 100,
        totalCapital: 1000000,
        estimatedAnnualExpenses: 40000,
        totalWithdrawn: 1200000,
        remainingCapital: 800000,
        monthlyIncome: 3333,
      }

      const recommendations = getScoreRecommendations(metrics)
      expect(recommendations).toHaveLength(1)
      expect(recommendations[0]).toContain('✅')
      expect(recommendations[0]).toContain('solide')
    })

    it('should provide multiple recommendations for poor overall scores', () => {
      const metrics: RetirementReadinessMetrics = {
        overallScore: 45,
        scoreLabel: 'Ausreichend',
        capitalCoverage: 50,
        incomeReplacement: 60,
        sustainabilityYears: 15,
        sustainabilityScore: 50,
        totalCapital: 250000,
        estimatedAnnualExpenses: 24000,
        totalWithdrawn: 360000,
        remainingCapital: 30000, // Less than 25%
        monthlyIncome: 2000,
      }

      const recommendations = getScoreRecommendations(metrics)
      expect(recommendations.length).toBeGreaterThanOrEqual(3)
    })
  })
})
