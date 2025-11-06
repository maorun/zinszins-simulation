import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface VariableReturnConfigProps {
  withdrawalVariableReturns: Record<number, number>
  startOfIndependence: number
  globalEndOfLife: number
  onWithdrawalVariableReturnsChange: (returns: Record<number, number>) => void
}

interface YearReturnRowProps {
  year: number
  returnValue: number
  onValueChange: (year: number, value: number) => void
}

function YearReturnRow({ year, returnValue, onValueChange }: YearReturnRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        gap: '10px',
      }}
    >
      <div style={{ minWidth: '60px', fontWeight: 'bold' }}>{year}:</div>
      <div style={{ flex: 1 }}>
        <Slider
          value={[returnValue]}
          onValueChange={(values: number[]) => onValueChange(year, values[0])}
          min={-10}
          max={15}
          step={0.5}
          className="mt-2"
        />
      </div>
      <div style={{ minWidth: '50px', textAlign: 'right' }}>{returnValue.toFixed(1)}%</div>
    </div>
  )
}

export function VariableReturnConfig({
  withdrawalVariableReturns,
  startOfIndependence,
  globalEndOfLife,
  onWithdrawalVariableReturnsChange,
}: VariableReturnConfigProps) {
  const handleValueChange = (year: number, value: number) => {
    const newReturns = {
      ...withdrawalVariableReturns,
      [year]: value,
    }
    onWithdrawalVariableReturnsChange(newReturns)
  }

  return (
    <div className="mb-4 space-y-2">
      <Label>Variable Renditen pro Jahr (Entnahme-Phase)</Label>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #e5e5ea',
          borderRadius: '6px',
          padding: '10px',
        }}
      >
        {Array.from({ length: globalEndOfLife - startOfIndependence }, (_, i) => {
          const year = startOfIndependence + 1 + i
          return (
            <YearReturnRow
              key={year}
              year={year}
              returnValue={withdrawalVariableReturns[year] || 5}
              onValueChange={handleValueChange}
            />
          )
        })}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Tipp: Verwende niedrigere Werte für konservative Portfolio-Allokation in der Rente und negative Werte für
        Krisen-Jahre.
      </div>
    </div>
  )
}
