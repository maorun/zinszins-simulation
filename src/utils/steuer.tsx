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

function vorabpauschale(
    startwert = 10000,
    basiszins = 0.0255,
    steuerlast = 0.26375,
    vorabpauschale_prozentsatz = 0.7,
    teilFreistellungsquote = 0.3,
    anteilImJahr = 12,
) {
    // Berechnung der Vorabpauschale für das aktuelle Jahr
    let basisertrag = startwert * basiszins * vorabpauschale_prozentsatz;

    basisertrag = anteilImJahr/12 * basisertrag

    // hier muss noch der vorjahresgewinn berücksichtigen werden
    // vorabpauschale = vorjahresgewinn > vorabpauschale ? vorabpauschale : vorjahresgewinn;
    const vorabpauschale = basisertrag

    return vorabpauschale * steuerlast * (1 - teilFreistellungsquote);
}

export function zinszinsVorabpauschale(
    startwert = 10000,
    basiszins = 0.0255,
    freibetrag = 1000,
    steuerlast = 0.26375,
    vorabpauschale_prozentsatz = 0.7,
    freistellung = 0.3,
    anteilImJahr = 12,
) {
    // Calculate the basic return amount
    let basisertrag = startwert * basiszins * vorabpauschale_prozentsatz;
    basisertrag = anteilImJahr/12 * basisertrag;
    
    const vorabpauschaleAmount = basisertrag;
    
    let steuer = vorabpauschale(
        startwert,
        basiszins,
        steuerlast,
        vorabpauschale_prozentsatz,
        freistellung,
        anteilImJahr,
    )

    const verbleibenderFreibetrag = freibetrag - steuer;
    // Abzug der Steuer
    if (steuer > freibetrag) {
        steuer -= freibetrag;
    }
    return {
        steuer: verbleibenderFreibetrag <= 0 ? steuer : 0,
        verbleibenderFreibetrag:
        verbleibenderFreibetrag > 0 ? verbleibenderFreibetrag : 0,
        details: {
            basisertrag,
            vorabpauschaleAmount,
            steuerVorFreibetrag: steuer + Math.max(0, freibetrag - steuer),
            basiszins
        }
    };
}

