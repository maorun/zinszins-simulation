import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type { BucketSubStrategy } from '../../helpers/withdrawal'

interface BucketStrategyFormValues {
  bucketConfig?: {
    initialCashCushion: number
    refillThreshold: number
    refillPercentage: number
    baseWithdrawalRate: number
    subStrategy?: BucketSubStrategy
    variabelProzent?: number
    monatlicheBetrag?: number
    dynamischBasisrate?: number
    dynamischObereSchwell?: number
    dynamischObereAnpassung?: number
    dynamischUntereSchwell?: number
    dynamischUntereAnpassung?: number
  }
}

interface BucketStrategyConfigValues {
  initialCashCushion: number
  refillThreshold: number
  refillPercentage: number
  baseWithdrawalRate: number
  subStrategy?: BucketSubStrategy
  variabelProzent?: number
  monatlicheBetrag?: number
  dynamischBasisrate?: number
  dynamischObereSchwell?: number
  dynamischObereAnpassung?: number
  dynamischUntereSchwell?: number
  dynamischUntereAnpassung?: number
}

interface BucketStrategyChangeHandlers {
  onInitialCashCushionChange: (value: number) => void
  onRefillThresholdChange: (value: number) => void
  onRefillPercentageChange: (value: number) => void
  onBaseWithdrawalRateChange: (value: number) => void
  onSubStrategyChange: (value: BucketSubStrategy) => void
  onVariabelProzentChange: (value: number) => void
  onMonatlicheBetragChange: (value: number) => void
  onDynamischBasisrateChange: (value: number) => void
  onDynamischObereSchwell: (value: number) => void
  onDynamischObereAnpassung: (value: number) => void
  onDynamischUntereSchwell: (value: number) => void
  onDynamischUntereAnpassung: (value: number) => void
}

interface BucketStrategyConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: BucketStrategyFormValues
  updateFormValue?: (value: BucketStrategyFormValues) => void

  // For direct state management (Segmentiert)
  values?: BucketStrategyConfigValues
  onChange?: BucketStrategyChangeHandlers

  // Optional unique ID prefix for multiple instances
  idPrefix?: string
}

