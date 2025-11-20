import { describe, it, expect } from 'vitest'
import {
  tutorials,
  getTutorialById,
  getTutorialsByCategory,
  getAllTutorialCategories,
  getCategoryName,
  canStartTutorial,
  getRecommendedTutorial,
  type Tutorial,
} from './tutorials'

describe('tutorials', () => {
  describe('tutorials data', () => {
    it('should have at least 5 tutorials', () => {
      expect(tutorials.length).toBeGreaterThanOrEqual(5)
    })

    it('should have unique IDs for all tutorials', () => {
      const ids = tutorials.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have all required fields for each tutorial', () => {
      tutorials.forEach(tutorial => {
        expect(tutorial.id).toBeDefined()
        expect(tutorial.name).toBeDefined()
        expect(tutorial.description).toBeDefined()
        expect(tutorial.category).toBeDefined()
        expect(tutorial.icon).toBeDefined()
        expect(tutorial.estimatedMinutes).toBeGreaterThan(0)
        expect(tutorial.steps).toBeDefined()
        expect(tutorial.steps.length).toBeGreaterThan(0)
      })
    })

    it('should have unique step IDs within each tutorial', () => {
      tutorials.forEach(tutorial => {
        const stepIds = tutorial.steps.map(s => s.id)
        const uniqueStepIds = new Set(stepIds)
        expect(uniqueStepIds.size).toBe(stepIds.length)
      })
    })

    it('should have all required fields for each step', () => {
      tutorials.forEach(tutorial => {
        tutorial.steps.forEach(step => {
          expect(step.id).toBeDefined()
          expect(step.title).toBeDefined()
          expect(step.description).toBeDefined()
        })
      })
    })

    it('should have valid prerequisite references', () => {
      const allIds = new Set(tutorials.map(t => t.id))
      tutorials.forEach(tutorial => {
        if (tutorial.prerequisites) {
          tutorial.prerequisites.forEach(prereqId => {
            expect(allIds.has(prereqId)).toBe(true)
          })
        }
      })
    })
  })

  describe('getTutorialById', () => {
    it('should return tutorial for valid ID', () => {
      const tutorial = getTutorialById('welcome')
      expect(tutorial).toBeDefined()
      expect(tutorial?.id).toBe('welcome')
      expect(tutorial?.name).toContain('Willkommen')
    })

    it('should return tutorial for savings-plan-basics', () => {
      const tutorial = getTutorialById('savings-plan-basics')
      expect(tutorial).toBeDefined()
      expect(tutorial?.id).toBe('savings-plan-basics')
      expect(tutorial?.category).toBe('savings')
    })

    it('should return undefined for invalid ID', () => {
      const tutorial = getTutorialById('non-existent-id')
      expect(tutorial).toBeUndefined()
    })

    it('should return correct tutorial for tax-configuration', () => {
      const tutorial = getTutorialById('tax-configuration')
      expect(tutorial).toBeDefined()
      expect(tutorial?.category).toBe('tax')
      expect(tutorial?.icon).toBe('🧾')
    })
  })

  describe('getTutorialsByCategory', () => {
    it('should return tutorials for getting-started category', () => {
      const gettingStarted = getTutorialsByCategory('getting-started')
      expect(gettingStarted.length).toBeGreaterThan(0)
      gettingStarted.forEach(tutorial => {
        expect(tutorial.category).toBe('getting-started')
      })
    })

    it('should return tutorials for savings category', () => {
      const savings = getTutorialsByCategory('savings')
      expect(savings.length).toBeGreaterThan(0)
      savings.forEach(tutorial => {
        expect(tutorial.category).toBe('savings')
      })
    })

    it('should return tutorials for withdrawal category', () => {
      const withdrawal = getTutorialsByCategory('withdrawal')
      expect(withdrawal.length).toBeGreaterThan(0)
      withdrawal.forEach(tutorial => {
        expect(tutorial.category).toBe('withdrawal')
      })
    })

    it('should return tutorials for tax category', () => {
      const tax = getTutorialsByCategory('tax')
      expect(tax.length).toBeGreaterThan(0)
      tax.forEach(tutorial => {
        expect(tutorial.category).toBe('tax')
      })
    })

    it('should return tutorials for advanced category', () => {
      const advanced = getTutorialsByCategory('advanced')
      expect(advanced.length).toBeGreaterThan(0)
      advanced.forEach(tutorial => {
        expect(tutorial.category).toBe('advanced')
      })
    })

    it('should return empty array for non-existent category', () => {
      const result = getTutorialsByCategory('non-existent' as Tutorial['category'])
      expect(result).toEqual([])
    })
  })

  describe('getAllTutorialCategories', () => {
    it('should return all 5 categories', () => {
      const categories = getAllTutorialCategories()
      expect(categories).toHaveLength(5)
      expect(categories).toContain('getting-started')
      expect(categories).toContain('savings')
      expect(categories).toContain('withdrawal')
      expect(categories).toContain('tax')
      expect(categories).toContain('advanced')
    })

    it('should return categories in correct order', () => {
      const categories = getAllTutorialCategories()
      expect(categories[0]).toBe('getting-started')
      expect(categories[1]).toBe('savings')
      expect(categories[2]).toBe('withdrawal')
      expect(categories[3]).toBe('tax')
      expect(categories[4]).toBe('advanced')
    })
  })

  describe('getCategoryName', () => {
    it('should return German name for getting-started', () => {
      expect(getCategoryName('getting-started')).toBe('Erste Schritte')
    })

    it('should return German name for savings', () => {
      expect(getCategoryName('savings')).toBe('Sparpläne')
    })

    it('should return German name for withdrawal', () => {
      expect(getCategoryName('withdrawal')).toBe('Entnahme')
    })

    it('should return German name for tax', () => {
      expect(getCategoryName('tax')).toBe('Steuern')
    })

    it('should return German name for advanced', () => {
      expect(getCategoryName('advanced')).toBe('Erweitert')
    })
  })

  describe('canStartTutorial', () => {
    it('should allow starting welcome tutorial with no completed tutorials', () => {
      expect(canStartTutorial('welcome', [])).toBe(true)
    })

    it('should not allow starting tutorial with unsatisfied prerequisites', () => {
      expect(canStartTutorial('savings-plan-basics', [])).toBe(false)
    })

    it('should allow starting tutorial when prerequisites are satisfied', () => {
      expect(canStartTutorial('savings-plan-basics', ['welcome'])).toBe(true)
    })

    it('should allow starting tutorial with no prerequisites', () => {
      expect(canStartTutorial('welcome', [])).toBe(true)
    })

    it('should not allow starting tax-configuration without welcome', () => {
      expect(canStartTutorial('tax-configuration', [])).toBe(false)
    })

    it('should allow starting tax-configuration with welcome completed', () => {
      expect(canStartTutorial('tax-configuration', ['welcome'])).toBe(true)
    })

    it('should not allow starting withdrawal-strategies without prerequisites', () => {
      expect(canStartTutorial('withdrawal-strategies', ['welcome'])).toBe(false)
    })

    it('should allow starting withdrawal-strategies with all prerequisites', () => {
      expect(canStartTutorial('withdrawal-strategies', ['welcome', 'savings-plan-basics'])).toBe(true)
    })

    it('should return false for non-existent tutorial', () => {
      expect(canStartTutorial('non-existent', [])).toBe(false)
    })

    it('should handle extra completed tutorials gracefully', () => {
      expect(canStartTutorial('welcome', ['some-other-tutorial', 'another-one'])).toBe(true)
    })
  })

  describe('getRecommendedTutorial', () => {
    it('should recommend welcome tutorial when no tutorials completed', () => {
      const recommended = getRecommendedTutorial([])
      expect(recommended).toBeDefined()
      expect(recommended?.id).toBe('welcome')
    })

    it('should recommend next tutorial after welcome is completed', () => {
      const recommended = getRecommendedTutorial(['welcome'])
      expect(recommended).toBeDefined()
      expect(recommended?.id).not.toBe('welcome')
      
      // Should recommend either savings-plan-basics or tax-configuration
      // (both have only welcome as prerequisite)
      expect(['savings-plan-basics', 'tax-configuration', 'monte-carlo-analysis']).toContain(
        recommended?.id
      )
    })

    it('should not recommend already completed tutorials', () => {
      const recommended = getRecommendedTutorial(['welcome', 'savings-plan-basics'])
      expect(recommended).toBeDefined()
      expect(recommended?.id).not.toBe('welcome')
      expect(recommended?.id).not.toBe('savings-plan-basics')
    })

    it('should only recommend tutorials with satisfied prerequisites', () => {
      const recommended = getRecommendedTutorial(['welcome'])
      expect(recommended).toBeDefined()
      
      if (recommended && recommended.prerequisites) {
        const allPrereqsSatisfied = recommended.prerequisites.every(prereq =>
          ['welcome'].includes(prereq)
        )
        expect(allPrereqsSatisfied).toBe(true)
      }
    })

    it('should return undefined when all tutorials are completed', () => {
      const allIds = tutorials.map(t => t.id)
      const recommended = getRecommendedTutorial(allIds)
      expect(recommended).toBeUndefined()
    })

    it('should handle partial completion correctly', () => {
      const completed = ['welcome', 'tax-configuration']
      const recommended = getRecommendedTutorial(completed)
      
      if (recommended) {
        expect(completed).not.toContain(recommended.id)
        
        if (recommended.prerequisites) {
          recommended.prerequisites.forEach(prereq => {
            expect(completed).toContain(prereq)
          })
        }
      }
    })
  })

  describe('tutorial content quality', () => {
    it('should have German language content', () => {
      tutorials.forEach(tutorial => {
        // Check for German-specific characters/words
        const germanContent = [tutorial.name, tutorial.description].join(' ')
        const hasGermanChars = /[äöüÄÖÜß]/.test(germanContent)
        expect(hasGermanChars || germanContent.includes('Steuer') || germanContent.includes('Sie')).toBe(true)
      })
    })

    it('should have reasonable estimated time (1-15 minutes)', () => {
      tutorials.forEach(tutorial => {
        expect(tutorial.estimatedMinutes).toBeGreaterThanOrEqual(1)
        expect(tutorial.estimatedMinutes).toBeLessThanOrEqual(15)
      })
    })

    it('should have at least 3 steps per tutorial', () => {
      tutorials.forEach(tutorial => {
        expect(tutorial.steps.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('should have intro and complete steps', () => {
      tutorials.forEach(tutorial => {
        const firstStep = tutorial.steps[0]
        const lastStep = tutorial.steps[tutorial.steps.length - 1]
        
        // First step should be intro-like
        expect(firstStep.id).toContain('intro')
        
        // Last step should be complete/finish-like
        expect(lastStep.id).toContain('complete')
      })
    })
  })

  describe('specific tutorial content', () => {
    it('welcome tutorial should have correct structure', () => {
      const welcome = getTutorialById('welcome')
      expect(welcome).toBeDefined()
      expect(welcome?.category).toBe('getting-started')
      expect(welcome?.prerequisites).toBeUndefined()
      expect(welcome?.steps.length).toBeGreaterThanOrEqual(4)
    })

    it('savings-plan-basics should require welcome', () => {
      const savings = getTutorialById('savings-plan-basics')
      expect(savings).toBeDefined()
      expect(savings?.prerequisites).toContain('welcome')
      expect(savings?.category).toBe('savings')
    })

    it('tax-configuration should cover German tax topics', () => {
      const tax = getTutorialById('tax-configuration')
      expect(tax).toBeDefined()
      
      const allContent = tax?.steps.map(s => s.title + ' ' + s.description).join(' ')
      expect(allContent).toContain('Vorabpauschale')
      expect(allContent).toContain('Teilfreistellung')
      expect(allContent).toContain('Sparerpauschbetrag')
    })

    it('withdrawal-strategies should require both welcome and savings-plan-basics', () => {
      const withdrawal = getTutorialById('withdrawal-strategies')
      expect(withdrawal).toBeDefined()
      expect(withdrawal?.prerequisites).toContain('welcome')
      expect(withdrawal?.prerequisites).toContain('savings-plan-basics')
    })

    it('monte-carlo-analysis should be in advanced category', () => {
      const monteCarlo = getTutorialById('monte-carlo-analysis')
      expect(monteCarlo).toBeDefined()
      expect(monteCarlo?.category).toBe('advanced')
    })
  })
})
