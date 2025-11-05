import { Lightbulb, AlertTriangle, UserCheck } from 'lucide-react'

interface ScenarioLearningPointsProps {
  points: string[]
}

/**
 * Displays learning points for a scenario
 */
export function ScenarioLearningPoints({ points }: ScenarioLearningPointsProps) {
  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
        <Lightbulb className="h-5 w-5" />
        Lernpunkte
      </h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ScenarioRisksProps {
  risks: string[]
}

/**
 * Displays risks and disadvantages for a scenario
 */
export function ScenarioRisks({ risks }: ScenarioRisksProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
      <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Risiken & Nachteile
      </h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {risks.map((risk, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold flex-shrink-0">!</span>
            <span>{risk}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ScenarioSuitabilityProps {
  suitableFor: string[]
}

/**
 * Displays suitability information for a scenario
 */
export function ScenarioSuitability({ suitableFor }: ScenarioSuitabilityProps) {
  return (
    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
      <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
        <UserCheck className="h-5 w-5" />
        Geeignet für
      </h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {suitableFor.map((suitable, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-purple-600 font-bold flex-shrink-0">→</span>
            <span>{suitable}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
