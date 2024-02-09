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

    basisertrag = anteilImJahr / 12 * basisertrag;

    // hier muss noch der vorjahresgewinn berücksichtigen werden
    // vorabpauschale = vorjahresgewinn > vorabpauschale ? vorabpauschale : vorjahresgewinn;
    const vorabpauschale = basisertrag;

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
    let steuer = vorabpauschale(
        startwert,
        basiszins,
        steuerlast,
        vorabpauschale_prozentsatz,
        freistellung,
        anteilImJahr,
    );

    const verbleibenderFreibetrag = freibetrag - steuer;
    // Abzug der Steuer
    if (steuer > freibetrag) {
        steuer -= freibetrag;
    }
    return {
        steuer: verbleibenderFreibetrag <= 0 ? steuer : 0,
        verbleibenderFreibetrag: verbleibenderFreibetrag > 0 ? verbleibenderFreibetrag : 0,
    };
}

export { vorabpauschale };
