import { Label } from './ui/label'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { MultiAssetPortfolioConfiguration } from './MultiAssetPortfolioConfiguration'
import type { WithdrawalReturnMode } from '../utils/config-storage'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

interface WithdrawalReturnModeConfigurationProps {
  withdrawalReturnMode: WithdrawalReturnMode
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalVariableReturns: Record<number, number>
  formValueRendite: number
  startOfIndependence: number
  globalEndOfLife: number
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig
  onWithdrawalReturnModeChange: (mode: WithdrawalReturnMode) => void
  onWithdrawalAverageReturnChange: (value: number) => void
  onWithdrawalStandardDeviationChange: (value: number) => void
  onWithdrawalRandomSeedChange: (value: number | undefined) => void
  onWithdrawalVariableReturnsChange: (returns: Record<number, number>) => void
  onFormValueRenditeChange: (rendite: number) => void
  onWithdrawalMultiAssetConfigChange: (config: MultiAssetPortfolioConfig) => void
}

export function WithdrawalReturnModeConfiguration({
  withdrawalReturnMode,
  withdrawalAverageReturn,
  withdrawalStandardDeviation,
  withdrawalRandomSeed,
  withdrawalVariableReturns,
  formValueRendite,
  startOfIndependence,
  globalEndOfLife,
  withdrawalMultiAssetConfig,
  onWithdrawalReturnModeChange,
  onWithdrawalAverageReturnChange,
  onWithdrawalStandardDeviationChange,
  onWithdrawalRandomSeedChange,
  onWithdrawalVariableReturnsChange,
  onFormValueRenditeChange,
  onWithdrawalMultiAssetConfigChange,
}: WithdrawalReturnModeConfigurationProps) {
  return (
    <>
      {/* Withdrawal Return Configuration */}
      <div className="mb-4 space-y-2">
        <Label>Rendite-Konfiguration (Entnahme-Phase)</Label>
        <RadioTileGroup
          value={withdrawalReturnMode}
          onValueChange={(value: string) => {
            onWithdrawalReturnModeChange(value as WithdrawalReturnMode)
          }}
        >
          <RadioTile value="fixed" label="Feste Rendite">
            Konstante jährliche Rendite für die gesamte Entnahme-Phase
          </RadioTile>
          <RadioTile value="random" label="Zufällige Rendite">
            Monte Carlo Simulation mit Durchschnitt und Volatilität
          </RadioTile>
          <RadioTile value="variable" label="Variable Rendite">
            Jahr-für-Jahr konfigurierbare Renditen
          </RadioTile>
          <RadioTile value="multiasset" label="Multi-Asset Portfolio">
            Diversifiziertes Portfolio mit automatischem Rebalancing
          </RadioTile>
        </RadioTileGroup>
        <div className="text-sm text-muted-foreground mt-1">
          Konfiguration der erwarteten Rendite während der Entnahme-Phase
          (unabhängig von der Sparphase-Rendite).
        </div>
      </div>

      {withdrawalReturnMode === 'fixed' && (
        <div className="mb-4 space-y-2">
          <Label>
            Erwartete Rendite Entnahme-Phase (%)
          </Label>
          <div className="space-y-2">
            <Slider
              value={[formValueRendite]}
              onValueChange={(values: number[]) => onFormValueRenditeChange(values[0])}
              min={0}
              max={10}
              step={0.5}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium text-gray-900">
                {formValueRendite}
                %
              </span>
              <span>10%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Feste Rendite für die gesamte Entnahme-Phase (oft
            konservativer als die Sparphase-Rendite).
          </div>
        </div>
      )}

      {withdrawalReturnMode === 'random' && (
        <>
          <div className="mb-4 space-y-2">
            <Label>Durchschnittliche Rendite (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[withdrawalAverageReturn]}
                min={0}
                max={12}
                step={0.5}
                onValueChange={value => onWithdrawalAverageReturnChange(value[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0%</span>
                <span className="font-medium text-gray-900">
                  {withdrawalAverageReturn}
                  %
                </span>
                <span>12%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Erwartete durchschnittliche Rendite für die Entnahme-Phase
              (meist konservativer als Ansparphase)
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <Label>Standardabweichung (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[withdrawalStandardDeviation]}
                min={5}
                max={25}
                step={1}
                onValueChange={value => onWithdrawalStandardDeviationChange(value[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>5%</span>
                <span className="font-medium text-gray-900">
                  {withdrawalStandardDeviation}
                  %
                </span>
                <span>25%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Volatilität der Renditen (meist niedriger als Ansparphase
              wegen konservativerer Allokation)
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <Label>Zufalls-Seed (optional)</Label>
            <Input
              type="number"
              value={withdrawalRandomSeed || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined
                onWithdrawalRandomSeedChange(value)
              }}
              placeholder="Für reproduzierbare Ergebnisse"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Optionaler Seed für reproduzierbare Zufallsrenditen. Leer
              lassen für echte Zufälligkeit.
            </div>
          </div>
        </>
      )}

      {withdrawalReturnMode === 'variable' && (
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
      )}

      {withdrawalReturnMode === 'multiasset' && (
        <MultiAssetPortfolioConfiguration
          values={withdrawalMultiAssetConfig}
          onChange={onWithdrawalMultiAssetConfigChange}
          nestingLevel={0}
        />
      )}
    </>
  )
}
