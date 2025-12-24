import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import {
  getOptimizationObjectiveLabel,
  getOptimizationObjectiveDescription,
  type OptimizationObjective,
} from '../../utils/portfolio-optimization'
import { Sparkles, TrendingUp, TrendingDown, Target, Info } from 'lucide-react'

interface ObjectiveSelectorProps {
  selectedObjective: OptimizationObjective
  onSelect: (objective: OptimizationObjective) => void
}

/**
 * Get icon for optimization objective
 */
function getObjectiveIcon(objective: OptimizationObjective) {
  switch (objective) {
    case 'max-sharpe':
      return <Sparkles className="h-4 w-4" />
    case 'min-volatility':
      return <TrendingDown className="h-4 w-4" />
    case 'max-return':
      return <TrendingUp className="h-4 w-4" />
    case 'target-return':
      return <Target className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

/**
 * Objective selector component
 */
export function ObjectiveSelector({ selectedObjective, onSelect }: ObjectiveSelectorProps) {
  const objectives: OptimizationObjective[] = ['max-sharpe', 'min-volatility', 'max-return']

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Optimierungsziel</Label>
      <RadioGroup value={selectedObjective} onValueChange={value => onSelect(value as OptimizationObjective)}>
        <div className="space-y-2">
          {objectives.map(objective => (
            <div
              key={objective}
              className="flex items-start space-x-2 p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <RadioGroupItem value={objective} id={objective} className="mt-1" />
              <Label htmlFor={objective} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  {getObjectiveIcon(objective)}
                  <span className="font-medium">{getOptimizationObjectiveLabel(objective)}</span>
                </div>
                <p className="text-xs text-gray-600">{getOptimizationObjectiveDescription(objective)}</p>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
