import { describe, expect, it } from 'vitest'
import {
  behavioralBiases,
  getBiasesByCategory,
  getAllCategories,
  searchBiases,
  type BehavioralBias,
} from './behavioral-finance'

describe('behavioral-finance', () => {
  describe('behavioralBiases', () => {
    it('should contain all expected biases', () => {
      expect(Object.keys(behavioralBiases)).toContain('lossAversion')
      expect(Object.keys(behavioralBiases)).toContain('dispositionEffect')
      expect(Object.keys(behavioralBiases)).toContain('herdingBias')
      expect(Object.keys(behavioralBiases)).toContain('recencyBias')
      expect(Object.keys(behavioralBiases)).toContain('overconfidence')
      expect(Object.keys(behavioralBiases)).toContain('anchoringBias')
      expect(Object.keys(behavioralBiases)).toContain('confirmationBias')
      expect(Object.keys(behavioralBiases)).toContain('mentalAccounting')
      expect(Object.keys(behavioralBiases)).toContain('fomo')
      expect(Object.keys(behavioralBiases)).toContain('hindsightBias')
      expect(Object.keys(behavioralBiases)).toContain('homeBias')
      expect(Object.keys(behavioralBiases)).toContain('illusionOfControl')
    })

    it('should have complete data for each bias', () => {
      Object.values(behavioralBiases).forEach(bias => {
        expect(bias.name).toBeTruthy()
        expect(bias.category).toBeTruthy()
        expect(bias.shortDescription).toBeTruthy()
        expect(bias.detailedExplanation).toBeTruthy()
        expect(bias.germanExample).toBeTruthy()
        expect(bias.howToAvoid).toBeTruthy()
      })
    })

    it('should have valid category values', () => {
      const validCategories: Array<BehavioralBias['category']> = ['Emotional', 'Cognitive', 'Social']

      Object.values(behavioralBiases).forEach(bias => {
        expect(validCategories).toContain(bias.category)
      })
    })

    it('should contain German language content', () => {
      const lossAversion = behavioralBiases.lossAversion
      expect(lossAversion.germanExample).toContain('DAX')
      expect(lossAversion.howToAvoid).toContain('Sie')
    })
  })

  describe('getBiasesByCategory', () => {
    it('should return emotional biases', () => {
      const emotionalBiases = getBiasesByCategory('Emotional')

      expect(emotionalBiases.length).toBeGreaterThan(0)
      expect(emotionalBiases.every(bias => bias.category === 'Emotional')).toBe(true)
      expect(emotionalBiases.some(bias => bias.name.includes('Verlustaversion'))).toBe(true)
    })

    it('should return cognitive biases', () => {
      const cognitiveBiases = getBiasesByCategory('Cognitive')

      expect(cognitiveBiases.length).toBeGreaterThan(0)
      expect(cognitiveBiases.every(bias => bias.category === 'Cognitive')).toBe(true)
      expect(cognitiveBiases.some(bias => bias.name.includes('Selbstüberschätzung'))).toBe(true)
    })

    it('should return social biases', () => {
      const socialBiases = getBiasesByCategory('Social')

      expect(socialBiases.length).toBeGreaterThan(0)
      expect(socialBiases.every(bias => bias.category === 'Social')).toBe(true)
      expect(socialBiases.some(bias => bias.name.includes('Herdentrieb'))).toBe(true)
    })
  })

  describe('getAllCategories', () => {
    it('should return all three categories', () => {
      const categories = getAllCategories()

      expect(categories).toHaveLength(3)
      expect(categories).toContain('Emotional')
      expect(categories).toContain('Cognitive')
      expect(categories).toContain('Social')
    })
  })

  describe('searchBiases', () => {
    it('should find biases by name', () => {
      const results = searchBiases('Verlust')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(bias => bias.name.includes('Verlustaversion'))).toBe(true)
    })

    it('should find biases by description', () => {
      const results = searchBiases('Gewinne')

      expect(results.length).toBeGreaterThan(0)
    })

    it('should be case-insensitive', () => {
      const lowerResults = searchBiases('verlust')
      const upperResults = searchBiases('VERLUST')

      expect(lowerResults.length).toBe(upperResults.length)
    })

    it('should return empty array for no matches', () => {
      const results = searchBiases('xyzabc123notfound')

      expect(results).toHaveLength(0)
    })

    it('should find biases in detailed explanation', () => {
      const results = searchBiases('DAX')

      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('bias relationships', () => {
    it('loss aversion should have related biases', () => {
      const lossAversion = behavioralBiases.lossAversion

      expect(lossAversion.relatedBiases).toBeDefined()
      expect(lossAversion.relatedBiases).toContain('dispositionEffect')
    })

    it('related biases should exist in the biases object', () => {
      Object.values(behavioralBiases).forEach(bias => {
        if (bias.relatedBiases) {
          bias.relatedBiases.forEach(relatedKey => {
            expect(behavioralBiases[relatedKey]).toBeDefined()
          })
        }
      })
    })
  })

  describe('content quality', () => {
    it('should have substantial German examples', () => {
      Object.values(behavioralBiases).forEach(bias => {
        expect(bias.germanExample.length).toBeGreaterThan(50)
      })
    })

    it('should have actionable avoidance tips', () => {
      Object.values(behavioralBiases).forEach(bias => {
        expect(bias.howToAvoid.length).toBeGreaterThan(30)
      })
    })

    it('should include specific German investment examples', () => {
      const hasDAX = Object.values(behavioralBiases).some(bias => bias.germanExample.includes('DAX'))
      const hasEuro = Object.values(behavioralBiases).some(bias => bias.germanExample.includes('€'))

      expect(hasDAX).toBe(true)
      expect(hasEuro).toBe(true)
    })
  })
})
