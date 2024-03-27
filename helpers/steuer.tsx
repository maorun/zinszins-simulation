function vorabpauschale(
    startwert = 10000,
    endwert = 10000,
    freibetrag = 2000,
    basiszins = 0.0255,
    steuerlast = 0.26375,
    vorabpauschale_prozentsatz = 0.7,
    teilFreistellungsquote = 0.3,
    anteilImJahr = 12,
) {
    // Berechnung der Vorabpauschale für das aktuelle Jahr
    let basisertrag = (startwert) * basiszins * vorabpauschale_prozentsatz;

    basisertrag = anteilImJahr / 12 * basisertrag;
    basisertrag = Math.floor(basisertrag * 100) / 100

    let wertsteigerung = endwert - startwert;

    const vorabpauschale = wertsteigerung < basisertrag ?  wertsteigerung : basisertrag
    const theoretischerGewinn = vorabpauschale * (1 - teilFreistellungsquote)

    let gewinnNachFreibetrag = 0
    let restFreibetrag =  freibetrag - Math.round(theoretischerGewinn * 100) / 100
    if (restFreibetrag < 0) {
        restFreibetrag = 0
        gewinnNachFreibetrag = theoretischerGewinn - freibetrag
    }

    return {
        basisertrag,
        vorabpauschale: Math.round(theoretischerGewinn * 100) / 100,
        steuer: Math.round(theoretischerGewinn * steuerlast * 100) / 100,
        becauseOfFreibetrag: {
            vorabpauschale: Math.round(gewinnNachFreibetrag * 100) / 100,
            steuer: Math.round(gewinnNachFreibetrag * steuerlast * 100) / 100,
            freibetrag: restFreibetrag,
        },
}
}

export function zinszinsVorabpauschale(
    startwert = 10000,
    endwert = 10000,
    basiszins = 0.0255,
    freibetrag = 2000,
    steuerlast = 0.26375,
    vorabpauschale_prozentsatz = 0.7,
    freistellung = 0.3,
    anteilImJahr = 12,
) {
    let vorabpauschalwert = vorabpauschale(
        startwert,
        endwert,
        freibetrag,
        basiszins,
        steuerlast,
        vorabpauschale_prozentsatz,
        freistellung,
        anteilImJahr,
    );

    return {
        steuer: vorabpauschalwert.becauseOfFreibetrag.steuer,
        verbleibenderFreibetrag: vorabpauschalwert.becauseOfFreibetrag.freibetrag,
    };
}

export { vorabpauschale };
