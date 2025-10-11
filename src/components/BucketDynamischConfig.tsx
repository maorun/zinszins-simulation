import { Slider } from './ui/slider'
import { Label } from './ui/label'

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

function BasisrateSlider({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>Basis-Entnahmerate (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(values: number[]) => onChange(values[0])}
          min={1}
          max={10}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>1%</span>
          <span className="font-medium text-gray-900">
            {value}
            %
          </span>
          <span>10%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Basis-Entnahmerate für die dynamische Anpassung
      </div>
    </div>
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
      <div className="space-y-2">
        <Label>Obere Renditeschwelle (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[props.schwell]}
            onValueChange={(values: number[]) => props.onSchwell(values[0])}
            min={5}
            max={15}
            step={0.5}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>5%</span>
            <span className="font-medium text-gray-900">
              {props.schwell}
              %
            </span>
            <span>15%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Obere Anpassung (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[props.anpassung]}
            onValueChange={(values: number[]) => props.onAnpassung(values[0])}
            min={0}
            max={20}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-gray-900">
              {props.anpassung}
              %
            </span>
            <span>20%</span>
          </div>
        </div>
      </div>
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
      <div className="space-y-2">
        <Label>Untere Renditeschwelle (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[props.schwell]}
            onValueChange={(values: number[]) => props.onSchwell(values[0])}
            min={-5}
            max={5}
            step={0.5}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>-5%</span>
            <span className="font-medium text-gray-900">
              {props.schwell}
              %
            </span>
            <span>5%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Untere Anpassung (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[props.anpassung]}
            onValueChange={(values: number[]) => props.onAnpassung(values[0])}
            min={-20}
            max={0}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>-20%</span>
            <span className="font-medium text-gray-900">
              {props.anpassung}
              %
            </span>
            <span>0%</span>
          </div>
        </div>
      </div>
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
