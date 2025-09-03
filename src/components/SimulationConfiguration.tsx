import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
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
                    <div>
                        <Label className="text-base font-medium">Berechnungsmodus</Label>
                        <div className="flex space-x-6 mt-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="yearly"
                                    checked={simulationAnnual === 'yearly'}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSimulationAnnual(value as any);
                                        setSparplanElemente(convertSparplanToElements(sparplan, startEnd, value as any));
                                    }}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                />
                                <span>Jährlich</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="monthly"
                                    checked={simulationAnnual === 'monthly'}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSimulationAnnual(value as any);
                                        setSparplanElemente(convertSparplanToElements(sparplan, startEnd, value as any));
                                    }}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                />
                                <span>Monatlich</span>
                            </label>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SimulationConfiguration;
