import { Form, Slider } from 'rsuite';
import { useSimulation } from '../contexts/SimulationContext';

const FixedReturnConfiguration = () => {
    const {
        rendite,
        setRendite,
        performSimulation,
    } = useSimulation();

    return (
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
    );
};

export default FixedReturnConfiguration;
