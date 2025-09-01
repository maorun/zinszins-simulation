import { Form, Slider } from "rsuite";

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
        <>
            <Form.Group controlId={isFormMode ? "dynamischBasisrate" : undefined}>
                <Form.ControlLabel>Basis-Entnahmerate (%)</Form.ControlLabel>
                {isFormMode ? (
                    <Form.Control name="dynamischBasisrate" accepter={Slider} 
                        min={2}
                        max={7}
                        step={0.5}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{formValue!.dynamischBasisrate}%</div>)}
                        progress
                        graduated
                    />
                ) : (
                    <Slider
                        value={currentValues.baseWithdrawalRate * 100}
                        min={2}
                        max={7}
                        step={0.5}
                        onChange={(value) => onChange!.onBaseWithdrawalRateChange(value / 100)}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{(currentValues.baseWithdrawalRate * 100).toFixed(1)}%</div>)}
                        progress
                        graduated
                    />
                )}
                <Form.HelpText>
                    Grundlegende jährliche Entnahmerate vor dynamischen Anpassungen
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId={isFormMode ? "dynamischObereSchwell" : undefined}>
                <Form.ControlLabel>Obere Schwelle Rendite (%)</Form.ControlLabel>
                {isFormMode ? (
                    <Form.Control name="dynamischObereSchwell" accepter={Slider} 
                        min={4}
                        max={15}
                        step={0.5}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{formValue!.dynamischObereSchwell}%</div>)}
                        progress
                        graduated
                    />
                ) : (
                    <Slider
                        value={currentValues.upperThresholdReturn * 100}
                        min={4}
                        max={15}
                        step={0.5}
                        onChange={(value) => onChange!.onUpperThresholdReturnChange(value / 100)}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{(currentValues.upperThresholdReturn * 100).toFixed(1)}%</div>)}
                        progress
                        graduated
                    />
                )}
                <Form.HelpText>
                    Rendite-Schwelle: Bei Überschreitung wird die Entnahme erhöht
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId={isFormMode ? "dynamischObereAnpassung" : undefined}>
                <Form.ControlLabel>Anpassung bei oberer Schwelle (%)</Form.ControlLabel>
                {isFormMode ? (
                    <Form.Control name="dynamischObereAnpassung" accepter={Slider} 
                        min={0}
                        max={15}
                        step={1}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{formValue!.dynamischObereAnpassung > 0 ? '+' : ''}{formValue!.dynamischObereAnpassung}%</div>)}
                        progress
                        graduated
                    />
                ) : (
                    <Slider
                        value={currentValues.upperThresholdAdjustment * 100}
                        min={0}
                        max={15}
                        step={1}
                        onChange={(value) => onChange!.onUpperThresholdAdjustmentChange(value / 100)}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{currentValues.upperThresholdAdjustment > 0 ? '+' : ''}{(currentValues.upperThresholdAdjustment * 100).toFixed(0)}%</div>)}
                        progress
                        graduated
                    />
                )}
                <Form.HelpText>
                    Relative Erhöhung der Entnahme bei guter Performance
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId={isFormMode ? "dynamischUntereSchwell" : undefined}>
                <Form.ControlLabel>Untere Schwelle Rendite (%)</Form.ControlLabel>
                {isFormMode ? (
                    <Form.Control name="dynamischUntereSchwell" accepter={Slider} 
                        min={-5}
                        max={6}
                        step={0.5}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{formValue!.dynamischUntereSchwell}%</div>)}
                        progress
                        graduated
                    />
                ) : (
                    <Slider
                        value={currentValues.lowerThresholdReturn * 100}
                        min={-5}
                        max={6}
                        step={0.5}
                        onChange={(value) => onChange!.onLowerThresholdReturnChange(value / 100)}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{(currentValues.lowerThresholdReturn * 100).toFixed(1)}%</div>)}
                        progress
                        graduated
                    />
                )}
                <Form.HelpText>
                    Rendite-Schwelle: Bei Unterschreitung wird die Entnahme reduziert
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId={isFormMode ? "dynamischUntereAnpassung" : undefined}>
                <Form.ControlLabel>Anpassung bei unterer Schwelle (%)</Form.ControlLabel>
                {isFormMode ? (
                    <Form.Control name="dynamischUntereAnpassung" accepter={Slider} 
                        min={-15}
                        max={0}
                        step={1}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{formValue!.dynamischUntereAnpassung}%</div>)}
                        progress
                        graduated
                    />
                ) : (
                    <Slider
                        value={currentValues.lowerThresholdAdjustment * 100}
                        min={-15}
                        max={0}
                        step={1}
                        onChange={(value) => onChange!.onLowerThresholdAdjustmentChange(value / 100)}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{(currentValues.lowerThresholdAdjustment * 100).toFixed(0)}%</div>)}
                        progress
                        graduated
                    />
                )}
                <Form.HelpText>
                    Relative Reduzierung der Entnahme bei schlechter Performance
                </Form.HelpText>
            </Form.Group>
        </>
    );
}