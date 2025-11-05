import { Slider } from '../ui/slider'
import { Label } from '../ui/label'

interface DynamischConfigProps {
  basisrate: number
  obereSchwell: number
  obereAnpassung: number
  untereSchwell: number
  untereAnpassung: number
  onBasisrateChange: (value: number) => void
  onObereSchwell: (value: number) => void
  onObereAnpassung: (value: number) => void
  onUntereSchwell: (value: number) => void
  onUntereAnpassung: (value: number) => void
}

/**
 * Reusable slider component with label and value display
 */
function LabeledSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  helpText,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  helpText?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(values: number[]) => onChange(values[0])}
          min={min}
          max={max}
          step={step}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {min}
            %
          </span>
          <span className="font-medium text-gray-900">
            {value}
            %
          </span>
          <span>
            {max}
            %
          </span>
        </div>
      </div>
      {helpText && <div className="text-sm text-muted-foreground mt-1">{helpText}</div>}
    </div>
  )
}

function BasisrateSlider({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <LabeledSlider
      label="Basis-Entnahmerate (%)"
      value={value}
      onChange={onChange}
      min={1}
      max={10}
      step={0.5}
      helpText="Basis-Entnahmerate für die dynamische Anpassung"
    />
  )
}

function ObereControls(props: {
  schwell: number
  anpassung: number
  onSchwell: (v: number) => void
  onAnpassung: (v: number) => void
}) {
  return (
    <>
      <LabeledSlider
        label="Obere Renditeschwelle (%)"
        value={props.schwell}
        onChange={props.onSchwell}
        min={5}
        max={15}
        step={0.5}
      />
      <LabeledSlider
        label="Obere Anpassung (%)"
        value={props.anpassung}
        onChange={props.onAnpassung}
        min={0}
        max={20}
        step={1}
      />
    </>
  )
}

function UntereControls(props: {
  schwell: number
  anpassung: number
  onSchwell: (v: number) => void
  onAnpassung: (v: number) => void
}) {
  return (
    <>
      <LabeledSlider
        label="Untere Renditeschwelle (%)"
        value={props.schwell}
        onChange={props.onSchwell}
        min={-10}
        max={0}
        step={0.5}
      />
      <LabeledSlider
        label="Untere Anpassung (%)"
        value={props.anpassung}
        onChange={props.onAnpassung}
        min={0}
        max={20}
        step={1}
      />
    </>
  )
}

export function DynamischConfig({
  basisrate,
  obereSchwell,
  obereAnpassung,
  untereSchwell,
  untereAnpassung,
  onBasisrateChange,
  onObereSchwell,
  onObereAnpassung,
  onUntereSchwell,
  onUntereAnpassung,
}: DynamischConfigProps) {
  return (
    <>
      <BasisrateSlider value={basisrate} onChange={onBasisrateChange} />

      <div className="grid grid-cols-2 gap-4">
        <ObereControls
          schwell={obereSchwell}
          anpassung={obereAnpassung}
          onSchwell={onObereSchwell}
          onAnpassung={onObereAnpassung}
        />
        <UntereControls
          schwell={untereSchwell}
          anpassung={untereAnpassung}
          onSchwell={onUntereSchwell}
          onAnpassung={onUntereAnpassung}
        />
      </div>
    </>
  )
}
