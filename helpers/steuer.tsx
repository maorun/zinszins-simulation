// Historical and projected German Basiszins (base interest rate) values for Vorabpauschale calculation
// These are official rates set by the German Federal Ministry of Finance
const basiszinsen: {
    [year: number]: number;
} = {
    2018: 0.0087, // 0.87%
    2019: 0.0087, // 0.87%
    2020: 0.0070, // 0.70%
    2021: 0.0070, // 0.70%
    2022: 0.0180, // 1.80%
    2023: 0.0255, // 2.55%
    2024: 0.0255, // 2.55% (estimated - to be updated when official)
    2025: 0.0255, // 2.55% (projected - to be updated when official)
};

/**
 * Get the basiszins (base interest rate) for a specific year
 * Falls back to the latest available year if the requested year is not found
 */
export function getBasiszinsForYear(year: number): number {
    if (basiszinsen[year] !== undefined) {
        return basiszinsen[year];
    }
    
    // Fallback to the latest available year
    const availableYears = Object.keys(basiszinsen).map(Number).sort((a, b) => b - a);
    const latestYear = availableYears[0];
    
    return basiszinsen[latestYear] || 0.0255; // Ultimate fallback to 2023 rate
}

/**
 * Calculates the Vorabpauschale amount for a given period.
 * The Vorabpauschale is the basis for taxation on unrealized gains in German investment funds.
 * It is capped by the actual gains of the fund.
 *
 * @param startwert - The value of the investment at the beginning of the period.
 * @param endwert - The value of the investment at the end of the period.
 * @param basiszins - The base interest rate for the year.
 * @param anteilImJahr - The fraction of the year the investment was held (e.g., 12 for a full year).
 * @returns The calculated Vorabpauschale amount (pre-tax).
 */
export function calculateVorabpauschale(
    startwert: number,
    endwert: number,
    basiszins: number,
    anteilImJahr: number = 12,
): number {
    const jahresgewinn = endwert - startwert;
    const vorabpauschale_prozentsatz = 0.7;

    // The Basisertrag is 70% of the gain the investment would have made at the base interest rate.
    let basisertrag = startwert * basiszins * vorabpauschale_prozentsatz;
    basisertrag = (anteilImJahr / 12) * basisertrag;

    // The Vorabpauschale is the lesser of the Basisertrag and the actual gain. It cannot be negative.
    const vorabpauschale = Math.max(0, Math.min(basisertrag, jahresgewinn));

    return vorabpauschale;
}


/**
 * Calculates the tax due on a given Vorabpauschale amount.
 *
 * @param vorabpauschale - The Vorabpauschale amount.
 * @param steuerlast - The capital gains tax rate (e.g., 0.26375).
 * @param teilFreistellungsquote - The partial exemption quote for the fund type (e.g., 0.3 for equity funds).
 * @returns The calculated tax amount.
 */
export function calculateSteuerOnVorabpauschale(
    vorabpauschale: number,
    steuerlast: number,
    teilFreistellungsquote: number
): number {
    if (vorabpauschale <= 0) {
        return 0;
    }
    return vorabpauschale * steuerlast * (1 - teilFreistellungsquote);
}

