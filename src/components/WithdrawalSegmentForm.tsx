import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { Plus, ChevronDown } from 'lucide-react'
import {
  validateWithdrawalSegments,
  createDefaultWithdrawalSegment,
  type WithdrawalSegment,
} from '../utils/segmented-withdrawal'
import { WithdrawalSegmentCard } from './WithdrawalSegmentCard'

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable' | 'multiasset'

interface WithdrawalSegmentFormProps {
  segments: WithdrawalSegment[]
  onSegmentsChange: (segments: WithdrawalSegment[]) => void
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function WithdrawalSegmentForm({
  segments,
  onSegmentsChange,
  withdrawalStartYear,
  withdrawalEndYear,
}: WithdrawalSegmentFormProps) {
  const [errors, setErrors] = useState<string[]>([])

  // Check if more segments can be added
  const canAddMoreSegments = () => {
    // Allow adding segments as long as the last segment doesn't extend indefinitely
    // Remove the constraint of requiring segments to end at globalEndOfLife
    // Users can create segments with any end year they choose
    return true
  }

  // Validate segments whenever they change
  const validateAndUpdateSegments = (newSegments: WithdrawalSegment[]) => {
    const validationErrors = validateWithdrawalSegments(newSegments, withdrawalStartYear, withdrawalEndYear)
    setErrors(validationErrors)
    onSegmentsChange(newSegments)
  }

  // Add a new segment - allow flexible positioning
  const addSegment = () => {
    const newId = `segment_${Date.now()}`

    // Default to starting one year before the withdrawal start year if no segments exist
    // This allows users to create phases before the end of the savings phase
    let startYear: number
    let endYear: number

    if (segments.length === 0) {
      // For the first segment, start one year before the withdrawal start year by default
      startYear = Math.round(withdrawalStartYear) - 1
      endYear = startYear + 4 // Default 5-year segment
    }
    else {
      // For additional segments, try to position after the last segment
      const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
      const lastSegment = sortedSegments[sortedSegments.length - 1]
      startYear = Math.round(lastSegment.endYear) + 1
      endYear = startYear + 4 // Default 5-year segment
    }

    const newSegment = createDefaultWithdrawalSegment(newId, `Phase ${segments.length + 1}`, startYear, endYear)

    validateAndUpdateSegments([...segments, newSegment])
  }

  // Remove a segment
  const removeSegment = (segmentId: string) => {
    const newSegments = segments.filter(s => s.id !== segmentId)
    validateAndUpdateSegments(newSegments)
  }

  // Update a specific segment
  const updateSegment = (segmentId: string, updates: Partial<WithdrawalSegment>) => {
    const newSegments = segments.map(segment =>
      segment.id === segmentId
        ? { ...segment, ...updates }
        : segment,
    )
    validateAndUpdateSegments(newSegments)
  }

  // Move a segment up in the list
  const moveSegmentUp = (segmentId: string) => {
    const currentIndex = segments.findIndex(s => s.id === segmentId)
    if (currentIndex > 0) {
      const newSegments = [...segments]
      const temp = newSegments[currentIndex]
      newSegments[currentIndex] = newSegments[currentIndex - 1]
      newSegments[currentIndex - 1] = temp
      validateAndUpdateSegments(newSegments)
    }
  }

  // Move a segment down in the list
  const moveSegmentDown = (segmentId: string) => {
    const currentIndex = segments.findIndex(s => s.id === segmentId)
    if (currentIndex < segments.length - 1) {
      const newSegments = [...segments]
      const temp = newSegments[currentIndex]
      newSegments[currentIndex] = newSegments[currentIndex + 1]
      newSegments[currentIndex + 1] = temp
      validateAndUpdateSegments(newSegments)
    }
  }

  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">Entnahme-Phasen konfigurieren</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="mb-5">
              <p className="mb-4">
                Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.
                Phasen können flexibel positioniert werden - sie müssen nicht am Ende der Sparphase beginnen
                und können Lücken zwischen ihnen haben. Verwende die Pfeil-Buttons, um die Reihenfolge zu ändern.
              </p>

              {errors.length > 0 && (
                <div className="text-destructive mb-4">
                  <strong>Fehler:</strong>
                  <ul className="list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={addSegment}
                disabled={!canAddMoreSegments()}
                className="mb-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Phase hinzufügen
              </Button>
            </div>

            {segments.map((segment, index) => (
              <WithdrawalSegmentCard
                key={segment.id}
                segment={segment}
                index={index}
                totalSegments={segments.length}
                withdrawalStartYear={withdrawalStartYear}
                withdrawalEndYear={withdrawalEndYear}
                onUpdate={updateSegment}
                onRemove={removeSegment}
                onMoveUp={moveSegmentUp}
                onMoveDown={moveSegmentDown}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
