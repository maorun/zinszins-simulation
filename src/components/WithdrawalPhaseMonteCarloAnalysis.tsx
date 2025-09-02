import { Table } from 'rsuite';
import type { RandomReturnConfig } from '../utils/random-returns';
import { useSimulation } from '../contexts/useSimulation';

const { Column, HeaderCell, Cell } = Table;

interface MonteCarloResult {
    scenario: string;
    description: string;
    probability: string;
}

const WithdrawalPhaseMonteCarloAnalysis = () => {
    const { simulationData, randomSeed } = useSimulation();

    if (!simulationData) return null;
    
    const withdrawalConfig: RandomReturnConfig = {
        averageReturn: 0.05, // Default 5% for withdrawal phase (more conservative)
        standardDeviation: 0.12, // Default 12% volatility (more conservative)
        seed: randomSeed
    };

    // Helper functions copied from MonteCarloResults
    const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
    
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

    const getRowClassName = (scenario: string) => {
        if (scenario.includes('Best Case')) return 'success-row';
        if (scenario.includes('Worst Case')) return 'danger-row';
        if (scenario.includes('Median')) return 'info-row';
        return '';
    };

    const scenarios = createScenarios(withdrawalConfig);

    return (
        <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '15px' }}>📊 Monte Carlo Analyse - Entnahmephase</h4>
            <div style={{ marginBottom: '20px' }}>
                <p>
                    <strong>Simulationsparameter:</strong> Durchschnittliche Rendite {formatPercent(withdrawalConfig.averageReturn)}, 
                    Volatilität {formatPercent(withdrawalConfig.standardDeviation || 0.15)}
                </p>
                <p>
                    <strong>Annahme:</strong> Die jährlichen Renditen folgen einer Normalverteilung. 
                    Reale Märkte können von dieser Annahme abweichen.
                </p>
                {withdrawalConfig.seed && (
                    <p>
                        <strong>Zufallsseed:</strong> {withdrawalConfig.seed} (deterministische Ergebnisse)
                    </p>
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="desktop-only">
                <Table
                    data={scenarios}
                    bordered
                    style={{ marginBottom: '20px' }}
                    rowClassName={(rowData) => rowData ? getRowClassName(rowData.scenario) : ''}
                >
                    <Column width={300} flexGrow={1}>
                        <HeaderCell>Szenario</HeaderCell>
                        <Cell dataKey="scenario" />
                    </Column>

                    <Column width={400} flexGrow={2}>
                        <HeaderCell>Beschreibung</HeaderCell>
                        <Cell dataKey="description" />
                    </Column>

                    <Column width={200} flexGrow={1}>
                        <HeaderCell>Wahrscheinlichkeit</HeaderCell>
                        <Cell dataKey="probability" />
                    </Column>
                </Table>
            </div>

            {/* Mobile Card Layout */}
            <div className="mobile-only monte-carlo-mobile">
                {scenarios.map((scenario, index) => (
                    <div key={index} className={`monte-carlo-card ${getRowClassName(scenario.scenario)}`}>
                        <div className="monte-carlo-header">
                            <span className="scenario-name">{scenario.scenario}</span>
                            <span className="probability">{scenario.probability}</span>
                        </div>
                        <div className="monte-carlo-description">
                            {scenario.description}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                <h6>💡 Hinweis zu Monte Carlo Simulationen:</h6>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    Diese Szenarien basieren auf statistischen Modellen und historischen Annahmen. 
                    Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur 
                    groben Orientierung und ersetzt keine professionelle Finanzberatung.
                </p>
            </div>

            <style>{`
                .success-row {
                    background-color: #d4edda !important;
                }
                .danger-row {
                    background-color: #f8d7da !important;
                }
                .info-row {
                    background-color: #d1ecf1 !important;
                }
            `}</style>
        </div>
    );
};

export default WithdrawalPhaseMonteCarloAnalysis;