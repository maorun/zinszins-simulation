import { Form, Slider } from 'rsuite';
import { useSimulation } from '../contexts/useSimulation';

const VariableReturnConfiguration = () => {
    const {
        variableReturns,
        setVariableReturns,
        startEnd,
        performSimulation,
    } = useSimulation();

    const yearToday = new Date().getFullYear();

    return (
        <Form.Group controlId="variableReturns">
            <Form.ControlLabel>Variable Renditen pro Jahr</Form.ControlLabel>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e5ea', borderRadius: '6px', padding: '10px' }}>
                {Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => {
                    const year = yearToday + i;
                    return (
                        <div key={year} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                            <div style={{ minWidth: '60px', fontWeight: 'bold' }}>{year}:</div>
                            <div style={{ flex: 1 }}>
                                <Slider
                                    value={variableReturns[year] || 5}
                                    min={-10}
                                    max={20}
                                    step={0.5}
                                    onChange={(value) => {
                                        const newReturns = { ...variableReturns, [year]: value };
                                        setVariableReturns(newReturns);
                                        performSimulation();
                                    }}
                                />
                            </div>
                            <div style={{ minWidth: '50px', textAlign: 'right' }}>
                                {(variableReturns[year] || 5).toFixed(1)}%
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Tipp: Verwende negative Werte für wirtschaftliche Krisen und höhere Werte für Boom-Jahre.
            </div>
        </Form.Group>
    );
};

export default VariableReturnConfiguration;
