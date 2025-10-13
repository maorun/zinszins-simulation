import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { GlossaryTerm } from '../GlossaryTerm'

interface TeilfreistellungsquoteSectionProps {
  teilfreistellungsquote: number
  onTeilfreistellungsquoteChange: (value: number) => void
}

export function TeilfreistellungsquoteSection({
  teilfreistellungsquote,
  onTeilfreistellungsquoteChange,
}: TeilfreistellungsquoteSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="teilfreistellungsquote">
        <GlossaryTerm term="teilfreistellung">
          Teilfreistellungsquote
        </GlossaryTerm>
        {' '}
        (%)
      </Label>
      <Slider
        id="teilfreistellungsquote"
        value={[teilfreistellungsquote]}
        onValueChange={([value]) => onTeilfreistellungsquoteChange(value)}
        min={0}
        max={50}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0%</span>
        <span className="font-medium">
          {teilfreistellungsquote}
          %
        </span>
        <span>50%</span>
      </div>
    </div>
  )
}
