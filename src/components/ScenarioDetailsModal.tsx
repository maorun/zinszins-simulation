import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import { Play } from 'lucide-react'
import type { FinancialScenario } from '../data/scenarios'
import { ScenarioConfigurationOverview } from './ScenarioConfigurationOverview'
import { ScenarioLearningPoints, ScenarioRisks, ScenarioSuitability } from './ScenarioInfoSections'

interface ScenarioDetailsModalProps {
  scenario: FinancialScenario | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
}

/**
 * Modal component to display detailed information about a financial scenario
 */
export function ScenarioDetailsModal({ scenario, isOpen, onOpenChange, onApply }: ScenarioDetailsModalProps) {
  if (!scenario) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="text-3xl">{scenario.icon}</span>
            {scenario.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{scenario.description}</p>
          </div>

          {/* Configuration Overview */}
          <ScenarioConfigurationOverview scenario={scenario} />

          {/* Learning Points */}
          <ScenarioLearningPoints points={scenario.learningPoints} />

          {/* Risks */}
          <ScenarioRisks risks={scenario.risks} />

          {/* Suitable For */}
          <ScenarioSuitability suitableFor={scenario.suitableFor} />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button onClick={onApply} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Play className="h-4 w-4 mr-2" />
            Szenario anwenden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
