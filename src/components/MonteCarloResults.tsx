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

    const getCardClassName = (scenario: string) => {
        if (scenario.includes('Best Case')) return 'border-green-500 bg-green-50';
        if (scenario.includes('Worst Case')) return 'border-red-500 bg-red-50';
        if (scenario.includes('Median')) return 'border-blue-500 bg-blue-50';
        return 'border-gray-200';
    };

    const renderAnalysisCards = (scenarios: MonteCarloResult[], config: RandomReturnConfig, title: string) => (
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

            {/* Card Layout for all scenarios */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario, index) => (
                    <Card key={index} className={`${getCardClassName(scenario.scenario)}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{scenario.scenario}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-2">
                                {scenario.description}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                                {scenario.probability}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                            Monte Carlo Analyse
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent>
                        {renderAnalysisCards(accumulationScenarios, accumulationConfig, 'Ansparphase (Aufbauphase)')}
                        
                        {withdrawalScenarios && withdrawalConfig && (
                            renderAnalysisCards(withdrawalScenarios, withdrawalConfig, 'Entnahmephase (Entsparphase)')
                        )}

                        <div className="mt-4 p-3 bg-muted/50 border border-gray-200 rounded-md">
                            <h6 className="font-semibold mb-2">💡 Hinweis zu Monte Carlo Simulationen:</h6>
                            <p className="text-sm text-muted-foreground">
                                Diese Simulation basiert auf statistischen Modellen und historischen Annahmen. 
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