import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { RandomReturnConfig } from '../utils/random-returns';

interface MonteCarloResultsProps {
    years: number[];
    accumulationConfig: RandomReturnConfig;
    withdrawalConfig?: RandomReturnConfig;
    runs?: number;
}

interface MonteCarloResult {
    scenario: string;
    description: string;
    probability: string;
}

export function MonteCarloResults({
    years: _years,
    accumulationConfig,
    withdrawalConfig,
    runs: _runs = 500
}: MonteCarloResultsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const formatPercent = (value: number) => (value * 100).toFixed(1) + '%';

    // Create statistical scenarios based on normal distribution
    const createScenarios = (config: RandomReturnConfig): MonteCarloResult[] => [
        {
            scenario: 'Worst Case (5% Perzentil)',
            description: `Bei sehr ungünstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 1.645 * (config.standardDeviation || 0.15))}`,
            probability: '5% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt'
        },
        {
            scenario: 'Pessimistisches Szenario (25% Perzentil)',
            description: `Bei unterdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 0.674 * (config.standardDeviation || 0.15))}`,
            probability: '25% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt'
        },
        {
            scenario: 'Median-Szenario (50% Perzentil)',
            description: `Bei durchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn)}`,
            probability: '50% Wahrscheinlichkeit für bessere/schlechtere Ergebnisse'
        },
        {
            scenario: 'Optimistisches Szenario (75% Perzentil)',
            description: `Bei überdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 0.674 * (config.standardDeviation || 0.15))}`,
            probability: '25% Wahrscheinlichkeit für bessere Ergebnisse'
        },
        {
            scenario: 'Best Case (95% Perzentil)',
            description: `Bei sehr günstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 1.645 * (config.standardDeviation || 0.15))}`,
            probability: '5% Wahrscheinlichkeit für bessere Ergebnisse'
        }
    ];

    const accumulationScenarios = createScenarios(accumulationConfig);
    const withdrawalScenarios = withdrawalConfig ? createScenarios(withdrawalConfig) : null;

    const getRowClassName = (scenario: string) => {
        if (scenario.includes('Best Case')) return 'bg-green-50 border-l-4 border-green-500';
        if (scenario.includes('Worst Case')) return 'bg-red-50 border-l-4 border-red-500';
        if (scenario.includes('Median')) return 'bg-blue-50 border-l-4 border-blue-500';
        return '';
    };

    const renderAnalysisTable = (scenarios: MonteCarloResult[], config: RandomReturnConfig, title: string) => (
        <div className="mb-8">
            <h4 className="text-lg font-semibold text-blue-600 mb-4">📊 {title}</h4>
            <div className="mb-5 text-sm text-muted-foreground">
                <p className="mb-2">
                    <strong>Simulationsparameter:</strong> Durchschnittliche Rendite {formatPercent(config.averageReturn)}, 
                    Volatilität {formatPercent(config.standardDeviation || 0.15)}
                </p>
                <p className="mb-2">
                    <strong>Annahme:</strong> Die jährlichen Renditen folgen einer Normalverteilung. 
                    Reale Märkte können von dieser Annahme abweichen.
                </p>
                {config.seed && (
                    <p>
                        <strong>Zufallsseed:</strong> {config.seed} (deterministische Ergebnisse)
                    </p>
                )}
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden monte-carlo-mobile">
                {scenarios.map((scenario, index) => (
                    <div key={index} className={`monte-carlo-card ${getRowClassName(scenario.scenario)}`}>
                        <div className="monte-carlo-header">
                            <span className="scenario-name">{scenario.scenario}</span>
                            <span className="probability">{scenario.probability}</span>
                        </div>
                        <div className="scenario-description">
                            {scenario.description}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Szenario</TableHead>
                            <TableHead>Beschreibung</TableHead>
                            <TableHead>Wahrscheinlichkeit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scenarios.map((scenario, index) => (
                            <TableRow key={index} className={getRowClassName(scenario.scenario)}>
                                <TableCell className="font-medium">{scenario.scenario}</TableCell>
                                <TableCell>{scenario.description}</TableCell>
                                <TableCell>{scenario.probability}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                            Statistische Szenarien (Monte Carlo Simulation)
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent>
                        {renderAnalysisTable(accumulationScenarios, accumulationConfig, 'Ansparphase (Aufbauphase)')}
                        
                        {withdrawalScenarios && withdrawalConfig && (
                            renderAnalysisTable(withdrawalScenarios, withdrawalConfig, 'Entnahmephase (Entsparphase)')
                        )}

                        <div className="mt-4 p-3 bg-muted/50 border border-border rounded-md">
                            <h6 className="font-semibold mb-2">💡 Hinweis zu Monte Carlo Simulationen:</h6>
                            <p className="text-sm text-muted-foreground">
                                Diese Szenarien basieren auf statistischen Modellen und historischen Annahmen. 
                                Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur 
                                groben Orientierung und ersetzt keine professionelle Finanzberatung.
                            </p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}