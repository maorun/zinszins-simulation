import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useSimulation } from '../contexts/useSimulation';
import { Zeitspanne } from './Zeitspanne';
import { convertSparplanToElements } from '../utils/sparplan-utils';
import { useCallback } from 'react';

const TimeRangeConfiguration = () => {
    const { startEnd, setStartEnd, sparplan, simulationAnnual, setSparplanElemente } = useSimulation();

    const handleStartEndChange = useCallback((val: [number, number]) => {
        setStartEnd(val);
        setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual));
    }, [setStartEnd, setSparplanElemente, sparplan, simulationAnnual]);

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>📅 Sparphase-Ende</CardTitle>
            </CardHeader>
            <CardContent>
                <Zeitspanne startEnd={startEnd} dispatch={handleStartEndChange} />
            </CardContent>
        </Card>
    );
};

export default TimeRangeConfiguration;
