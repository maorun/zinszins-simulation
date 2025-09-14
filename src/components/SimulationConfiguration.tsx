import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSimulation } from '../contexts/useSimulation';
import { useNestingLevel } from '../lib/nesting-utils';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SimulationConfiguration = () => {
    const {
        simulationAnnual,
        setSimulationAnnual,
        setSparplanElemente,
        sparplan,
        startEnd,
    } = useSimulation();
    const nestingLevel = useNestingLevel();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card nestingLevel={nestingLevel} className="mb-4">
                <CollapsibleTrigger asChild>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-between p-0"
                        asChild
                    >
                        <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
                            <div className="flex items-center justify-between w-full">
                                <CardTitle>⚙️ Simulation-Konfiguration</CardTitle>
                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </div>
                        </CardHeader>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent nestingLevel={nestingLevel}>
                        <div className="space-y-4">
                            <div className="p-3 border rounded-lg">
                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="space-y-1 sm:space-y-1">
                                        <Label htmlFor="berechnungsmodus" className="font-medium">Berechnungsmodus</Label>
                                        <p className="text-sm text-muted-foreground hidden sm:block">
                                            Jährlich für schnellere Berechnung, Monatlich für präzisere Ergebnisse
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-sm ${simulationAnnual === 'yearly' ? 'font-medium' : 'text-muted-foreground'}`}>
                                            Jährlich
                                        </span>
                                        <Switch
                                            id="berechnungsmodus"
                                            checked={simulationAnnual === 'monthly'}
                                            onCheckedChange={(checked) => {
                                                const value = checked ? 'monthly' : 'yearly';
                                                setSimulationAnnual(value as any);
                                                setSparplanElemente(convertSparplanToElements(sparplan, startEnd, value as any));
                                            }}
                                        />
                                        <span className={`text-sm ${simulationAnnual === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}>
                                            Monatlich
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-3 sm:hidden">
                                    Jährlich für schnellere Berechnung, Monatlich für präzisere Ergebnisse
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

export default SimulationConfiguration;
