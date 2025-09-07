import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SimulationConfiguration = () => {
    const {
        simulationAnnual,
        setSimulationAnnual,
        setSparplanElemente,
        sparplan,
        startEnd,
    } = useSimulation();

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>⚙️ Simulation-Konfiguration</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                            <Label htmlFor="berechnungsmodus" className="font-medium">Berechnungsmodus</Label>
                            <p className="text-sm text-muted-foreground">
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
                </div>
            </CardContent>
        </Card>
    );
};

export default SimulationConfiguration;
