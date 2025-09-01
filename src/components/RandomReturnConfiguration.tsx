import { Form, Slider, InputNumber } from 'rsuite';
import { useSimulation } from '../contexts/useSimulation';

const RandomReturnConfiguration = () => {
    const {
        averageReturn,
        setAverageReturn,
        standardDeviation,
        setStandardDeviation,
        randomSeed,
        setRandomSeed,
        performSimulation,
    } = useSimulation();

    return (
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
    );
};

export default RandomReturnConfiguration;
