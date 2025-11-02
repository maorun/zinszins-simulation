import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { generateInstanceId } from '../../utils/unique-id'

interface AverageReturnSliderProps {
  segmentId: string
  averageReturn: number
  onAverageReturnChange: (value: number) => void
}

export function AverageReturnSlider({
  segmentId,
  averageReturn,
  onAverageReturnChange,
}: AverageReturnSliderProps) {
  const sliderId = useMemo(() => generateInstanceId('avg-return', segmentId), [segmentId])

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={sliderId}>
        Durchschnittliche Rendite (%)
      </Label>
      <div className="space-y-2">
        <Slider
          id={sliderId}
          value={[averageReturn * 100]}
          min={0}
          max={12}
          step={0.5}
          onValueChange={value => onAverageReturnChange(value[0] / 100)}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {(averageReturn * 100).toFixed(1)}
            %
          </span>
          <span>12%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Erwartete durchschnittliche Rendite für diese Phase (meist konservativer als Ansparphase)
      </div>
    </div>
  )
}
