import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

interface DynamicWithdrawalFormValues {
    dynamischBasisrate: number;
    dynamischObereSchwell: number;
    dynamischObereAnpassung: number;
    dynamischUntereSchwell: number;
    dynamischUntereAnpassung: number;
}

interface DynamicWithdrawalConfigValues {
    baseWithdrawalRate: number;
    upperThresholdReturn: number;
    upperThresholdAdjustment: number;
    lowerThresholdReturn: number;
    lowerThresholdAdjustment: number;
}

interface DynamicWithdrawalChangeHandlers {
    onBaseWithdrawalRateChange: (value: number) => void;
    onUpperThresholdReturnChange: (value: number) => void;
    onUpperThresholdAdjustmentChange: (value: number) => void;
    onLowerThresholdReturnChange: (value: number) => void;
    onLowerThresholdAdjustmentChange: (value: number) => void;
}

interface DynamicWithdrawalConfigurationProps {
    // For existing form-based usage
    formValue?: DynamicWithdrawalFormValues;
    // For new direct onChange usage
    values?: DynamicWithdrawalConfigValues;
    onChange?: DynamicWithdrawalChangeHandlers;
}

export function DynamicWithdrawalConfiguration({ 
    formValue, 
    values, 
    onChange 
}: DynamicWithdrawalConfigurationProps) {
    // Determine which mode we're in
    const isFormMode = formValue !== undefined;
    const isDirectMode = values !== undefined && onChange !== undefined;

    if (!isFormMode && !isDirectMode) {
        throw new Error("DynamicWithdrawalConfiguration requires either formValue or (values + onChange)");
    }

    // Get current values based on mode
    const currentValues = isFormMode ? {
        baseWithdrawalRate: formValue!.dynamischBasisrate / 100,
        upperThresholdReturn: formValue!.dynamischObereSchwell / 100,
        upperThresholdAdjustment: formValue!.dynamischObereAnpassung / 100,
        lowerThresholdReturn: formValue!.dynamischUntereSchwell / 100,
        lowerThresholdAdjustment: formValue!.dynamischUntereAnpassung / 100,
    } : values!;
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor={isFormMode ? "dynamischBasisrate" : "baseWithdrawalRate"}>
                    Basis-Entnahmerate (%)
                </Label>
                {isFormMode ? (
                    <div className="space-y-2">
                        <Slider
                            name="dynamischBasisrate"
                            value={[formValue!.dynamischBasisrate]}
                            onValueChange={([value]) => {
                                // Handle form change if needed
                            }}
                            min={2}
                            max={7}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>2%</span>
                            <span className="font-medium">{formValue!.dynamischBasisrate}%</span>
                            <span>7%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Slider
                            value={[currentValues.baseWithdrawalRate * 100]}
                            onValueChange={([value]) => onChange!.onBaseWithdrawalRateChange(value / 100)}
                            min={2}
                            max={7}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>2%</span>
                            <span className="font-medium">{(currentValues.baseWithdrawalRate * 100).toFixed(1)}%</span>
                            <span>7%</span>
                        </div>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    Grundlegende jährliche Entnahmerate vor dynamischen Anpassungen
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor={isFormMode ? "dynamischObereSchwell" : "upperThresholdReturn"}>
                    Obere Schwelle Rendite (%)
                </Label>
                {isFormMode ? (
                    <div className="space-y-2">
                        <Slider
                            name="dynamischObereSchwell"
                            value={[formValue!.dynamischObereSchwell]}
                            onValueChange={([value]) => {
                                // Handle form change if needed
                            }}
                            min={4}
                            max={15}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>4%</span>
                            <span className="font-medium">{formValue!.dynamischObereSchwell}%</span>
                            <span>15%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Slider
                            value={[currentValues.upperThresholdReturn * 100]}
                            onValueChange={([value]) => onChange!.onUpperThresholdReturnChange(value / 100)}
                            min={4}
                            max={15}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>4%</span>
                            <span className="font-medium">{(currentValues.upperThresholdReturn * 100).toFixed(1)}%</span>
                            <span>15%</span>
                        </div>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    Rendite-Schwelle: Bei Überschreitung wird die Entnahme erhöht
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor={isFormMode ? "dynamischObereAnpassung" : "upperThresholdAdjustment"}>
                    Anpassung bei oberer Schwelle (%)
                </Label>
                {isFormMode ? (
                    <div className="space-y-2">
                        <Slider
                            name="dynamischObereAnpassung"
                            value={[formValue!.dynamischObereAnpassung]}
                            onValueChange={([value]) => {
                                // Handle form change if needed
                            }}
                            min={0}
                            max={15}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>0%</span>
                            <span className="font-medium">{formValue!.dynamischObereAnpassung > 0 ? '+' : ''}{formValue!.dynamischObereAnpassung}%</span>
                            <span>15%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Slider
                            value={[currentValues.upperThresholdAdjustment * 100]}
                            onValueChange={([value]) => onChange!.onUpperThresholdAdjustmentChange(value / 100)}
                            min={0}
                            max={15}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>0%</span>
                            <span className="font-medium">{currentValues.upperThresholdAdjustment > 0 ? '+' : ''}{(currentValues.upperThresholdAdjustment * 100).toFixed(0)}%</span>
                            <span>15%</span>
                        </div>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    Relative Erhöhung der Entnahme bei guter Performance
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor={isFormMode ? "dynamischUntereSchwell" : "lowerThresholdReturn"}>
                    Untere Schwelle Rendite (%)
                </Label>
                {isFormMode ? (
                    <div className="space-y-2">
                        <Slider
                            name="dynamischUntereSchwell"
                            value={[formValue!.dynamischUntereSchwell]}
                            onValueChange={([value]) => {
                                // Handle form change if needed
                            }}
                            min={-5}
                            max={6}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>-5%</span>
                            <span className="font-medium">{formValue!.dynamischUntereSchwell}%</span>
                            <span>6%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Slider
                            value={[currentValues.lowerThresholdReturn * 100]}
                            onValueChange={([value]) => onChange!.onLowerThresholdReturnChange(value / 100)}
                            min={-5}
                            max={6}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>-5%</span>
                            <span className="font-medium">{(currentValues.lowerThresholdReturn * 100).toFixed(1)}%</span>
                            <span>6%</span>
                        </div>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    Rendite-Schwelle: Bei Unterschreitung wird die Entnahme reduziert
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor={isFormMode ? "dynamischUntereAnpassung" : "lowerThresholdAdjustment"}>
                    Anpassung bei unterer Schwelle (%)
                </Label>
                {isFormMode ? (
                    <div className="space-y-2">
                        <Slider
                            name="dynamischUntereAnpassung"
                            value={[formValue!.dynamischUntereAnpassung]}
                            onValueChange={([value]) => {
                                // Handle form change if needed
                            }}
                            min={-15}
                            max={0}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>-15%</span>
                            <span className="font-medium">{formValue!.dynamischUntereAnpassung}%</span>
                            <span>0%</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Slider
                            value={[currentValues.lowerThresholdAdjustment * 100]}
                            onValueChange={([value]) => onChange!.onLowerThresholdAdjustmentChange(value / 100)}
                            min={-15}
                            max={0}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>-15%</span>
                            <span className="font-medium">{(currentValues.lowerThresholdAdjustment * 100).toFixed(0)}%</span>
                            <span>0%</span>
                        </div>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    Relative Reduzierung der Entnahme bei schlechter Performance
                </p>
            </div>
        </div>
    );
}