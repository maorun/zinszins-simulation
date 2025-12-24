/**
 * Tutorial Progress Tracking
 *
 * This module handles storing and retrieving tutorial progress in localStorage.
 * Progress includes which tutorials have been completed and which steps were reached.
 */

const TUTORIAL_PROGRESS_KEY = 'tutorial-progress'

export interface TutorialProgress {
  /** IDs of completed tutorials */
  completedTutorials: string[]
  /** Last accessed tutorial ID */
  lastTutorialId?: string
  /** Last step index for the last accessed tutorial */
  lastStepIndex?: number
  /** Whether the user dismissed all tutorials */
  dismissed?: boolean
  /** Timestamp of last update */
  lastUpdated: number
}

/**
 * Get tutorial progress from localStorage
 */
export function getTutorialProgress(): TutorialProgress {
  try {
    const stored = localStorage.getItem(TUTORIAL_PROGRESS_KEY)
    if (!stored) {
      return {
        completedTutorials: [],
        lastUpdated: Date.now(),
      }
    }

    const progress = JSON.parse(stored) as TutorialProgress
    return progress
  } catch (error) {
    console.error('Error reading tutorial progress:', error)
    return {
      completedTutorials: [],
      lastUpdated: Date.now(),
    }
  }
}

/**
 * Save tutorial progress to localStorage
 */
export function saveTutorialProgress(progress: TutorialProgress): void {
  try {
    const updatedProgress = {
      ...progress,
      lastUpdated: Date.now(),
    }
    localStorage.setItem(TUTORIAL_PROGRESS_KEY, JSON.stringify(updatedProgress))
  } catch (error) {
    console.error('Error saving tutorial progress:', error)
  }
}

/**
 * Mark a tutorial as completed
 */
export function markTutorialCompleted(tutorialId: string): void {
  const progress = getTutorialProgress()

  if (!progress.completedTutorials.includes(tutorialId)) {
    progress.completedTutorials.push(tutorialId)
    saveTutorialProgress(progress)
  }
}

/**
 * Check if a tutorial is completed
 */
export function isTutorialCompleted(tutorialId: string): boolean {
  const progress = getTutorialProgress()
  return progress.completedTutorials.includes(tutorialId)
}

/**
 * Save current tutorial position
 */
export function saveTutorialPosition(tutorialId: string, stepIndex: number): void {
  const progress = getTutorialProgress()
  progress.lastTutorialId = tutorialId
  progress.lastStepIndex = stepIndex
  saveTutorialProgress(progress)
}

/**
 * Reset tutorial progress (useful for testing or restarting tutorials)
 */
export function resetTutorialProgress(): void {
  localStorage.removeItem(TUTORIAL_PROGRESS_KEY)
}

/**
 * Dismiss all tutorials
 */
export function dismissAllTutorials(): void {
  const progress = getTutorialProgress()
  progress.dismissed = true
  saveTutorialProgress(progress)
}

/**
 * Check if tutorials are dismissed
 */
export function areTutorialsDismissed(): boolean {
  const progress = getTutorialProgress()
  return progress.dismissed === true
}

/**
 * Re-enable tutorials after dismissal
 */
export function enableTutorials(): void {
  const progress = getTutorialProgress()
  progress.dismissed = false
  saveTutorialProgress(progress)
}

/**
 * Get all completed tutorial IDs
 */
export function getCompletedTutorialIds(): string[] {
  const progress = getTutorialProgress()
  return progress.completedTutorials
}

/**
 * Get completion percentage (0-100)
 */
export function getTutorialCompletionPercentage(totalTutorials: number): number {
  const progress = getTutorialProgress()
  if (totalTutorials === 0) return 0
  return (progress.completedTutorials.length / totalTutorials) * 100
}
