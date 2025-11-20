import { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { TutorialOverlay, TutorialCard } from './TutorialOverlay'
import {
  tutorials,
  getRecommendedTutorial,
  getTutorialsByCategory,
  getCategoryName,
  canStartTutorial as tutorialCanStart,
} from '../data/tutorials'
import {
  getCompletedTutorialIds,
  markTutorialCompleted,
  areTutorialsDismissed,
  dismissAllTutorials,
} from '../utils/tutorial-progress'
import { GraduationCap, X } from 'lucide-react'

/**
 * Custom hook for tutorial manager logic
 */
function useTutorialManagerState() {
  const [showTutorialList, setShowTutorialList] = useState(false)
  const [currentTutorial, setCurrentTutorial] = useState<string | null>(null)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(getCompletedTutorialIds())
  const [isDismissed, setIsDismissed] = useState(areTutorialsDismissed())

  const handleOpenTutorialList = () => {
    setShowTutorialList(true)
    setCompletedTutorials(getCompletedTutorialIds())
  }

  const handleStartTutorial = (tutorialId: string) => {
    setCurrentTutorial(tutorialId)
    setShowTutorialList(false)
  }

  const handleCompleteTutorial = () => {
    if (currentTutorial) {
      markTutorialCompleted(currentTutorial)
      setCompletedTutorials(getCompletedTutorialIds())
      setCurrentTutorial(null)

      const recommended = getRecommendedTutorial(getCompletedTutorialIds())
      if (recommended) {
        setShowTutorialList(true)
      }
    }
  }

  const handleDismiss = () => {
    dismissAllTutorials()
    setIsDismissed(true)
    setShowTutorialList(false)
  }

  const activeTutorial = currentTutorial ? tutorials.find(t => t.id === currentTutorial) : null

  return {
    showTutorialList,
    setShowTutorialList,
    currentTutorial,
    setCurrentTutorial,
    completedTutorials,
    isDismissed,
    activeTutorial,
    handleOpenTutorialList,
    handleStartTutorial,
    handleCompleteTutorial,
    handleDismiss,
  }
}

/**
 * Tutorial Category Section
 */
function TutorialCategorySection({
  category,
  completedTutorials,
  onStartTutorial,
}: {
  category: 'getting-started' | 'savings' | 'withdrawal' | 'tax' | 'advanced'
  completedTutorials: string[]
  onStartTutorial: (tutorialId: string) => void
}) {
  const categoryTutorials = getTutorialsByCategory(category)
  if (categoryTutorials.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{getCategoryName(category)}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {categoryTutorials.map(tutorial => {
          const isCompleted = completedTutorials.includes(tutorial.id)
          const canStart = tutorialCanStart(tutorial.id, completedTutorials)

          return (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              onStart={() => onStartTutorial(tutorial.id)}
              completed={isCompleted}
              locked={!canStart}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Tutorial Selection Dialog Content
 */
function TutorialSelectionDialog({
  open,
  onClose,
  onStartTutorial,
  onDismiss,
  completedTutorials,
}: {
  open: boolean
  onClose: (open: boolean) => void
  onStartTutorial: (tutorialId: string) => void
  onDismiss: () => void
  completedTutorials: string[]
}) {
  const categories = ['getting-started', 'savings', 'withdrawal', 'tax', 'advanced'] as const

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">📚 Interaktive Tutorials</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Lernen Sie die wichtigsten Funktionen der Zinseszins-Simulation kennen
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map(category => (
            <TutorialCategorySection
              key={category}
              category={category}
              completedTutorials={completedTutorials}
              onStartTutorial={onStartTutorial}
            />
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-gray-600">
          <p>💡 Tipp: Absolvieren Sie die Tutorials in der vorgeschlagenen Reihenfolge für das beste Lernerlebnis.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Tutorial Manager Component
 *
 * Provides a button to open the tutorial selection dialog and manages
 * the tutorial system state and navigation.
 */
export function TutorialManager() {
  const {
    showTutorialList,
    setShowTutorialList,
    setCurrentTutorial,
    completedTutorials,
    isDismissed,
    activeTutorial,
    handleOpenTutorialList,
    handleStartTutorial,
    handleCompleteTutorial,
    handleDismiss,
  } = useTutorialManagerState()

  if (isDismissed) {
    return null
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpenTutorialList} className="gap-2">
        <GraduationCap className="h-4 w-4" />
        Tutorials
      </Button>

      <TutorialSelectionDialog
        open={showTutorialList}
        onClose={setShowTutorialList}
        onStartTutorial={handleStartTutorial}
        onDismiss={handleDismiss}
        completedTutorials={completedTutorials}
      />

      {activeTutorial && (
        <TutorialOverlay
          tutorial={activeTutorial}
          open={true}
          onClose={() => setCurrentTutorial(null)}
          onComplete={handleCompleteTutorial}
        />
      )}
    </>
  )
}
