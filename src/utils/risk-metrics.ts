/**
 * Risk metrics calculations for portfolio analysis
 * Includes VaR, Drawdown, Sharpe Ratio, and other risk measures
 */

export interface RiskMetrics {
  // Single-value metrics
  valueAtRisk5: number; // 5% VaR
  valueAtRisk1: number; // 1% VaR
  maxDrawdown: number; // Maximum drawdown percentage
  sharpeRatio: number; // Risk-adjusted return
  sortinoRatio: number; // Downside risk-adjusted return
  calmarRatio: number; // Annual return / max drawdown
  volatility: number; // Standard deviation of returns
  
  // Time series data for detailed analysis
  drawdownSeries?: Array<{ year: number; drawdown: number; value: number }>;
  returnSeries?: Array<{ year: number; return: number }>;
}

export interface PortfolioData {
  years: number[];
  values: number[]; // Portfolio values for each year
  returns?: number[]; // Annual returns (optional, will be calculated if not provided)
  riskFreeRate?: number; // Risk-free rate for Sharpe ratio calculation (default: 0.02)
}

/**
 * Calculate annual returns from portfolio values
 */
export function calculateReturns(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const previousValue = values[i - 1];
    const currentValue = values[i];
    if (previousValue > 0) {
      returns.push((currentValue - previousValue) / previousValue);
    } else if (previousValue === 0 && currentValue > 0) {
      returns.push(Infinity); // Handle division by zero case
    } else {
      returns.push(0);
    }
  }
  return returns;
}

/**
 * Calculate Value-at-Risk at specified confidence level
 */
export function calculateVaR(returns: number[], confidenceLevel: number): number {
  if (returns.length === 0) return 0;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  return Math.abs(sortedReturns[index] || 0);
}

/**
 * Calculate maximum drawdown and drawdown series
 */
export function calculateDrawdown(values: number[]): {
  maxDrawdown: number;
  drawdownSeries: Array<{ year: number; drawdown: number; value: number }>;
} {
  if (values.length === 0) {
    return { maxDrawdown: 0, drawdownSeries: [] };
  }

  let maxValue = values[0];
  let maxDrawdown = 0;
  const drawdownSeries: Array<{ year: number; drawdown: number; value: number }> = [];

  values.forEach((value, index) => {
    maxValue = Math.max(maxValue, value);
    const drawdown = maxValue > 0 ? (maxValue - value) / maxValue : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    
    drawdownSeries.push({
      year: index,
      drawdown: drawdown * 100, // Convert to percentage
      value
    });
  });

  return {
    maxDrawdown: maxDrawdown * 100, // Convert to percentage
    drawdownSeries
  };
}

/**
 * Calculate Sharpe Ratio
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const excessReturn = avgReturn - riskFreeRate;
  
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Handle near-zero standard deviation
  if (standardDeviation < 1e-10) return 0;
  
  return excessReturn / standardDeviation;
}

/**
 * Calculate Sortino Ratio (uses only downside volatility)
 */
export function calculateSortinoRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const excessReturn = avgReturn - riskFreeRate;
  
  // Calculate downside deviation (only negative excess returns)
  const negativeReturns = returns.filter(ret => ret < riskFreeRate);
  if (negativeReturns.length === 0) return Infinity; // No downside risk
  
  const downsideVariance = negativeReturns.reduce((sum, ret) => 
    sum + Math.pow(ret - riskFreeRate, 2), 0) / returns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);
  
  return downsideDeviation > 0 ? excessReturn / downsideDeviation : 0;
}

/**
 * Calculate Calmar Ratio (annual return divided by maximum drawdown)
 */
export function calculateCalmarRatio(returns: number[], maxDrawdown: number): number {
  if (returns.length === 0 || maxDrawdown === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const annualizedReturn = avgReturn * 100; // Convert to percentage
  
  return annualizedReturn / maxDrawdown;
}

/**
 * Calculate volatility (standard deviation of returns)
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Handle floating point precision issues
  return standardDeviation < 1e-10 ? 0 : standardDeviation * 100; // Convert to percentage
}

/**
 * Calculate comprehensive risk metrics for a portfolio
 */
export function calculateRiskMetrics(data: PortfolioData): RiskMetrics {
  const { values, riskFreeRate = 0.02 } = data;
  
  // Calculate returns if not provided
  const returns = data.returns || calculateReturns(values);
  
  // Calculate drawdown metrics
  const { maxDrawdown, drawdownSeries } = calculateDrawdown(values);
  
  // Calculate single-value metrics
  const valueAtRisk5 = calculateVaR(returns, 0.95);
  const valueAtRisk1 = calculateVaR(returns, 0.99);
  const sharpeRatio = calculateSharpeRatio(returns, riskFreeRate);
  const sortinoRatio = calculateSortinoRatio(returns, riskFreeRate);
  const calmarRatio = calculateCalmarRatio(returns, maxDrawdown);
  const volatility = calculateVolatility(returns);
  
  // Create return series for display
  const returnSeries = returns.map((ret, index) => ({
    year: index + 1,
    return: ret * 100 // Convert to percentage
  }));

  return {
    valueAtRisk5: valueAtRisk5 * 100, // Convert to percentage
    valueAtRisk1: valueAtRisk1 * 100, // Convert to percentage
    maxDrawdown,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    volatility,
    drawdownSeries,
    returnSeries
  };
}

/**
 * Format risk metrics for display
 */
export function formatRiskMetric(value: number, type: 'percentage' | 'ratio' | 'currency'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'ratio':
      return value.toFixed(3);
    case 'currency':
      return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    default:
      return value.toFixed(2);
  }
}