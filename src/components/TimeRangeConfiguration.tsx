import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useSimulation } from '../contexts/useSimulation';
import { Zeitspanne } from './Zeitspanne';
import { convertSparplanToElements } from '../utils/sparplan-utils';
import { useCallback, useState } from 'react';

const TimeRangeConfiguration = () => {
    const [isOpen, setIsOpen] = useState(false); // Default to closed
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
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">📅 Sparphase-Ende</CardTitle>
                            {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
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
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

export default TimeRangeConfiguration;
