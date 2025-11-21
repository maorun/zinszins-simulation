import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTutorialProgress,
  saveTutorialProgress,
  markTutorialCompleted,
  isTutorialCompleted,
  saveTutorialPosition,
  resetTutorialProgress,
  dismissAllTutorials,
  areTutorialsDismissed,
  enableTutorials,
  getCompletedTutorialIds,
  getTutorialCompletionPercentage,
  type TutorialProgress,
} from './tutorial-progress'

describe('tutorial-progress', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  describe('getTutorialProgress', () => {
    it('should return default progress when nothing is stored', () => {
      const progress = getTutorialProgress()
      
      expect(progress.completedTutorials).toEqual([])
      expect(progress.lastTutorialId).toBeUndefined()
      expect(progress.lastStepIndex).toBeUndefined()
      expect(progress.dismissed).toBeUndefined()
      expect(progress.lastUpdated).toBeDefined()
    })

    it('should return stored progress when available', () => {
      const storedProgress: TutorialProgress = {
        completedTutorials: ['tutorial-1', 'tutorial-2'],
        lastTutorialId: 'tutorial-3',
        lastStepIndex: 2,
        lastUpdated: Date.now(),
      }
      
      localStorage.setItem('tutorial-progress', JSON.stringify(storedProgress))
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials).toEqual(['tutorial-1', 'tutorial-2'])
      expect(progress.lastTutorialId).toBe('tutorial-3')
      expect(progress.lastStepIndex).toBe(2)
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('tutorial-progress', 'invalid-json')
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials).toEqual([])
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('saveTutorialProgress', () => {
    it('should save progress to localStorage', () => {
      const progress: TutorialProgress = {
        completedTutorials: ['tutorial-1'],
        lastUpdated: Date.now(),
      }
      
      saveTutorialProgress(progress)
      
      const stored = localStorage.getItem('tutorial-progress')
      expect(stored).toBeDefined()
      
      const parsed = JSON.parse(stored!) as TutorialProgress
      expect(parsed.completedTutorials).toEqual(['tutorial-1'])
    })

    it('should update lastUpdated timestamp when saving', () => {
      const oldTimestamp = Date.now() - 1000
      const progress: TutorialProgress = {
        completedTutorials: [],
        lastUpdated: oldTimestamp,
      }
      
      saveTutorialProgress(progress)
      
      const stored = localStorage.getItem('tutorial-progress')
      const parsed = JSON.parse(stored!) as TutorialProgress
      expect(parsed.lastUpdated).toBeGreaterThan(oldTimestamp)
    })

    it('should handle save errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage full')
      })
      
      const progress: TutorialProgress = {
        completedTutorials: [],
        lastUpdated: Date.now(),
      }
      
      saveTutorialProgress(progress)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('markTutorialCompleted', () => {
    it('should mark a tutorial as completed', () => {
      markTutorialCompleted('tutorial-1')
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials).toContain('tutorial-1')
    })

    it('should not add duplicate completions', () => {
      markTutorialCompleted('tutorial-1')
      markTutorialCompleted('tutorial-1')
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials.filter(id => id === 'tutorial-1')).toHaveLength(1)
    })

    it('should add multiple completed tutorials', () => {
      markTutorialCompleted('tutorial-1')
      markTutorialCompleted('tutorial-2')
      markTutorialCompleted('tutorial-3')
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials).toEqual(['tutorial-1', 'tutorial-2', 'tutorial-3'])
    })
  })

  describe('isTutorialCompleted', () => {
    it('should return false for uncompleted tutorial', () => {
      expect(isTutorialCompleted('tutorial-1')).toBe(false)
    })

    it('should return true for completed tutorial', () => {
      markTutorialCompleted('tutorial-1')
      expect(isTutorialCompleted('tutorial-1')).toBe(true)
    })

    it('should return false for different tutorial', () => {
      markTutorialCompleted('tutorial-1')
      expect(isTutorialCompleted('tutorial-2')).toBe(false)
    })
  })

  describe('saveTutorialPosition', () => {
    it('should save current tutorial and step', () => {
      saveTutorialPosition('tutorial-1', 3)
      
      const progress = getTutorialProgress()
      expect(progress.lastTutorialId).toBe('tutorial-1')
      expect(progress.lastStepIndex).toBe(3)
    })

    it('should update position when called multiple times', () => {
      saveTutorialPosition('tutorial-1', 0)
      saveTutorialPosition('tutorial-1', 1)
      saveTutorialPosition('tutorial-1', 2)
      
      const progress = getTutorialProgress()
      expect(progress.lastStepIndex).toBe(2)
    })

    it('should update tutorial when switching tutorials', () => {
      saveTutorialPosition('tutorial-1', 0)
      saveTutorialPosition('tutorial-2', 5)
      
      const progress = getTutorialProgress()
      expect(progress.lastTutorialId).toBe('tutorial-2')
      expect(progress.lastStepIndex).toBe(5)
    })
  })

  describe('resetTutorialProgress', () => {
    it('should clear all tutorial progress', () => {
      markTutorialCompleted('tutorial-1')
      saveTutorialPosition('tutorial-2', 3)
      
      resetTutorialProgress()
      
      const progress = getTutorialProgress()
      expect(progress.completedTutorials).toEqual([])
      expect(progress.lastTutorialId).toBeUndefined()
    })

    it('should remove item from localStorage', () => {
      markTutorialCompleted('tutorial-1')
      
      resetTutorialProgress()
      
      const stored = localStorage.getItem('tutorial-progress')
      expect(stored).toBeNull()
    })
  })

  describe('dismissAllTutorials', () => {
    it('should set dismissed flag to true', () => {
      dismissAllTutorials()
      
      const progress = getTutorialProgress()
      expect(progress.dismissed).toBe(true)
    })

    it('should persist dismissal', () => {
      dismissAllTutorials()
      
      const progress = getTutorialProgress()
      expect(progress.dismissed).toBe(true)
    })
  })

  describe('areTutorialsDismissed', () => {
    it('should return false by default', () => {
      expect(areTutorialsDismissed()).toBe(false)
    })

    it('should return true after dismissal', () => {
      dismissAllTutorials()
      expect(areTutorialsDismissed()).toBe(true)
    })
  })

  describe('enableTutorials', () => {
    it('should set dismissed flag to false', () => {
      dismissAllTutorials()
      enableTutorials()
      
      const progress = getTutorialProgress()
      expect(progress.dismissed).toBe(false)
    })

    it('should allow tutorials after dismissal', () => {
      dismissAllTutorials()
      expect(areTutorialsDismissed()).toBe(true)
      
      enableTutorials()
      expect(areTutorialsDismissed()).toBe(false)
    })
  })

  describe('getCompletedTutorialIds', () => {
    it('should return empty array when nothing completed', () => {
      expect(getCompletedTutorialIds()).toEqual([])
    })

    it('should return all completed tutorial IDs', () => {
      markTutorialCompleted('tutorial-1')
      markTutorialCompleted('tutorial-2')
      
      const completed = getCompletedTutorialIds()
      expect(completed).toEqual(['tutorial-1', 'tutorial-2'])
    })
  })

  describe('getTutorialCompletionPercentage', () => {
    it('should return 0 when nothing completed', () => {
      expect(getTutorialCompletionPercentage(5)).toBe(0)
    })

    it('should return 0 when total is 0', () => {
      expect(getTutorialCompletionPercentage(0)).toBe(0)
    })

    it('should calculate percentage correctly', () => {
      markTutorialCompleted('tutorial-1')
      markTutorialCompleted('tutorial-2')
      
      expect(getTutorialCompletionPercentage(4)).toBe(50)
    })

    it('should return 100 when all completed', () => {
      markTutorialCompleted('tutorial-1')
      markTutorialCompleted('tutorial-2')
      markTutorialCompleted('tutorial-3')
      
      expect(getTutorialCompletionPercentage(3)).toBe(100)
    })

    it('should handle fractional percentages', () => {
      markTutorialCompleted('tutorial-1')
      
      const percentage = getTutorialCompletionPercentage(3)
      expect(percentage).toBeCloseTo(33.33, 1)
    })
  })
})