export function BucketStrategyConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
  idPrefix = 'bucket-sub-strategy',
}: BucketStrategyConfigurationProps) {
  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('BucketStrategyConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
  }

  // Get current values based on mode
  const currentValues = isFormMode
    ? {
        initialCashCushion: formValue!.bucketConfig?.initialCashCushion || 20000,
        refillThreshold: formValue!.bucketConfig?.refillThreshold || 5000,
        refillPercentage: formValue!.bucketConfig?.refillPercentage || 0.5,
        baseWithdrawalRate: formValue!.bucketConfig?.baseWithdrawalRate || 0.04,
        subStrategy: formValue!.bucketConfig?.subStrategy || ('4prozent' as BucketSubStrategy),
        variabelProzent: formValue!.bucketConfig?.variabelProzent || 4,
        monatlicheBetrag: formValue!.bucketConfig?.monatlicheBetrag || 2000,
        dynamischBasisrate: formValue!.bucketConfig?.dynamischBasisrate || 4,
        dynamischObereSchwell: formValue!.bucketConfig?.dynamischObereSchwell || 8,
        dynamischObereAnpassung: formValue!.bucketConfig?.dynamischObereAnpassung || 5,
        dynamischUntereSchwell: formValue!.bucketConfig?.dynamischUntereSchwell || 2,
        dynamischUntereAnpassung: formValue!.bucketConfig?.dynamischUntereAnpassung || -5,
      }
    : {
        ...values!,
        subStrategy: values!.subStrategy || ('4prozent' as BucketSubStrategy),
        variabelProzent: values!.variabelProzent || 4,
        monatlicheBetrag: values!.monatlicheBetrag || 2000,
        dynamischBasisrate: values!.dynamischBasisrate || 4,
        dynamischObereSchwell: values!.dynamischObereSchwell || 8,
        dynamischObereAnpassung: values!.dynamischObereAnpassung || 5,
        dynamischUntereSchwell: values!.dynamischUntereSchwell || 2,
        dynamischUntereAnpassung: values!.dynamischUntereAnpassung || -5,
      }

  // Helper for form mode updates
  const updateFormBucketConfig = (updates: Partial<BucketStrategyConfigValues>) => {
    if (!isFormMode) return

    updateFormValue!({
      ...formValue!,
      bucketConfig: {
        ...currentValues,
        ...updates,
      },
    })
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Drei-Eimer-Strategie Konfiguration</Label>

      {/* Sub-strategy Selection */}
      <div className="space-y-2">
        <Label>Entnahme-Strategie</Label>
        <RadioTileGroup
          value={currentValues.subStrategy}
          idPrefix={idPrefix}
          onValueChange={(value: string) => {
            const subStrategy = value as BucketSubStrategy
            if (isFormMode) {
              updateFormBucketConfig({ subStrategy })
            }
            else {
              onChange!.onSubStrategyChange(subStrategy)
            }
          }}
        >
          <RadioTile value="4prozent" label="4% Regel">
            Jährliche Entnahme von 4% des Startkapitals
          </RadioTile>
          <RadioTile value="3prozent" label="3% Regel">
            Jährliche Entnahme von 3% des Startkapitals
          </RadioTile>
          <RadioTile value="variabel_prozent" label="Variable Prozent">
            Benutzerdefinierter Entnahme-Prozentsatz
          </RadioTile>
          <RadioTile value="monatlich_fest" label="Monatlich fest">
            Fester monatlicher Betrag
          </RadioTile>
          <RadioTile value="dynamisch" label="Dynamische Strategie">
            Renditebasierte Anpassung
          </RadioTile>
        </RadioTileGroup>
        <div className="text-sm text-muted-foreground mt-1">
          Wählen Sie die Entnahme-Strategie, die innerhalb der Drei-Eimer-Strategie verwendet wird.
        </div>
      </div>

      {/* Sub-strategy specific configuration */}
      {currentValues.subStrategy === 'variabel_prozent' && (
        <div className="space-y-2">
          <Label>Entnahme-Prozentsatz (%)</Label>
          <div className="space-y-2">
            <Slider
              value={[currentValues.variabelProzent]}
              onValueChange={(values: number[]) => {
                if (isFormMode) {
                  updateFormBucketConfig({ variabelProzent: values[0] })
                }
                else {
                  onChange!.onVariabelProzentChange(values[0])
                }
              }}
              min={1}
              max={10}
              step={0.5}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1%</span>
              <span className="font-medium text-gray-900">
                {currentValues.variabelProzent}
                %
              </span>
              <span>10%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Wählen Sie einen Entnahme-Prozentsatz zwischen 1% und 10% in 0,5%-Schritten
          </div>
        </div>
      )}

      {currentValues.subStrategy === 'monatlich_fest' && (
        <div className="space-y-2">
          <Label>Monatlicher Betrag (€)</Label>
          <Input
            type="number"
            value={currentValues.monatlicheBetrag}
            onChange={(e) => {
              const inputValue = e.target.value
              const value = inputValue === '' ? 0 : Number(inputValue) || 2000
              if (isFormMode) {
                updateFormBucketConfig({ monatlicheBetrag: value })
              }
              else {
                onChange!.onMonatlicheBetragChange(value)
              }
            }}
            min={100}
            max={20000}
            step={100}
          />
          <div className="text-sm text-muted-foreground mt-1">
            Fester monatlicher Entnahme-Betrag (wird automatisch mit Inflation angepasst)
          </div>
        </div>
      )}

      {currentValues.subStrategy === 'dynamisch' && (
        <>
          <div className="space-y-2">
            <Label>Basis-Entnahmerate (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[currentValues.dynamischBasisrate]}
                onValueChange={(values: number[]) => {
                  if (isFormMode) {
                    updateFormBucketConfig({ dynamischBasisrate: values[0] })
                  }
                  else {
                    onChange!.onDynamischBasisrateChange(values[0])
                  }
                }}
                min={1}
                max={10}
                step={0.5}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1%</span>
                <span className="font-medium text-gray-900">
                  {currentValues.dynamischBasisrate}
                  %
                </span>
                <span>10%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Basis-Entnahmerate für die dynamische Anpassung
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Obere Renditeschwelle (%)</Label>
              <div className="space-y-2">
                <Slider
                  value={[currentValues.dynamischObereSchwell]}
                  onValueChange={(values: number[]) => {
                    if (isFormMode) {
                      updateFormBucketConfig({ dynamischObereSchwell: values[0] })
                    }
                    else {
                      onChange!.onDynamischObereSchwell(values[0])
                    }
                  }}
                  min={5}
                  max={15}
                  step={0.5}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5%</span>
                  <span className="font-medium text-gray-900">
                    {currentValues.dynamischObereSchwell}
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
                  value={[currentValues.dynamischObereAnpassung]}
                  onValueChange={(values: number[]) => {
                    if (isFormMode) {
                      updateFormBucketConfig({ dynamischObereAnpassung: values[0] })
                    }
                    else {
                      onChange!.onDynamischObereAnpassung(values[0])
                    }
                  }}
                  min={0}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span className="font-medium text-gray-900">
                    {currentValues.dynamischObereAnpassung}
                    %
                  </span>
                  <span>20%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Untere Renditeschwelle (%)</Label>
              <div className="space-y-2">
                <Slider
                  value={[currentValues.dynamischUntereSchwell]}
                  onValueChange={(values: number[]) => {
                    if (isFormMode) {
                      updateFormBucketConfig({ dynamischUntereSchwell: values[0] })
                    }
                    else {
                      onChange!.onDynamischUntereSchwell(values[0])
                    }
                  }}
                  min={-5}
                  max={5}
                  step={0.5}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>-5%</span>
                  <span className="font-medium text-gray-900">
                    {currentValues.dynamischUntereSchwell}
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
                  value={[currentValues.dynamischUntereAnpassung]}
                  onValueChange={(values: number[]) => {
                    if (isFormMode) {
                      updateFormBucketConfig({ dynamischUntereAnpassung: values[0] })
                    }
                    else {
                      onChange!.onDynamischUntereAnpassung(values[0])
                    }
                  }}
                  min={-20}
                  max={0}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>-20%</span>
                  <span className="font-medium text-gray-900">
                    {currentValues.dynamischUntereAnpassung}
                    %
                  </span>
                  <span>0%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Initial Cash Cushion */}
      <div className="space-y-2">
        <Label htmlFor={isFormMode ? 'initialCashCushion' : 'bucket-initial-cash'}>
          Initiales Cash-Polster (€)
        </Label>
        <Input
          id={isFormMode ? 'initialCashCushion' : 'bucket-initial-cash'}
          type="number"
          value={currentValues.initialCashCushion}
          onChange={(e) => {
            const inputValue = e.target.value
            const value = inputValue === '' ? 0 : Number(inputValue) || 20000
            if (isFormMode) {
              updateFormBucketConfig({ initialCashCushion: value })
            }
            else {
              onChange!.onInitialCashCushionChange(value)
            }
          }}
          min={1000}
          max={100000}
          step={1000}
        />
        <p className="text-sm text-gray-600">
          {isFormMode
            ? 'Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen'
            : 'Anfänglicher Cash-Puffer für negative Rendite-Jahre'}
        </p>
      </div>

      {/* Refill Threshold */}
      <div className="space-y-2">
        <Label htmlFor={isFormMode ? 'refillThreshold' : 'bucket-refill-threshold'}>
          Auffüll-Schwellenwert (€)
        </Label>
        <Input
          id={isFormMode ? 'refillThreshold' : 'bucket-refill-threshold'}
          type="number"
          value={currentValues.refillThreshold}
          onChange={(e) => {
            const inputValue = e.target.value
            const value = inputValue === '' ? 0 : Number(inputValue) || 5000
            if (isFormMode) {
              updateFormBucketConfig({ refillThreshold: value })
            }
            else {
              onChange!.onRefillThresholdChange(value)
            }
          }}
          min={100}
          max={50000}
          step={100}
        />
        <p className="text-sm text-gray-600">
          Überschreiten die jährlichen Gewinne diesen Betrag, wird Cash-Polster aufgefüllt
        </p>
      </div>

      {/* Refill Percentage */}
      <div className="space-y-2">
        <Label>Auffüll-Anteil (%)</Label>
        <div className="px-3">
          <Slider
            value={[currentValues.refillPercentage * 100]}
            onValueChange={(value) => {
              const percentage = value[0] / 100
              if (isFormMode) {
                updateFormBucketConfig({ refillPercentage: percentage })
              }
              else {
                onChange!.onRefillPercentageChange(percentage)
              }
            }}
            max={100}
            min={10}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>10%</span>
            <span className="font-medium text-gray-900">
              {(currentValues.refillPercentage * 100).toFixed(0)}
              %
            </span>
            <span>100%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Anteil der Überschussgewinne, der ins Cash-Polster verschoben wird
        </p>
      </div>
    </div>
  )
}
