import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useSimulation } from '../contexts/useSimulation';
import { Zeitspanne } from './Zeitspanne';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const TimeRangeConfiguration = () => {
    const { startEnd, setStartEnd, sparplan, simulationAnnual, setSparplanElemente } = useSimulation();

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>📅 Sparphase-Ende</CardTitle>
            </CardHeader>
            <CardContent>
                <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                    setStartEnd(val);
                    setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual));
                }} />
            </CardContent>
        </Card>
    );
};

export default TimeRangeConfiguration;
