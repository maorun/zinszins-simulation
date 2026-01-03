import { describe, it, expect } from 'vitest'
import {
  getSentimentLevel,
  getSentimentColor,
  getSentimentLabel,
  calculateSentimentScore,
  getOverallInterpretation,
  getInvestmentRecommendation,
  getHistoricalContext,
  getMarketPsychologyState,
  marketIndicators,
  type MarketIndicator,
  type SentimentLevel,
} from './market-psychology'

describe('market-psychology', () => {
  describe('getSentimentLevel', () => {
    it('should return Extreme Fear for scores 0-20', () => {
      expect(getSentimentLevel(0)).toBe('Extreme Fear')
      expect(getSentimentLevel(10)).toBe('Extreme Fear')
      expect(getSentimentLevel(20)).toBe('Extreme Fear')
    })

    it('should return Fear for scores 21-40', () => {
      expect(getSentimentLevel(21)).toBe('Fear')
      expect(getSentimentLevel(30)).toBe('Fear')
      expect(getSentimentLevel(40)).toBe('Fear')
    })

    it('should return Neutral for scores 41-60', () => {
      expect(getSentimentLevel(41)).toBe('Neutral')
      expect(getSentimentLevel(50)).toBe('Neutral')
      expect(getSentimentLevel(60)).toBe('Neutral')
    })

    it('should return Greed for scores 61-80', () => {
      expect(getSentimentLevel(61)).toBe('Greed')
      expect(getSentimentLevel(70)).toBe('Greed')
      expect(getSentimentLevel(80)).toBe('Greed')
    })

    it('should return Extreme Greed for scores 81-100', () => {
      expect(getSentimentLevel(81)).toBe('Extreme Greed')
      expect(getSentimentLevel(90)).toBe('Extreme Greed')
      expect(getSentimentLevel(100)).toBe('Extreme Greed')
    })
  })

  describe('getSentimentColor', () => {
    it('should return correct color for each sentiment level', () => {
      expect(getSentimentColor('Extreme Fear')).toBe('bg-red-100 text-red-800 border-red-300')
      expect(getSentimentColor('Fear')).toBe('bg-orange-100 text-orange-800 border-orange-300')
      expect(getSentimentColor('Neutral')).toBe('bg-gray-100 text-gray-800 border-gray-300')
      expect(getSentimentColor('Greed')).toBe('bg-green-100 text-green-800 border-green-300')
      expect(getSentimentColor('Extreme Greed')).toBe('bg-emerald-100 text-emerald-800 border-emerald-300')
    })
  })

  describe('getSentimentLabel', () => {
    it('should return correct German label for each sentiment level', () => {
      expect(getSentimentLabel('Extreme Fear')).toBe('Extreme Angst')
      expect(getSentimentLabel('Fear')).toBe('Angst')
      expect(getSentimentLabel('Neutral')).toBe('Neutral')
      expect(getSentimentLabel('Greed')).toBe('Gier')
      expect(getSentimentLabel('Extreme Greed')).toBe('Extreme Gier')
    })
  })

  describe('calculateSentimentScore', () => {
    it('should calculate average of indicator values', () => {
      const testIndicators: Record<string, MarketIndicator> = {
        test1: {
          name: 'Test 1',
          germanName: 'Test 1',
          description: 'Test',
          currentValue: 40,
          interpretation: 'Test',
          source: 'Test',
        },
        test2: {
          name: 'Test 2',
          germanName: 'Test 2',
          description: 'Test',
          currentValue: 60,
          interpretation: 'Test',
          source: 'Test',
        },
      }

      expect(calculateSentimentScore(testIndicators)).toBe(50)
    })

    it('should return 50 for empty indicators', () => {
      expect(calculateSentimentScore({})).toBe(50)
    })

    it('should round to nearest integer', () => {
      const testIndicators: Record<string, MarketIndicator> = {
        test1: {
          name: 'Test 1',
          germanName: 'Test 1',
          description: 'Test',
          currentValue: 33,
          interpretation: 'Test',
          source: 'Test',
        },
        test2: {
          name: 'Test 2',
          germanName: 'Test 2',
          description: 'Test',
          currentValue: 34,
          interpretation: 'Test',
          source: 'Test',
        },
      }

      expect(calculateSentimentScore(testIndicators)).toBe(34) // (33+34)/2 = 33.5, rounds to 34
    })
  })

  describe('getOverallInterpretation', () => {
    it('should return interpretation for Extreme Fear', () => {
      const interpretation = getOverallInterpretation('Extreme Fear', 15)
      expect(interpretation).toContain('15/100')
      expect(interpretation).toContain('extreme Angst')
      expect(interpretation.toLowerCase()).toContain('einstiegschancen')
    })

    it('should return interpretation for Fear', () => {
      const interpretation = getOverallInterpretation('Fear', 35)
      expect(interpretation).toContain('35/100')
      expect(interpretation).toContain('Angst')
    })

    it('should return interpretation for Neutral', () => {
      const interpretation = getOverallInterpretation('Neutral', 50)
      expect(interpretation).toContain('50/100')
      expect(interpretation).toContain('ausgeglichen')
    })

    it('should return interpretation for Greed', () => {
      const interpretation = getOverallInterpretation('Greed', 70)
      expect(interpretation).toContain('70/100')
      expect(interpretation).toContain('Gier')
    })

    it('should return interpretation for Extreme Greed', () => {
      const interpretation = getOverallInterpretation('Extreme Greed', 90)
      expect(interpretation).toContain('90/100')
      expect(interpretation).toContain('extreme Gier')
      expect(interpretation.toLowerCase()).toContain('euphorie')
    })
  })

  describe('getInvestmentRecommendation', () => {
    const sentimentLevels: SentimentLevel[] = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']

    sentimentLevels.forEach((level) => {
      it(`should return recommendation for ${level}`, () => {
        const recommendation = getInvestmentRecommendation(level)
        expect(recommendation).toBeTruthy()
        expect(recommendation.length).toBeGreaterThan(20)
      })
    })

    it('should include emoji indicators', () => {
      const extremeFear = getInvestmentRecommendation('Extreme Fear')
      const extremeGreed = getInvestmentRecommendation('Extreme Greed')

      // Check for emoji presence without complex regex
      expect(extremeFear.length).toBeGreaterThan(20)
      expect(extremeGreed.length).toBeGreaterThan(20)
      expect(extremeFear).toContain('🎯')
      expect(extremeGreed).toContain('🛑')
    })
  })

  describe('getHistoricalContext', () => {
    const sentimentLevels: SentimentLevel[] = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']

    sentimentLevels.forEach((level) => {
      it(`should return historical context for ${level}`, () => {
        const context = getHistoricalContext(level)
        expect(context).toBeTruthy()
        expect(context).toContain('📚')
        expect(context).toContain('Historischer Kontext')
      })
    })

    it('should reference specific historical events for Extreme Fear', () => {
      const context = getHistoricalContext('Extreme Fear')
      expect(context.toLowerCase()).toMatch(/2020|2008|2002|corona|finanzkrise|dotcom/)
    })

    it('should reference specific historical events for Extreme Greed', () => {
      const context = getHistoricalContext('Extreme Greed')
      expect(context.toLowerCase()).toMatch(/1999|2000|2007|2021|dotcom|blase/)
    })
  })

  describe('marketIndicators', () => {
    it('should have all required indicators', () => {
      const requiredIndicators = [
        'volatilityIndex',
        'putCallRatio',
        'marketMomentum',
        'junkBondDemand',
        'safeHavenDemand',
        'marketBreadth',
        'sentimentSurveys',
      ]

      requiredIndicators.forEach((key) => {
        expect(marketIndicators[key]).toBeDefined()
      })
    })

    it('should have valid structure for each indicator', () => {
      Object.values(marketIndicators).forEach((indicator) => {
        expect(indicator.name).toBeTruthy()
        expect(indicator.germanName).toBeTruthy()
        expect(indicator.description).toBeTruthy()
        expect(indicator.currentValue).toBeGreaterThanOrEqual(0)
        expect(indicator.currentValue).toBeLessThanOrEqual(100)
        expect(indicator.interpretation).toBeTruthy()
        expect(indicator.source).toBeTruthy()
      })
    })

    it('should have German names for all indicators', () => {
      Object.values(marketIndicators).forEach((indicator) => {
        expect(indicator.germanName).toBeTruthy()
        expect(indicator.germanName.length).toBeGreaterThan(3)
      })
    })

    it('should have educational lastUpdate field', () => {
      Object.values(marketIndicators).forEach((indicator) => {
        expect(indicator.lastUpdate).toBe('Beispielwert für Bildungszwecke')
      })
    })
  })

  describe('getMarketPsychologyState', () => {
    it('should return complete psychology state', () => {
      const state = getMarketPsychologyState()

      expect(state.overallSentiment).toBeDefined()
      expect(state.sentimentScore).toBeGreaterThanOrEqual(0)
      expect(state.sentimentScore).toBeLessThanOrEqual(100)
      expect(state.indicators).toBeDefined()
      expect(state.interpretation).toBeTruthy()
      expect(state.recommendation).toBeTruthy()
      expect(state.historicalContext).toBeTruthy()
    })

    it('should have consistent sentiment level and score', () => {
      const state = getMarketPsychologyState()
      const expectedSentiment = getSentimentLevel(state.sentimentScore)

      expect(state.overallSentiment).toBe(expectedSentiment)
    })

    it('should include all market indicators', () => {
      const state = getMarketPsychologyState()
      const indicatorKeys = Object.keys(state.indicators)

      expect(indicatorKeys.length).toBeGreaterThanOrEqual(7)
      expect(indicatorKeys).toContain('volatilityIndex')
      expect(indicatorKeys).toContain('putCallRatio')
      expect(indicatorKeys).toContain('marketMomentum')
    })

    it('should have matching interpretation for sentiment', () => {
      const state = getMarketPsychologyState()
      const expectedInterpretation = getOverallInterpretation(state.overallSentiment, state.sentimentScore)

      expect(state.interpretation).toBe(expectedInterpretation)
    })

    it('should have matching recommendation for sentiment', () => {
      const state = getMarketPsychologyState()
      const expectedRecommendation = getInvestmentRecommendation(state.overallSentiment)

      expect(state.recommendation).toBe(expectedRecommendation)
    })

    it('should have matching historical context for sentiment', () => {
      const state = getMarketPsychologyState()
      const expectedContext = getHistoricalContext(state.overallSentiment)

      expect(state.historicalContext).toBe(expectedContext)
    })
  })

  describe('integration tests', () => {
    it('should handle full workflow from indicators to state', () => {
      // Get current state
      const state = getMarketPsychologyState()

      // Verify sentiment level matches score
      const derivedSentiment = getSentimentLevel(state.sentimentScore)
      expect(state.overallSentiment).toBe(derivedSentiment)

      // Verify color is valid
      const color = getSentimentColor(state.overallSentiment)
      expect(color).toContain('bg-')
      expect(color).toContain('text-')
      expect(color).toContain('border-')

      // Verify German label exists
      const label = getSentimentLabel(state.overallSentiment)
      expect(label).toBeTruthy()

      // Verify all text fields are populated
      expect(state.interpretation.length).toBeGreaterThan(50)
      expect(state.recommendation.length).toBeGreaterThan(50)
      expect(state.historicalContext.length).toBeGreaterThan(50)
    })

    it('should provide educational value through detailed descriptions', () => {
      const state = getMarketPsychologyState()

      // Each indicator should have educational content
      Object.values(state.indicators).forEach((indicator) => {
        expect(indicator.description.length).toBeGreaterThan(30)
        expect(indicator.interpretation.length).toBeGreaterThan(30)
      })

      // Overall state should provide context
      expect(state.interpretation).toContain('Score')
      expect(state.historicalContext).toContain('Historischer Kontext')
    })
  })
})
