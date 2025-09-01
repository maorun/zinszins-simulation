import { Panel, Form, RadioGroup, Radio } from 'rsuite';
import { useSimulation } from '../contexts/useSimulation';
import type { ReturnMode } from '../utils/random-returns';
import FixedReturnConfiguration from './FixedReturnConfiguration';
import RandomReturnConfiguration from './RandomReturnConfiguration';
import VariableReturnConfiguration from './VariableReturnConfiguration';

const ReturnConfiguration = () => {
    const {
        returnMode,
        setReturnMode,
        performSimulation,
    } = useSimulation();

    return (
        <Panel header="📈 Rendite-Konfiguration (Sparphase)" bordered>
            <Form.Group controlId="returnMode">
                <Form.ControlLabel>Rendite-Modus für Sparphase</Form.ControlLabel>
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
                <Form.HelpText>
                    Konfiguration der erwarteten Rendite während der Ansparphase (bis zum Beginn der Entnahme).
                </Form.HelpText>
            </Form.Group>

            {returnMode === 'fixed' && <FixedReturnConfiguration />}
            {returnMode === 'random' && <RandomReturnConfiguration />}
            {returnMode === 'variable' && <VariableReturnConfiguration />}
        </Panel>
    );
};

export default ReturnConfiguration;
