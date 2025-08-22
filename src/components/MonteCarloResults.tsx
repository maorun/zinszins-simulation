import { Panel } from "rsuite";
import 'rsuite/dist/rsuite.min.css';
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
        <Panel header={`📊 ${title}`} bordered collapsible defaultExpanded>
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Simulationsparameter:</strong> Durchschnittliche Rendite {formatPercent(config.averageReturn)}, 
                    Volatilität {formatPercent(config.standardDeviation || 0.15)}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Annahme:</strong> Die jährlichen Renditen folgen einer Normalverteilung. 
                    Reale Märkte können von dieser Annahme abweichen.
                </p>
                {config.seed && (
                    <p style={{ marginBottom: '0.5rem' }}>
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
        </Panel>
    );

    return (
        <Panel header="🎲 Monte Carlo Analyse" bordered collapsible defaultExpanded>
            {renderAnalysisCards(accumulationScenarios, accumulationConfig, 'Ansparphase (Aufbauphase)')}
            
            {withdrawalScenarios && withdrawalConfig && (
                renderAnalysisCards(withdrawalScenarios, withdrawalConfig, 'Entnahmephase (Entsparphase)')
            )}

            <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #e6e6e6', 
                borderRadius: '6px' 
            }}>
                <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>💡 Hinweis zu Monte Carlo Simulationen:</h6>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                    Diese Simulation basiert auf statistischen Modellen und historischen Annahmen. 
                    Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur 
                    groben Orientierung und ersetzt keine professionelle Finanzberatung.
                </p>
            </div>
        </Panel>
    );
}