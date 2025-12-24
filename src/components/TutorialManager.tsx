import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { TutorialOverlay, TutorialCard } from './TutorialOverlay'
import {
  tutorials,
  getRecommendedTutorial,
  getTutorialsByCategory,
  getCategoryName,
  canStartTutorial as tutorialCanStart,
} from '../data/tutorials'
import { getCompletedTutorialIds, markTutorialCompleted, areTutorialsDismissed } from '../utils/tutorial-progress'
import { GraduationCap, ChevronDown } from 'lucide-react'

/**
 * Custom hook for tutorial manager logic
 */
function useTutorialManagerState() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTutorial, setCurrentTutorial] = useState<string | null>(null)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(getCompletedTutorialIds())
  const isDismissed = areTutorialsDismissed()

  const handleToggleOpen = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setCompletedTutorials(getCompletedTutorialIds())
    }
  }

  const handleStartTutorial = (tutorialId: string) => {
    setCurrentTutorial(tutorialId)
  }

  const handleCompleteTutorial = () => {
    if (currentTutorial) {
      markTutorialCompleted(currentTutorial)
      setCompletedTutorials(getCompletedTutorialIds())
      setCurrentTutorial(null)

      const recommended = getRecommendedTutorial(getCompletedTutorialIds())
      if (recommended) {
        setIsOpen(true)
      }
    }
  }

  const activeTutorial = currentTutorial ? tutorials.find(t => t.id === currentTutorial) : null

  return {
    isOpen,
    handleToggleOpen,
    currentTutorial,
    setCurrentTutorial,
    completedTutorials,
    isDismissed,
    activeTutorial,
    handleStartTutorial,
    handleCompleteTutorial,
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
 * Tutorial Card Content Component
 */
function TutorialCardContent({
  completedTutorials,
  onStartTutorial,
}: {
  completedTutorials: string[]
  onStartTutorial: (tutorialId: string) => void
}) {
  const categories = ['getting-started', 'savings', 'withdrawal', 'tax', 'advanced'] as const

  return (
    <CardContent className="space-y-6">
      {/* Description */}
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">
          Lernen Sie die wichtigsten Funktionen der Zinseszins-Simulation kennen
        </p>
      </div>

      {categories.map(category => (
        <TutorialCategorySection
          key={category}
          category={category}
          completedTutorials={completedTutorials}
          onStartTutorial={onStartTutorial}
        />
      ))}

      <div className="pt-4 border-t text-sm text-gray-600">
        <p>💡 Tipp: Absolvieren Sie die Tutorials in der vorgeschlagenen Reihenfolge für das beste Lernerlebnis.</p>
      </div>
    </CardContent>
  )
}

/**
 * Tutorial Manager Component
 *
 * Provides a collapsible card to access the tutorial system.
 */
export function TutorialManager() {
  const {
    isOpen,
    handleToggleOpen,
    setCurrentTutorial,
    completedTutorials,
    isDismissed,
    activeTutorial,
    handleStartTutorial,
    handleCompleteTutorial,
  } = useTutorialManagerState()

  if (isDismissed) {
    return null
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={handleToggleOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  📚 Interaktive Tutorials
                </CardTitle>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <TutorialCardContent completedTutorials={completedTutorials} onStartTutorial={handleStartTutorial} />
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
