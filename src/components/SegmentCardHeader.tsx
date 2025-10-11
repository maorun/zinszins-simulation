import { Button } from './ui/button'
import { CardHeader, CardTitle } from './ui/card'
import { CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, MoveDown, MoveUp, Trash2 } from 'lucide-react'

interface SegmentCardHeaderProps {
  segmentName: string
  startYear: number
  endYear: number
  index: number
  totalSegments: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

export function SegmentCardHeader({
  segmentName,
  startYear,
  endYear,
  index,
  totalSegments,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SegmentCardHeaderProps) {
  return (
    <CardHeader>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
          <CardTitle className="text-lg text-left">
            {segmentName}
            {' '}
            (
            {startYear}
            {' '}
            -
            {' '}
            {endYear}
            )
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveUp()
                }}
                disabled={index === 0}
                className="text-gray-500 hover:text-gray-700"
                title="Phase nach oben verschieben"
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveDown()
                }}
                disabled={index === totalSegments - 1}
                className="text-gray-500 hover:text-gray-700"
                title="Phase nach unten verschieben"
              >
                <MoveDown className="h-4 w-4" />
              </Button>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            {totalSegments > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="text-destructive hover:text-destructive ml-2"
                title="Phase löschen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
}
