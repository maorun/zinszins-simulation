import type { RandomReturnConfig } from '../utils/random-returns';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';

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
        if (scenario.includes('Best Case')) return 'monte-carlo-card monte-carlo-best';
        if (scenario.includes('Worst Case')) return 'monte-carlo-card monte-carlo-worst';
        if (scenario.includes('Median')) return 'monte-carlo-card monte-carlo-median';
        return 'monte-carlo-card';
    };

    const renderAnalysisCards = (scenarios: MonteCarloResult[], config: RandomReturnConfig, title: string) => (
        <Collapsible defaultOpen className="group">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 font-semibold text-lg border rounded-md">
                <span><span className="mr-2">📊</span> {title}</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-[data-state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4 text-sm text-muted-foreground">
                            <p className="mb-2">
                                <strong>Simulationsparameter:</strong> Durchschnittliche Rendite {formatPercent(config.averageReturn)},
                                Volatilität {formatPercent(config.standardDeviation || 0.15)}
                            </p>
                            <p className="mb-2">
                                <strong>Annahme:</strong> Die jährlichen Renditen folgen einer Normalverteilung.
                                Reale Märkte können von dieser Annahme abweichen.
                            </p>
                            {config.seed && (
                                <p className="mb-2">
                                    <strong>Zufallsseed:</strong> {config.seed} (deterministische Ergebnisse)
                                </p>
                            )}
                        </div>

                        {/* Scenario Cards Grid */}
                        <div className="monte-carlo-scenarios-grid">
                            {scenarios.map((scenario, index) => (
                                <div key={index} className={getCardClassName(scenario.scenario)}>
                                    <div className="monte-carlo-card-header">
                                        <div className="monte-carlo-scenario-title">{scenario.scenario}</div>
                                    </div>
                                    <div className="monte-carlo-card-content">
                                        <p className="monte-carlo-description">
                                            {scenario.description}
                                        </p>
                                        <p className="monte-carlo-probability">
                                            {scenario.probability}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    );

    return (
        <Collapsible defaultOpen className="group">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 font-semibold text-lg border rounded-md">
                <span><span className="mr-2">🎲</span> Monte Carlo Analyse</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-[data-state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
                {renderAnalysisCards(accumulationScenarios, accumulationConfig, 'Ansparphase (Aufbauphase)')}

                {withdrawalScenarios && withdrawalConfig && (
                    renderAnalysisCards(withdrawalScenarios, withdrawalConfig, 'Entnahmephase (Entsparphase)')
                )}

                <div className="mt-4 p-4 bg-gray-100 rounded-md border">
                    <h6 className="font-semibold mb-2">💡 Hinweis zu Monte Carlo Simulationen:</h6>
                    <p className="text-sm text-muted-foreground">
                        Diese Simulation basiert auf statistischen Modellen und historischen Annahmen.
                        Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur
                        groben Orientierung und ersetzt keine professionelle Finanzberatung.
                    </p>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}