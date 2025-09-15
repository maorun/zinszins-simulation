import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card';

const SimulationConfiguration = () => {
    const {
        simulationAnnual,
        setSimulationAnnual,
        setSparplanElemente,
        sparplan,
        startEnd,
    } = useSimulation();

    return (
        <CollapsibleCard>
            <CollapsibleCardHeader>⚙️ Simulation-Konfiguration</CollapsibleCardHeader>
                <CollapsibleCardContent>
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
                </CollapsibleCardContent>
        </CollapsibleCard>
    );
};

export default SimulationConfiguration;
