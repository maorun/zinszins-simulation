import { Panel } from 'rsuite';
import { useSimulation } from '../contexts/useSimulation';
import { Zeitspanne } from './Zeitspanne';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const TimeRangeConfiguration = () => {
    const { startEnd, setStartEnd, sparplan, simulationAnnual, setSparplanElemente } = useSimulation();

    return (
        <Panel header="📅 Sparphase-Ende" bordered>
            <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                setStartEnd(val);
                setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual));
            }} />
        </Panel>
    );
};

export default TimeRangeConfiguration;
