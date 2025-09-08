import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { MonteCarloResults } from './MonteCarloResults';
import { useSimulation } from '../contexts/useSimulation';
import { unique } from '../utils/array-utils';

const MonteCarloAnalysis = () => {
    const [isOpen, setIsOpen] = useState(false); // Default to closed
    const { simulationData, averageReturn, standardDeviation, randomSeed } = useSimulation();

    if (!simulationData) return null;

    const data = unique(simulationData ? (simulationData.sparplanElements.flatMap((v: any) => v.simulation ? Object.keys(v.simulation) : []).map(Number).filter((v: number) => !isNaN(v))) : []) as number[]

    return (
        <Card className="mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">🎲 Monte Carlo Analyse</CardTitle>
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
                <MonteCarloResults
                    years={data}
                    accumulationConfig={{
                        averageReturn: averageReturn / 100,
                        standardDeviation: standardDeviation / 100,
                        seed: randomSeed
                    }}
                    withdrawalConfig={{
                        averageReturn: 0.05, // Default 5% for withdrawal phase (more conservative)
                        standardDeviation: 0.12, // Default 12% volatility (more conservative)
                        seed: randomSeed
                    }}
                />
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

export default MonteCarloAnalysis;
