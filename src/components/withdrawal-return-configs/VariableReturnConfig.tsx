import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface VariableReturnConfigProps {
  withdrawalVariableReturns: Record<number, number>
  startOfIndependence: number
  globalEndOfLife: number
  onWithdrawalVariableReturnsChange: (returns: Record<number, number>) => void
}

export function VariableReturnConfig({
  withdrawalVariableReturns,
  startOfIndependence,
  globalEndOfLife,
  onWithdrawalVariableReturnsChange,
}: VariableReturnConfigProps) {
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
        {Array.from(
          { length: globalEndOfLife - startOfIndependence },
          (_, i) => {
            const year = startOfIndependence + 1 + i
            return (
              <div
                key={year}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                  gap: '10px',
                }}
              >
                <div style={{ minWidth: '60px', fontWeight: 'bold' }}>
                  {year}
                  :
                </div>
                <div style={{ flex: 1 }}>
                  <Slider
                    value={[withdrawalVariableReturns[year] || 5]}
                    onValueChange={(values: number[]) => {
                      const newReturns = {
                        ...withdrawalVariableReturns,
                        [year]: values[0],
                      }
                      onWithdrawalVariableReturnsChange(newReturns)
                    }}
                    min={-10}
                    max={15}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
                <div style={{ minWidth: '50px', textAlign: 'right' }}>
                  {(withdrawalVariableReturns[year] || 5).toFixed(1)}
                  %
                </div>
              </div>
            )
          },
        )}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Tipp: Verwende niedrigere Werte für konservative
        Portfolio-Allokation in der Rente und negative Werte für
        Krisen-Jahre.
      </div>
    </div>
  )
}
