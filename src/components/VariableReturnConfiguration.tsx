import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { useSimulation } from '../contexts/useSimulation'

const VariableReturnConfiguration = () => {
  const {
    variableReturns,
    setVariableReturns,
    startEnd,
    performSimulation,
  } = useSimulation()

  const yearToday = new Date().getFullYear()

  return (
    <div className="space-y-2">
      <Label htmlFor="variableReturns">Variable Renditen pro Jahr</Label>
      <div className="max-h-[300px] overflow-y-auto border border-border rounded-md p-4 space-y-4">
        {Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => {
          const year = yearToday + i
          return (
            <div key={year} className="flex items-center gap-4">
              <div className="min-w-[60px] font-semibold">
                {year}
                :
              </div>
              <div className="flex-1">
                <Slider
                  value={[variableReturns[year] || 5]}
                  onValueChange={([value]) => {
                    const newReturns = { ...variableReturns, [year]: value }
                    setVariableReturns(newReturns)
                    performSimulation()
                  }}
                  min={-10}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div className="min-w-[50px] text-right text-sm font-medium">
                {(variableReturns[year] || 5).toFixed(1)}
                %
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-xs text-muted-foreground">
        Tipp: Verwende negative Werte für wirtschaftliche Krisen und höhere Werte für Boom-Jahre.
      </div>
    </div>
  )
}

export default VariableReturnConfiguration
