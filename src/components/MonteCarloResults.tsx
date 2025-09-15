import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { useNestingLevel } from '../lib/nesting-utils'
import type { RandomReturnConfig } from '../utils/random-returns'

interface MonteCarloResultsProps {
  years: number[]
  accumulationConfig: RandomReturnConfig
  withdrawalConfig?: RandomReturnConfig
  runs?: number
}

interface MonteCarloResult {
  scenario: string
  description: string
  probability: string
}

export function MonteCarloResults({
  years: _years,
  accumulationConfig,
  withdrawalConfig,
  runs: _runs = 500,
}: MonteCarloResultsProps) {
  const nestingLevel = useNestingLevel()
  const formatPercent = (value: number) => (value * 100).toFixed(1) + '%'

  // Create statistical scenarios based on normal distribution
  const createScenarios = (config: RandomReturnConfig): MonteCarloResult[] => [
    {
      scenario: 'Worst Case (5% Perzentil)',
      description: `Bei sehr ungünstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 1.645 * (config.standardDeviation || 0.15))}`,
      probability: '5% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt',
    },
    {
      scenario: 'Pessimistisches Szenario (25% Perzentil)',
      description: `Bei unterdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 0.674 * (config.standardDeviation || 0.15))}`,
      probability: '25% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt',
    },
    {
      scenario: 'Median-Szenario (50% Perzentil)',
      description: `Bei durchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn)}`,
      probability: '50% Wahrscheinlichkeit für bessere/schlechtere Ergebnisse',
    },
    {
      scenario: 'Optimistisches Szenario (75% Perzentil)',
      description: `Bei überdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 0.674 * (config.standardDeviation || 0.15))}`,
      probability: '25% Wahrscheinlichkeit für bessere Ergebnisse',
    },
    {
      scenario: 'Best Case (95% Perzentil)',
      description: `Bei sehr günstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 1.645 * (config.standardDeviation || 0.15))}`,
      probability: '5% Wahrscheinlichkeit für bessere Ergebnisse',
    },
  ]

  const accumulationScenarios = createScenarios(accumulationConfig)
  const withdrawalScenarios = withdrawalConfig ? createScenarios(withdrawalConfig) : null

  const getRowClassName = (scenario: string) => {
    if (scenario.includes('Best Case')) return 'success-row'
    if (scenario.includes('Worst Case')) return 'danger-row'
    if (scenario.includes('Median')) return 'info-row'
    return ''
  }

  const renderAnalysisTable = (scenarios: MonteCarloResult[], config: RandomReturnConfig, title: string) => (
    <div style={{ marginBottom: '30px' }}>
      <h4 style={{ color: '#1976d2', marginBottom: '15px' }}>
        📊
        {title}
      </h4>
      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>Simulationsparameter:</strong>
          {' '}
          Durchschnittliche Rendite
          {formatPercent(config.averageReturn)}
          ,
          Volatilität
          {formatPercent(config.standardDeviation || 0.15)}
        </p>
        <p>
          <strong>Annahme:</strong>
          {' '}
          Die jährlichen Renditen folgen einer Normalverteilung.
          Reale Märkte können von dieser Annahme abweichen.
        </p>
        {config.seed && (
          <p>
            <strong>Zufallsseed:</strong>
            {' '}
            {config.seed}
            {' '}
            (deterministische Ergebnisse)
          </p>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="mobile-only monte-carlo-mobile">
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
      <div className="desktop-only table-container">
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
                <TableCell>{scenario.scenario}</TableCell>
                <TableCell>{scenario.description}</TableCell>
                <TableCell>{scenario.probability}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0"
            asChild
          >
            <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle>📊 Statistische Szenarien (Monte Carlo)</CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            {renderAnalysisTable(accumulationScenarios, accumulationConfig, 'Ansparphase (Aufbauphase)')}

            {withdrawalScenarios && withdrawalConfig && (
              renderAnalysisTable(withdrawalScenarios, withdrawalConfig, 'Entnahmephase (Entsparphase)')
            )}

            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
              <h6>💡 Hinweis zu Monte Carlo Simulationen:</h6>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Diese Szenarien basieren auf statistischen Modellen und historischen Annahmen.
                Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur
                groben Orientierung und ersetzt keine professionelle Finanzberatung.
              </p>
            </div>

            <style>
              {`
                .success-row {
                    background-color: #d4edda !important;
                }
                .danger-row {
                    background-color: #f8d7da !important;
                }
                .info-row {
                    background-color: #d1ecf1 !important;
                }
            `}
            </style>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
