import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Label } from './ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useSimulation } from '../contexts/useSimulation';
import type { ReturnMode } from '../utils/random-returns';
import FixedReturnConfiguration from './FixedReturnConfiguration';
import RandomReturnConfiguration from './RandomReturnConfiguration';
import VariableReturnConfiguration from './VariableReturnConfiguration';
import { RadioTileGroup, RadioTile } from './ui/radio-tile';

const ReturnConfiguration = () => {
    const [isOpen, setIsOpen] = useState(false); // Default to closed
    const {
        returnMode,
        setReturnMode,
        performSimulation,
    } = useSimulation();

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">📈 Rendite-Konfiguration (Sparphase)</CardTitle>
                            {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4">
                <div className="space-y-3">
                    <Label>Rendite-Modus für Sparphase</Label>
                    <RadioTileGroup
                        value={returnMode}
                        onValueChange={(value: string) => {
                            const mode = value as ReturnMode;
                            setReturnMode(mode);
                            performSimulation();
                        }}
                    >
                        <RadioTile value="fixed" label="Feste Rendite">
                            Konstante jährliche Rendite für die gesamte Sparphase
                        </RadioTile>
                        <RadioTile value="random" label="Zufällige Rendite">
                            Monte Carlo Simulation mit Durchschnitt und Volatilität
                        </RadioTile>
                        <RadioTile value="variable" label="Variable Rendite">
                            Jahr-für-Jahr konfigurierbare Renditen für realistische Szenarien
                        </RadioTile>
                    </RadioTileGroup>
                    <p className="text-sm text-muted-foreground">
                        Konfiguration der erwarteten Rendite während der Ansparphase (bis zum Beginn der Entnahme).
                    </p>
                </div>

                {returnMode === 'fixed' && <FixedReturnConfiguration />}
                {returnMode === 'random' && <RandomReturnConfiguration />}
                {returnMode === 'variable' && <VariableReturnConfiguration />}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

export default ReturnConfiguration;
