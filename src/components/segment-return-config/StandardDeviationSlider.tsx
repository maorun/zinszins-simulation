import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { useInstanceId } from '../../utils/unique-id'

interface StandardDeviationSliderProps {
  segmentId: string
  standardDeviation: number
  onStandardDeviationChange: (value: number) => void
}

export function StandardDeviationSlider({
  segmentId,
  standardDeviation,
  onStandardDeviationChange,
}: StandardDeviationSliderProps) {
  const sliderId = useInstanceId('std-dev', segmentId)

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={sliderId}>Standardabweichung (%)</Label>
      <div className="space-y-2">
        <Slider
          id={sliderId}
          value={[standardDeviation * 100]}
          min={5}
          max={25}
          step={1}
          onValueChange={(value) => onStandardDeviationChange(value[0] / 100)}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>5%</span>
          <span className="font-medium text-gray-900">{(standardDeviation * 100).toFixed(0)}%</span>
          <span>25%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Volatilität der Renditen (meist niedriger als Ansparphase wegen konservativerer Allokation)
      </div>
    </div>
  )
}
