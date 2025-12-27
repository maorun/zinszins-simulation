import { GripVertical } from 'lucide-react'
import { Button } from '../ui/button'

interface DragHandleProps {
  index: number
  totalCount: number
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

/**
 * Drag handle component with up/down buttons
 */
export function DragHandle({ index, totalCount, onMoveUp, onMoveDown }: DragHandleProps) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      {/* Grip icon for drag and drop */}
      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />

      {/* Up/Down buttons */}
      <div className="flex flex-col gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          title="Nach oben verschieben"
        >
          ↑
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1}
          title="Nach unten verschieben"
        >
          ↓
        </Button>
      </div>
    </div>
  )
}
