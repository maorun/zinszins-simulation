import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface BucketStrategyFormValues {
  bucketConfig?: {
    initialCashCushion: number;
    refillThreshold: number;
    refillPercentage: number;
    baseWithdrawalRate: number;
  };
}

interface BucketStrategyConfigValues {
  initialCashCushion: number;
  refillThreshold: number;
  refillPercentage: number;
  baseWithdrawalRate: number;
}

interface BucketStrategyChangeHandlers {
  onInitialCashCushionChange: (value: number) => void;
  onRefillThresholdChange: (value: number) => void;
  onRefillPercentageChange: (value: number) => void;
  onBaseWithdrawalRateChange: (value: number) => void;
}

interface BucketStrategyConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: BucketStrategyFormValues;
  updateFormValue?: (value: BucketStrategyFormValues) => void;
  
  // For direct state management (Segmentiert)
  values?: BucketStrategyConfigValues;
  onChange?: BucketStrategyChangeHandlers;
}

export function BucketStrategyConfiguration({ 
  formValue, 
  updateFormValue,
  values, 
  onChange 
}: BucketStrategyConfigurationProps) {
  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined;
  const isDirectMode = values !== undefined && onChange !== undefined;

  if (!isFormMode && !isDirectMode) {
    throw new Error("BucketStrategyConfiguration requires either (formValue + updateFormValue) or (values + onChange)");
  }

  // Get current values based on mode
  const currentValues = isFormMode ? {
    initialCashCushion: formValue!.bucketConfig?.initialCashCushion || 20000,
    refillThreshold: formValue!.bucketConfig?.refillThreshold || 5000,
    refillPercentage: formValue!.bucketConfig?.refillPercentage || 0.5,
    baseWithdrawalRate: formValue!.bucketConfig?.baseWithdrawalRate || 0.04,
  } : values!;

  // Helper for form mode updates
  const updateFormBucketConfig = (updates: Partial<BucketStrategyConfigValues>) => {
    if (!isFormMode) return;
    
    updateFormValue!({
      ...formValue!,
      bucketConfig: {
        ...currentValues,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Drei-Eimer-Strategie Konfiguration</Label>
      
      {/* Initial Cash Cushion */}
      <div className="space-y-2">
        <Label htmlFor={isFormMode ? "initialCashCushion" : "bucket-initial-cash"}>
          Initiales Cash-Polster (€)
        </Label>
        <Input
          id={isFormMode ? "initialCashCushion" : "bucket-initial-cash"}
          type="number"
          value={currentValues.initialCashCushion}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : 20000;
            if (isFormMode) {
              updateFormBucketConfig({ initialCashCushion: value });
            } else {
              onChange!.onInitialCashCushionChange(value);
            }
          }}
          min={1000}
          max={100000}
          step={1000}
        />
        <p className="text-sm text-gray-600">
          {isFormMode 
            ? "Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen"
            : "Anfänglicher Cash-Puffer für negative Rendite-Jahre"
          }
        </p>
      </div>

      {/* Base Withdrawal Rate */}
      <div className="space-y-2">
        <Label>Basis-Entnahmerate (%)</Label>
        <div className="px-3">
          <Slider
            value={[currentValues.baseWithdrawalRate * 100]}
            onValueChange={(value) => {
              const rate = value[0] / 100;
              if (isFormMode) {
                updateFormBucketConfig({ baseWithdrawalRate: rate });
              } else {
                onChange!.onBaseWithdrawalRateChange(rate);
              }
            }}
            max={10}
            min={1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1%</span>
            <span className="font-medium text-gray-900">
              {(currentValues.baseWithdrawalRate * 100).toFixed(1)}%
            </span>
            <span>10%</span>
          </div>
        </div>
      </div>

      {/* Refill Threshold */}
      <div className="space-y-2">
        <Label htmlFor={isFormMode ? "refillThreshold" : "bucket-refill-threshold"}>
          Auffüll-Schwellenwert (€)
        </Label>
        <Input
          id={isFormMode ? "refillThreshold" : "bucket-refill-threshold"}
          type="number"
          value={currentValues.refillThreshold}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : 5000;
            if (isFormMode) {
              updateFormBucketConfig({ refillThreshold: value });
            } else {
              onChange!.onRefillThresholdChange(value);
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
              const percentage = value[0] / 100;
              if (isFormMode) {
                updateFormBucketConfig({ refillPercentage: percentage });
              } else {
                onChange!.onRefillPercentageChange(percentage);
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
              {(currentValues.refillPercentage * 100).toFixed(0)}%
            </span>
            <span>100%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Anteil der Überschussgewinne, der ins Cash-Polster verschoben wird
        </p>
      </div>
    </div>
  );
}