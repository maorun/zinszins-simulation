import { Panel, Form, Slider, RadioGroup, Radio, InputNumber } from 'rsuite';
import { useSimulation } from '../contexts/SimulationContext';
import type { ReturnMode } from '../utils/random-returns';

const ReturnConfiguration = () => {
    const {
        returnMode,
        setReturnMode,
        performSimulation,
        rendite,
        setRendite,
        averageReturn,
        setAverageReturn,
        standardDeviation,
        setStandardDeviation,
        randomSeed,
        setRandomSeed,
        variableReturns,
        setVariableReturns,
        startEnd,
    } = useSimulation();

    const yearToday = new Date().getFullYear();

    return (
        <Panel header="📈 Rendite-Konfiguration" bordered>
            <Form.Group controlId="returnMode">
                <Form.ControlLabel>Rendite-Modus</Form.ControlLabel>
                <RadioGroup
                    inline
                    value={returnMode}
                    onChange={(value) => {
                        const mode = value as ReturnMode;
                        setReturnMode(mode);
                        performSimulation();
                    }}
                >
                    <Radio value="fixed">Feste Rendite</Radio>
                    <Radio value="random">Zufällige Rendite</Radio>
                    <Radio value="variable">Variable Rendite</Radio>
                </RadioGroup>
            </Form.Group>

            {returnMode === 'fixed' && (
                <Form.Group controlId="fixedReturn">
                    <Form.ControlLabel>Feste Rendite</Form.ControlLabel>
                    <Slider
                        name="rendite"
                        renderTooltip={(value) => value + "%"}
                        handleTitle={(<div style={{ marginTop: '-17px' }}>{rendite}%</div>)}
                        progress
                        value={rendite}
                        min={0}
                        max={15}
                        step={0.5}
                        graduated
                        onChange={(r) => {
                            setRendite(r);
                            performSimulation({ rendite: r });
                        }}
                    />
                </Form.Group>
            )}

            {returnMode === 'random' && (
                <>
                    <Form.Group controlId="averageReturn">
                        <Form.ControlLabel>Durchschnittliche Rendite</Form.ControlLabel>
                        <Slider
                            name="averageReturn"
                            renderTooltip={(value) => value + "%"}
                            handleTitle={(<div style={{ marginTop: '-17px' }}>{averageReturn}%</div>)}
                            progress
                            value={averageReturn}
                            min={0}
                            max={15}
                            step={0.5}
                            graduated
                            onChange={(value) => {
                                setAverageReturn(value);
                                performSimulation();
                            }}
                        />
                    </Form.Group>

                    <Form.Group controlId="standardDeviation">
                        <Form.ControlLabel>Volatilität (Standardabweichung)</Form.ControlLabel>
                        <Slider
                            name="standardDeviation"
                            renderTooltip={(value) => value + "%"}
                            handleTitle={(<div style={{ marginTop: '-17px' }}>{standardDeviation}%</div>)}
                            progress
                            value={standardDeviation}
                            min={5}
                            max={30}
                            step={1}
                            graduated
                            onChange={(value) => {
                                setStandardDeviation(value);
                                performSimulation();
                            }}
                        />
                    </Form.Group>

                    <Form.Group controlId="randomSeed">
                        <Form.ControlLabel>Zufallsseed (optional für reproduzierbare Ergebnisse)</Form.ControlLabel>
                        <InputNumber
                            placeholder="Leer lassen für echte Zufälligkeit"
                            value={randomSeed}
                            onChange={(value) => {
                                setRandomSeed(typeof value === 'number' ? value : undefined);
                                performSimulation();
                            }}
                            min={1}
                            max={999999}
                        />
                    </Form.Group>
                </>
            )}

            {returnMode === 'variable' && (
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
            )}
        </Panel>
    );
};

export default ReturnConfiguration;
