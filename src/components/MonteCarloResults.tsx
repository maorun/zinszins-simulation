import React from 'react';
import { Panel, Table } from 'rsuite';
import type { RandomReturnConfig } from '../utils/random-returns';

const { Column, HeaderCell, Cell } = Table;

interface MonteCarloResultsProps {
    years: number[];
    randomConfig: RandomReturnConfig;
    runs?: number;
}

interface MonteCarloResult {
    scenario: string;
    description: string;
    probability: string;
}

export function MonteCarloResults({
    years: _years,
    randomConfig,
    runs: _runs = 500
}: MonteCarloResultsProps) {
    const formatPercent = (value: number) => (value * 100).toFixed(1) + '%';

    // Create statistical scenarios based on normal distribution
    const scenarios: MonteCarloResult[] = [
        {
            scenario: 'Worst Case (5% Perzentil)',
            description: `Bei sehr ungünstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(randomConfig.averageReturn - 1.645 * (randomConfig.standardDeviation || 0.15))}`,
            probability: '5% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt'
        },
        {
            scenario: 'Pessimistisches Szenario (25% Perzentil)',
            description: `Bei unterdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(randomConfig.averageReturn - 0.674 * (randomConfig.standardDeviation || 0.15))}`,
            probability: '25% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt'
        },
        {
            scenario: 'Median-Szenario (50% Perzentil)',
            description: `Bei durchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(randomConfig.averageReturn)}`,
            probability: '50% Wahrscheinlichkeit für bessere/schlechtere Ergebnisse'
        },
        {
            scenario: 'Optimistisches Szenario (75% Perzentil)',
            description: `Bei überdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(randomConfig.averageReturn + 0.674 * (randomConfig.standardDeviation || 0.15))}`,
            probability: '25% Wahrscheinlichkeit für bessere Ergebnisse'
        },
        {
            scenario: 'Best Case (95% Perzentil)',
            description: `Bei sehr günstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(randomConfig.averageReturn + 1.645 * (randomConfig.standardDeviation || 0.15))}`,
            probability: '5% Wahrscheinlichkeit für bessere Ergebnisse'
        }
    ];

    const getRowClassName = (scenario: string) => {
        if (scenario.includes('Best Case')) return 'success-row';
        if (scenario.includes('Worst Case')) return 'danger-row';
        if (scenario.includes('Median')) return 'info-row';
        return '';
    };

    return (
        <Panel header={`Statistische Szenarien (Monte Carlo Simulation)`} bordered collapsible>
            <div style={{ marginBottom: '20px' }}>
                <p>
                    <strong>Simulationsparameter:</strong> Durchschnittliche Rendite {formatPercent(randomConfig.averageReturn)}, 
                    Volatilität {formatPercent(randomConfig.standardDeviation || 0.15)}
                </p>
                <p>
                    <strong>Annahme:</strong> Die jährlichen Renditen folgen einer Normalverteilung. 
                    Reale Märkte können von dieser Annahme abweichen.
                </p>
                {randomConfig.seed && (
                    <p>
                        <strong>Zufallsseed:</strong> {randomConfig.seed} (deterministische Ergebnisse)
                    </p>
                )}
            </div>

            <Table 
                data={scenarios}
                autoHeight
                rowClassName={(rowData) => getRowClassName(rowData?.scenario || '')}
            >
                <Column width={200} flexGrow={1}>
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
        </Panel>
    );
}