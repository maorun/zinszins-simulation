import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { Plus, ChevronDown } from 'lucide-react'
import { type WithdrawalSegment } from '../utils/segmented-withdrawal'
import { WithdrawalSegmentCard } from './WithdrawalSegmentCard'
import { useWithdrawalSegments } from '../hooks/useWithdrawalSegments'

interface WithdrawalSegmentFormProps {
  segments: WithdrawalSegment[]
  onSegmentsChange: (segments: WithdrawalSegment[]) => void
  withdrawalStartYear: number
  withdrawalEndYear: number
}

function ErrorDisplay({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null
  }
  return (
    <div className="text-destructive mb-4">
      <strong>Fehler:</strong>
      <ul className="list-disc list-inside">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )
}

function WithdrawalSegmentFormHeader() {
  return (
    <CardHeader>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
          <CardTitle className="text-left">Entnahme-Phasen konfigurieren</CardTitle>
          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
}

type SegmentContentProps = ReturnType<typeof useWithdrawalSegments> & WithdrawalSegmentFormProps

function WithdrawalSegmentFormContent({
  segments,
  errors,
  addSegment,
  withdrawalStartYear,
  withdrawalEndYear,
  updateSegment,
  removeSegment,
  moveSegmentUp,
  moveSegmentDown,
}: SegmentContentProps) {
  return (
    <CollapsibleContent>
      <CardContent>
        <div className="mb-5">
          <p className="mb-4">
            Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf. Phasen können
            flexibel positioniert werden - sie müssen nicht am Ende der Sparphase beginnen und können Lücken zwischen
            ihnen haben. Verwende die Pfeil-Buttons, um die Reihenfolge zu ändern.
          </p>
          <ErrorDisplay errors={errors} />
          <Button onClick={addSegment} className="mb-4">
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
  )
}

export function WithdrawalSegmentForm(props: WithdrawalSegmentFormProps) {
  const segmentProps = useWithdrawalSegments(
    props.segments,
    props.onSegmentsChange,
    props.withdrawalStartYear,
    props.withdrawalEndYear,
  )

  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <WithdrawalSegmentFormHeader />
        <WithdrawalSegmentFormContent {...props} {...segmentProps} />
      </Collapsible>
    </Card>
  )
}
