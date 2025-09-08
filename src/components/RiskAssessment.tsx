import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useSimulation } from '../contexts/useSimulation';
import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay';
import { calculateRiskMetrics, formatRiskMetric, type PortfolioData } from '../utils/risk-metrics';
import type { RandomReturnConfig } from '../utils/random-returns';

interface RiskAssessmentProps {
  phase: 'savings' | 'withdrawal';
  config?: RandomReturnConfig;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ phase, config }) => {
  const { simulationData, averageReturn, standardDeviation, randomSeed, returnMode } = useSimulation();

  // Use provided config or default based on phase
  const riskConfig: RandomReturnConfig = config || {
    averageReturn: phase === 'savings' ? averageReturn / 100 : 0.05,
    standardDeviation: phase === 'savings' ? standardDeviation / 100 : 0.12,
    seed: randomSeed
  };

  // Extract portfolio data for risk calculations
  const portfolioData: PortfolioData = React.useMemo(() => {
    if (!simulationData) {
      return { years: [], values: [], riskFreeRate: 0.02 };
    }

    const years: number[] = [];
    const values: number[] = [];

    // Get data from simulation results
    const allYears = Object.keys(simulationData.sparplanElements[0]?.simulation || {})
      .map(Number)
      .filter(year => !isNaN(year))
      .sort((a, b) => a - b);

    allYears.forEach(year => {
      const totalValue = simulationData.sparplanElements.reduce((sum: number, element: any) => {
        return sum + (element.simulation?.[year]?.endkapital || 0);
      }, 0);
      
      if (totalValue > 0) {
        years.push(year);
        values.push(totalValue);
      }
    });

    return {
      years,
      values,
      riskFreeRate: 0.02 // 2% risk-free rate
    };
  }, [simulationData]);

  // Calculate risk metrics
  const riskMetrics = React.useMemo(() => {
    if (portfolioData.values.length < 2) {
      return null;
    }
    return calculateRiskMetrics(portfolioData);
  }, [portfolioData]);

  // Check if we have meaningful risk data (not all zeros)
  const hasRiskData = React.useMemo(() => {
    if (!riskMetrics) return false;
    
    // Check if there's actual variation in the data
    const hasDrawdown = riskMetrics.maxDrawdown > 0.01;
    const hasVolatility = riskMetrics.volatility > 0.01;
    const hasVaR = riskMetrics.valueAtRisk5 > 0.01;
    
    return hasDrawdown || hasVolatility || hasVaR;
  }, [riskMetrics]);

  if (!simulationData) return null;

  const phaseTitle = phase === 'savings' ? 'Ansparphase' : 'Entnahmephase';

  return (
    <Card className="mt-4">
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">🎯 Risikobewertung - {phaseTitle}</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
      <div className="space-y-4">
        {/* Show notice for fixed return mode */}
        {returnMode === 'fixed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 font-semibold mb-2">ℹ️ Feste Rendite gewählt</div>
            <div className="text-sm text-blue-700">
              Bei einer festen Rendite gibt es keine Volatilität und damit keine klassischen Risikokennzahlen. 
              Wechseln Sie zu "Zufällige Renditen" oder "Variable Renditen" für eine vollständige Risikoanalyse.
            </div>
          </div>
        )}

        {/* Single-value metrics displayed prominently */}
        {riskMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 border-l-4 border-l-red-500">
              <div className="text-sm font-medium text-gray-600 mb-1">📉 Value-at-Risk (95%)</div>
              <div className="text-xl font-bold text-red-700">
                {formatRiskMetric(riskMetrics.valueAtRisk5, 'percentage')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Zeigt potenzielle Verluste in einer bestimmten Zeitperiode mit einer bestimmten Wahrscheinlichkeit. In 5% der Fälle können die Verluste diesen Wert erreichen oder überschreiten.
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 border-l-4 border-l-orange-500">
              <div className="text-sm font-medium text-gray-600 mb-1">📊 Maximum Drawdown</div>
              <div className="text-xl font-bold text-orange-700">
                {formatRiskMetric(riskMetrics.maxDrawdown, 'percentage')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Der größte Verlust vom Höchststand bis zum Tiefststand in der betrachteten Periode. Misst das maximale Risiko von Portfoliorückgängen.
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 border-l-4 border-l-blue-500">
              <div className="text-sm font-medium text-gray-600 mb-1">⚖️ Sharpe Ratio</div>
              <div className="text-xl font-bold text-blue-700">
                {formatRiskMetric(riskMetrics.sharpeRatio, 'ratio')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Misst die risikoadjustierte Rendite. Höhere Werte zeigen bessere Renditen pro Risikoeinheit und eine effizientere Nutzung des eingegangenen Risikos.
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 border-l-4 border-l-purple-500">
              <div className="text-sm font-medium text-gray-600 mb-1">📈 Volatilität</div>
              <div className="text-xl font-bold text-purple-700">
                {formatRiskMetric(riskMetrics.volatility, 'percentage')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Standardabweichung der Renditen. Misst die Schwankungsbreite der Anlage - höhere Werte bedeuten unvorhersagbarere Ergebnisse.
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 border-l-4 border-l-green-500">
              <div className="text-sm font-medium text-gray-600 mb-1">🎯 Sortino Ratio</div>
              <div className="text-xl font-bold text-green-700">
                {riskMetrics.sortinoRatio >= 999 ? '999+' : formatRiskMetric(riskMetrics.sortinoRatio, 'ratio')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ähnlich der Sharpe Ratio, berücksichtigt aber nur negative Volatilität (Downside-Risk). Fokussiert auf unerwünschte Verluste statt allgemeine Schwankungen.
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 border-l-4 border-l-indigo-500">
              <div className="text-sm font-medium text-gray-600 mb-1">📊 Calmar Ratio</div>
              <div className="text-xl font-bold text-indigo-700">
                {riskMetrics.calmarRatio >= 999 ? '999+' : formatRiskMetric(riskMetrics.calmarRatio, 'ratio')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Verhältnis von Jahresrendite zu maximalem Drawdown. Bewertet die Performance im Verhältnis zum größten erlittenen Verlust.
              </div>
            </div>
          </div>
        )}

        {/* Additional risk metrics */}
        {riskMetrics && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">📉 Value-at-Risk (99%)</div>
                <div className="text-lg font-bold text-gray-700">
                  {formatRiskMetric(riskMetrics.valueAtRisk1, 'percentage')}
                </div>
                <div className="text-xs text-gray-500">Potenzielle Verluste in 1% der Fälle - extremere Verlustszenarien als VaR 95%</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">📊 Datenpunkte</div>
                <div className="text-lg font-bold text-gray-700">
                  {portfolioData.values.length} Jahre
                </div>
                <div className="text-xs text-gray-500">Simulationszeitraum für Risikoanalyse</div>
              </div>
            </div>
          </div>
        )}

        {/* Monte Carlo Analysis in collapsible sub-panel */}
        <Card className="border-l-4 border-l-blue-400">
          <Collapsible defaultOpen={false}>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                  <CardTitle className="text-left">🎲 Monte Carlo Analyse</CardTitle>
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
          <MonteCarloAnalysisDisplay 
            config={riskConfig}
            title="Monte Carlo Simulation"
            phaseTitle={phaseTitle}
          />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Drawdown Analysis in collapsible sub-panel if there's detailed data */}
        {riskMetrics?.drawdownSeries && hasRiskData && riskMetrics.drawdownSeries.length > 3 && (
          <Card className="border-l-4 border-l-orange-400">
            <Collapsible defaultOpen={false}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                    <CardTitle className="text-left">📈 Drawdown-Analyse</CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Drawdown-Analyse:</strong> Zeigt die historische Entwicklung von Verlusten 
                ausgehend von Höchstständen des Portfolios. Ein Drawdown von 20% bedeutet, dass das 
                Portfolio 20% unter seinem bisherigen Höchststand liegt.
              </p>
              
              {/* Only show detailed analysis if there are actual drawdowns */}
              {riskMetrics.drawdownSeries.filter(item => item.drawdown > 0.1).length > 0 ? (
                <>
                  {/* Drawdown Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-600">Maximum Drawdown</div>
                      <div className="text-lg font-bold text-red-700">
                        {formatRiskMetric(riskMetrics.maxDrawdown, 'percentage')}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-600">Durchschnittlicher Drawdown</div>
                      <div className="text-lg font-bold text-orange-700">
                        {formatRiskMetric(
                          riskMetrics.drawdownSeries.reduce((sum, item) => sum + item.drawdown, 0) / riskMetrics.drawdownSeries.length,
                          'percentage'
                        )}
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-600">Perioden im Drawdown</div>
                      <div className="text-lg font-bold text-yellow-700">
                        {riskMetrics.drawdownSeries.filter(item => item.drawdown > 0).length} Jahre
                      </div>
                    </div>
                  </div>

                  {/* Drawdown Table for detailed analysis */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jahr</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio-Wert</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drawdown</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {riskMetrics.drawdownSeries
                          .filter(item => item.drawdown > 1) // Only show significant drawdowns
                          .slice(0, 10) // Limit to first 10 items
                          .map((item, index) => (
                            <tr key={index} className={item.drawdown > 10 ? 'bg-red-50' : 'bg-white'}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {portfolioData.years[item.year] || `Jahr ${item.year + 1}`}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatRiskMetric(item.value, 'currency')}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium">
                                <span className={`${item.drawdown > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                                  -{formatRiskMetric(item.drawdown, 'percentage')}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {riskMetrics.drawdownSeries.filter(item => item.drawdown > 1).length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Zeigt die ersten 10 Jahre mit signifikanten Drawdowns (&gt; 1%).
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-semibold mb-2">✅ Keine signifikanten Drawdowns</div>
                  <div className="text-sm text-green-700">
                    Im simulierten Zeitraum gab es keine nennenswerten Verluste vom Höchststand. 
                    Dies deutet auf eine stabile Aufwärtsentwicklung hin.
                  </div>
                </div>
              )}
            </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RiskAssessment;