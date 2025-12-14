/**
 * Historical market data for backtesting functionality
 *
 * IMPORTANT: Past performance does not predict future results.
 * This data is for educational and testing purposes only.
 */

export interface HistoricalDataPoint {
  year: number
  return: number // Annual return as decimal (e.g., 0.05 for 5%)
}

export interface HistoricalIndex {
  id: string
  name: string
  description: string
  currency: string
  data: HistoricalDataPoint[]
  startYear: number
  endYear: number
  averageReturn: number
  volatility: number
}

/**
 * DAX (German Stock Index) historical returns
 * Based on annual performance data
 */
const DAX_HISTORICAL: HistoricalDataPoint[] = [
  { year: 2000, return: -0.0961 }, // -9.61%
  { year: 2001, return: -0.1948 }, // -19.48%
  { year: 2002, return: -0.4384 }, // -43.84%
  { year: 2003, return: 0.3734 }, // 37.34%
  { year: 2004, return: 0.0716 }, // 7.16%
  { year: 2005, return: 0.2743 }, // 27.43%
  { year: 2006, return: 0.2204 }, // 22.04%
  { year: 2007, return: 0.2236 }, // 22.36%
  { year: 2008, return: -0.4024 }, // -40.24%
  { year: 2009, return: 0.2395 }, // 23.95%
  { year: 2010, return: 0.1612 }, // 16.12%
  { year: 2011, return: -0.1488 }, // -14.88%
  { year: 2012, return: 0.2907 }, // 29.07%
  { year: 2013, return: 0.2559 }, // 25.59%
  { year: 2014, return: 0.0254 }, // 2.54%
  { year: 2015, return: 0.0956 }, // 9.56%
  { year: 2016, return: 0.0691 }, // 6.91%
  { year: 2017, return: 0.1261 }, // 12.61%
  { year: 2018, return: -0.1824 }, // -18.24%
  { year: 2019, return: 0.2585 }, // 25.85%
  { year: 2020, return: 0.0364 }, // 3.64%
  { year: 2021, return: 0.1556 }, // 15.56%
  { year: 2022, return: -0.1212 }, // -12.12%
  { year: 2023, return: 0.2042 }, // 20.42%
]

/**
 * S&P 500 historical returns (approximate for German investors)
 * Based on annual performance data
 */
const SP500_HISTORICAL: HistoricalDataPoint[] = [
  { year: 2000, return: -0.091 }, // -9.10%
  { year: 2001, return: -0.1189 }, // -11.89%
  { year: 2002, return: -0.221 }, // -22.10%
  { year: 2003, return: 0.2868 }, // 28.68%
  { year: 2004, return: 0.1088 }, // 10.88%
  { year: 2005, return: 0.0491 }, // 4.91%
  { year: 2006, return: 0.1579 }, // 15.79%
  { year: 2007, return: 0.0549 }, // 5.49%
  { year: 2008, return: -0.3649 }, // -36.49%
  { year: 2009, return: 0.2646 }, // 26.46%
  { year: 2010, return: 0.1506 }, // 15.06%
  { year: 2011, return: 0.0211 }, // 2.11%
  { year: 2012, return: 0.16 }, // 16.00%
  { year: 2013, return: 0.3239 }, // 32.39%
  { year: 2014, return: 0.1369 }, // 13.69%
  { year: 2015, return: 0.0138 }, // 1.38%
  { year: 2016, return: 0.1196 }, // 11.96%
  { year: 2017, return: 0.2183 }, // 21.83%
  { year: 2018, return: -0.0438 }, // -4.38%
  { year: 2019, return: 0.3156 }, // 31.56%
  { year: 2020, return: 0.184 }, // 18.40%
  { year: 2021, return: 0.2689 }, // 26.89%
  { year: 2022, return: -0.1811 }, // -18.11%
  { year: 2023, return: 0.2641 }, // 26.41%
]

/**
 * MSCI World historical returns (approximate for German investors)
 * Diversified global equity index
 */
