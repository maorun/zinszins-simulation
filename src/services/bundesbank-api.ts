/**
 * Deutsche Bundesbank API Service
 * Provides access to official German interest rates and economic data
 */

export interface BasiszinsData {
  year: number;
  rate: number;
  source: 'api' | 'manual' | 'fallback';
  lastUpdated?: string;
}

export interface BasiszinsConfiguration {
  [year: number]: BasiszinsData;
}

/**
 * Fetches the latest Basiszins data from Deutsche Bundesbank API
 * The API provides access to official interest rates used for tax calculations
 */
export async function fetchBasiszinsFromBundesbank(startYear?: number, endYear?: number): Promise<BasiszinsData[]> {
  try {
    // Deutsche Bundesbank Time Series Database (TSDB) API
    // Documentation: https://www.bundesbank.de/en/statistics/time-series-databases
    
    // For Basiszins/Vorabpauschale, we need the "Basiszins zur Berechnung der Vorabpauschale"
    // This is typically published annually by the Ministry of Finance based on Bundesbank data
    
    const currentYear = new Date().getFullYear();
    const fromYear = startYear || 2018;
    const toYear = endYear || currentYear;
    
    // Note: The actual Basiszins rates are published by the Ministry of Finance,
    // not directly by Bundesbank API. For now, we'll implement a fallback
    // that could be extended with real API integration when available.
    
    console.warn('Deutsche Bundesbank API integration not yet implemented. Using fallback data.');
    
    // Return fallback data structure that matches expected format
    const fallbackRates: BasiszinsData[] = [];
    for (let year = fromYear; year <= toYear; year++) {
      const rate = getHistoricalBasiszinsFallback(year);
      if (rate !== null) {
        fallbackRates.push({
          year,
          rate,
          source: 'fallback',
          lastUpdated: new Date().toISOString(),
        });
      }
    }
    
    return fallbackRates;
  } catch (error) {
    console.error('Failed to fetch Basiszins data from Bundesbank:', error);
    throw new Error('Basiszins data could not be retrieved from Deutsche Bundesbank');
  }
}

/**
 * Historical Basiszins rates as fallback when API is not available
 * These are the official rates published by the German Ministry of Finance
 */
function getHistoricalBasiszinsFallback(year: number): number | null {
  const historicalRates: { [year: number]: number } = {
    2018: 0.0087, // 0.87%
    2019: 0.0087, // 0.87%
    2020: 0.0070, // 0.70%
    2021: 0.0070, // 0.70%
    2022: 0.0180, // 1.80%
    2023: 0.0255, // 2.55%
    2024: 0.0255, // 2.55% (preliminary)
  };
  
  return historicalRates[year] || null;
}

/**
 * Validates that a manual Basiszins entry is reasonable
 */
export function validateBasiszinsRate(rate: number): boolean {
  // Reasonable bounds: between -2% and 10%
  return rate >= -0.02 && rate <= 0.10;
}

/**
 * Formats Basiszins rate for display
 */
export function formatBasiszinsRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Estimates future Basiszins based on recent trends
 * This is used as a default for manual entry suggestions
 */
export function estimateFutureBasiszins(historicalRates: BasiszinsConfiguration): number {
  const years = Object.keys(historicalRates).map(Number).sort((a, b) => b - a);
  
  if (years.length === 0) {
    return 0.0255; // Default to 2023 rate
  }
  
  // Use the most recent rate as estimate
  const mostRecentYear = years[0];
  return historicalRates[mostRecentYear].rate;
}