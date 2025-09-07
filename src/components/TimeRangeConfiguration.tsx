import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plus, Minus } from 'lucide-react';
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

    const handleYearAdjustment = useCallback((adjustment: number) => {
        const [start, end] = startEnd;
        const newStart = Math.max(2023, Math.min(2100, start + adjustment));
        handleStartEndChange([newStart, end]);
    }, [startEnd, handleStartEndChange]);

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>📅 Sparphase-Ende</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Zeitspanne startEnd={startEnd} dispatch={handleStartEndChange} />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleYearAdjustment(-1)}
                            disabled={startEnd[0] <= 2023}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                            Jahr {startEnd[0]}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleYearAdjustment(1)}
                            disabled={startEnd[0] >= 2100}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeRangeConfiguration;