const MSCI_WORLD_HISTORICAL: HistoricalDataPoint[] = [
  { year: 2000, return: -0.1203 }, // -12.03%
  { year: 2001, return: -0.1556 }, // -15.56%
  { year: 2002, return: -0.1952 }, // -19.52%
  { year: 2003, return: 0.3384 }, // 33.84%
  { year: 2004, return: 0.1499 }, // 14.99%
  { year: 2005, return: 0.0993 }, // 9.93%
  { year: 2006, return: 0.2007 }, // 20.07%
  { year: 2007, return: 0.0943 }, // 9.43%
  { year: 2008, return: -0.4003 }, // -40.03%
  { year: 2009, return: 0.2995 }, // 29.95%
  { year: 2010, return: 0.1193 }, // 11.93%
  { year: 2011, return: -0.0512 }, // -5.12%
  { year: 2012, return: 0.1601 }, // 16.01%
  { year: 2013, return: 0.267 }, // 26.70%
  { year: 2014, return: 0.0452 }, // 4.52%
  { year: 2015, return: -0.0087 }, // -0.87%
  { year: 2016, return: 0.0754 }, // 7.54%
  { year: 2017, return: 0.2274 }, // 22.74%
  { year: 2018, return: -0.0871 }, // -8.71%
  { year: 2019, return: 0.2794 }, // 27.94%
  { year: 2020, return: 0.1609 }, // 16.09%
  { year: 2021, return: 0.2198 }, // 21.98%
  { year: 2022, return: -0.1803 }, // -18.03%
  { year: 2023, return: 0.2398 }, // 23.98%
]

/**
 * Calculate statistics for historical data
 */
function calculateStats(data: HistoricalDataPoint[]): { average: number; volatility: number } {
  const returns = data.map(d => d.return)
  const average = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - average, 2), 0) / returns.length
  const volatility = Math.sqrt(variance)

  return { average, volatility }
}

// Pre-calculate statistics
const daxStats = calculateStats(DAX_HISTORICAL)
const sp500Stats = calculateStats(SP500_HISTORICAL)
const msciWorldStats = calculateStats(MSCI_WORLD_HISTORICAL)

/**
 * Available historical indices for backtesting
 */
export const HISTORICAL_INDICES: HistoricalIndex[] = [
  {
    id: 'dax',
    name: 'DAX',
    description: 'Deutscher Aktienindex - Die 40 größten deutschen Unternehmen',
    currency: 'EUR',
    data: DAX_HISTORICAL,
    startYear: 2000,
    endYear: 2023,
    averageReturn: daxStats.average,
    volatility: daxStats.volatility,
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    description: "Standard & Poor's 500 - Die 500 größten US-amerikanischen Unternehmen",
    currency: 'USD',
    data: SP500_HISTORICAL,
    startYear: 2000,
    endYear: 2023,
    averageReturn: sp500Stats.average,
    volatility: sp500Stats.volatility,
  },
  {
    id: 'msci-world',
    name: 'MSCI World',
    description: 'Globaler Aktienindex - Diversifiziert über entwickelte Märkte weltweit',
    currency: 'USD',
    data: MSCI_WORLD_HISTORICAL,
    startYear: 2000,
    endYear: 2023,
    averageReturn: msciWorldStats.average,
    volatility: msciWorldStats.volatility,
  },
] as const

/**
 * Get historical index by ID
 */
export function getHistoricalIndex(id: string): HistoricalIndex | undefined {
  return HISTORICAL_INDICES.find(index => index.id === id)
}

/**
 * Get historical returns for a specific index and year range
 */
export function getHistoricalReturns(
  indexId: string,
  startYear: number,
  endYear: number,
): Record<number, number> | null {
  const index = getHistoricalIndex(indexId)
  if (!index) return null

  const returns: Record<number, number> = {}

  for (let year = startYear; year <= endYear; year++) {
    const dataPoint = index.data.find(d => d.year === year)
    if (dataPoint) {
      returns[year] = dataPoint.return
    } else {
      // If no data for this year, use the index average as fallback
      returns[year] = index.averageReturn
    }
  }

  return returns
}

/**
 * Get available years for a historical index
 */
export function getAvailableYears(indexId: string): number[] {
  const index = getHistoricalIndex(indexId)
  if (!index) return []

  return index.data.map(d => d.year).sort((a, b) => a - b)
}

/**
 * Check if a year range is available for an index
 */
export function isYearRangeAvailable(indexId: string, startYear: number, endYear: number): boolean {
  const index = getHistoricalIndex(indexId)
  if (!index) return false

  return startYear >= index.startYear && endYear <= index.endYear
}
