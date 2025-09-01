import { Form, Slider } from "rsuite";

interface DynamicWithdrawalFormValues {
    dynamischBasisrate: number;
    dynamischObereSchwell: number;
    dynamischObereAnpassung: number;
    dynamischUntereSchwell: number;
    dynamischUntereAnpassung: number;
}

interface DynamicWithdrawalConfigurationProps {
    formValue: DynamicWithdrawalFormValues;
}

export function DynamicWithdrawalConfiguration({ formValue }: DynamicWithdrawalConfigurationProps) {
    return (
        <>
            <Form.Group controlId="dynamischBasisrate">
                <Form.ControlLabel>Basis-Entnahmerate (%)</Form.ControlLabel>
                <Form.Control name="dynamischBasisrate" accepter={Slider} 
                    min={2}
                    max={7}
                    step={0.5}
                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.dynamischBasisrate}%</div>)}
                    progress
                    graduated
                />
                <Form.HelpText>
                    Grundlegende jährliche Entnahmerate vor dynamischen Anpassungen
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId="dynamischObereSchwell">
                <Form.ControlLabel>Obere Schwelle Rendite (%)</Form.ControlLabel>
                <Form.Control name="dynamischObereSchwell" accepter={Slider} 
                    min={4}
                    max={15}
                    step={0.5}
                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.dynamischObereSchwell}%</div>)}
                    progress
                    graduated
                />
                <Form.HelpText>
                    Rendite-Schwelle: Bei Überschreitung wird die Entnahme erhöht
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId="dynamischObereAnpassung">
                <Form.ControlLabel>Anpassung bei oberer Schwelle (%)</Form.ControlLabel>
                <Form.Control name="dynamischObereAnpassung" accepter={Slider} 
                    min={0}
                    max={15}
                    step={1}
                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.dynamischObereAnpassung > 0 ? '+' : ''}{formValue.dynamischObereAnpassung}%</div>)}
                    progress
                    graduated
                />
                <Form.HelpText>
                    Relative Erhöhung der Entnahme bei guter Performance
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId="dynamischUntereSchwell">
                <Form.ControlLabel>Untere Schwelle Rendite (%)</Form.ControlLabel>
                <Form.Control name="dynamischUntereSchwell" accepter={Slider} 
                    min={-5}
                    max={6}
                    step={0.5}
                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.dynamischUntereSchwell}%</div>)}
                    progress
                    graduated
                />
                <Form.HelpText>
                    Rendite-Schwelle: Bei Unterschreitung wird die Entnahme reduziert
                </Form.HelpText>
            </Form.Group>
            
            <Form.Group controlId="dynamischUntereAnpassung">
                <Form.ControlLabel>Anpassung bei unterer Schwelle (%)</Form.ControlLabel>
                <Form.Control name="dynamischUntereAnpassung" accepter={Slider} 
                    min={-15}
                    max={0}
                    step={1}
                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.dynamischUntereAnpassung}%</div>)}
                    progress
                    graduated
                />
                <Form.HelpText>
                    Relative Reduzierung der Entnahme bei schlechter Performance
                </Form.HelpText>
            </Form.Group>
        </>
    );
}