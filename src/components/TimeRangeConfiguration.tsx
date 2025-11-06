import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Button } from './ui/button'
import { Plus, Minus } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'
import { Zeitspanne } from './Zeitspanne'
import { convertSparplanToElements } from '../utils/sparplan-utils'
import { useCallback } from 'react'

/**
 * Year adjustment controls for incrementing/decrementing the start year
 */
function YearAdjustmentControls({
  startYear,
  onAdjustment,
}: {
  startYear: number
  onAdjustment: (adjustment: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onAdjustment(-1)} disabled={startYear <= 2023}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground min-w-[80px] text-center">Jahr {startYear}</span>
      <Button variant="outline" size="sm" onClick={() => onAdjustment(1)} disabled={startYear >= 2100}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const TimeRangeConfiguration = () => {
  const { startEnd, setStartEnd, sparplan, simulationAnnual, setSparplanElemente } = useSimulation()
  const nestingLevel = useNestingLevel()

  const handleStartEndChange = useCallback(
    (val: [number, number]) => {
      setStartEnd(val)
      setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual))
    },
    [setStartEnd, setSparplanElemente, sparplan, simulationAnnual],
  )

  const handleYearAdjustment = useCallback(
    (adjustment: number) => {
      const [start, end] = startEnd
      const newStart = Math.max(2023, Math.min(2100, start + adjustment))
      handleStartEndChange([newStart, end])
    },
    [startEnd, handleStartEndChange],
  )

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          📅 Sparphase-Ende
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-4">
              <Zeitspanne startEnd={startEnd} dispatch={handleStartEndChange} />
              <YearAdjustmentControls startYear={startEnd[0]} onAdjustment={handleYearAdjustment} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default TimeRangeConfiguration
