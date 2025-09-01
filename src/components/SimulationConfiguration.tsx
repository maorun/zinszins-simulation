import { Panel, Form, RadioGroup, Radio } from 'rsuite';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SimulationConfiguration = () => {
    const {
        simulationAnnual,
        setSimulationAnnual,
        setSparplanElemente,
        sparplan,
        startEnd,
    } = useSimulation();

    return (
        <Panel header="⚙️ Simulation-Konfiguration" bordered>
            <Form.Group controlId="simulationAnnual">
                <Form.ControlLabel>Berechnungsmodus</Form.ControlLabel>
                <RadioGroup
                    inline
                    value={simulationAnnual}
                    onChange={(value) => {
                        setSimulationAnnual(value as any);
                        setSparplanElemente(convertSparplanToElements(sparplan, startEnd, value as any));
                    }}
                >
                    <Radio value={'yearly'}>Jährlich</Radio>
                    <Radio value={'monthly'}>Monatlich</Radio>
                </RadioGroup>
            </Form.Group>
        </Panel>
    );
};

export default SimulationConfiguration;
