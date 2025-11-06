// Glossary of German financial and tax terms with detailed explanations
// Used for contextual tooltips throughout the application

export interface GlossaryTerm {
  term: string
  shortDefinition: string
  detailedExplanation: string
  example?: string
  relatedTerms?: string[]
}

export const glossaryTerms: Record<string, GlossaryTerm> = {
  vorabpauschale: {
    term: 'Vorabpauschale',
    shortDefinition: 'Jährliche Besteuerung von thesaurierenden Fonds',
    detailedExplanation:
      'Die Vorabpauschale ist eine pauschale Besteuerung für thesaurierende Investmentfonds. Sie stellt sicher, dass Anleger auch dann Steuern zahlen, wenn die Erträge im Fonds verbleiben und nicht ausgeschüttet werden. Die Höhe wird anhand des Basiszinses berechnet.',
    example:
      'Bei einem Fondswert von 10.000 € und einem Basiszins von 2,55% beträgt die Vorabpauschale ca. 182 € (70% von 2,55%).',
    relatedTerms: ['basiszins', 'teilfreistellung', 'kapitalertragsteuer'],
  },
  basiszins: {
    term: 'Basiszins',
    shortDefinition: 'Referenzzinssatz für die Vorabpauschale',
    detailedExplanation:
      'Der Basiszins wird vom Bundesfinanzministerium jährlich festgelegt und dient als Grundlage für die Berechnung der Vorabpauschale. Er orientiert sich am Zinssatz für langfristige öffentliche Anleihen und wird zu Jahresbeginn veröffentlicht.',
    example: 'Für 2023 beträgt der Basiszins 2,55%. Davon werden 70% (= 1,785%) für die Vorabpauschale verwendet.',
    relatedTerms: ['vorabpauschale'],
  },
  kapitalertragsteuer: {
    term: 'Kapitalertragsteuer',
    shortDefinition: 'Steuer auf Kapitalerträge (25% + Soli)',
    detailedExplanation:
      'Die Kapitalertragsteuer (auch Abgeltungssteuer genannt) beträgt 25% auf Kapitalerträge wie Zinsen, Dividenden und Kursgewinne. Hinzu kommt der Solidaritätszuschlag von 5,5% auf die Kapitalertragsteuer, insgesamt also 26,375%.',
    example: 'Bei 1.000 € Kapitalertrag: 250 € Kapitalertragsteuer + 13,75 € Solidaritätszuschlag = 263,75 € Steuern.',
    relatedTerms: ['sparerpauschbetrag', 'guenstigerpruefung', 'teilfreistellung'],
  },
  sparerpauschbetrag: {
    term: 'Sparerpauschbetrag',
    shortDefinition: 'Steuerfreier Freibetrag für Kapitalerträge',
    detailedExplanation:
      'Der Sparerpauschbetrag ist ein jährlicher Freibetrag, bis zu dem Kapitalerträge steuerfrei bleiben. Seit 2023 beträgt er 1.000 € für Einzelpersonen und 2.000 € für zusammenveranlagte Ehepaare. Ab 2024 wurde er auf 1.000 € bzw. 2.000 € erhöht.',
    example:
      'Ledige Person mit 1.500 € Kapitalerträgen: Die ersten 1.000 € sind steuerfrei, nur 500 € werden mit 26,375% besteuert.',
    relatedTerms: ['kapitalertragsteuer', 'freistellungsauftrag'],
  },
  teilfreistellung: {
    term: 'Teilfreistellung',
    shortDefinition: 'Steuerermäßigung für Aktienfonds',
    detailedExplanation:
      'Die Teilfreistellung berücksichtigt, dass auf Fondsebene bereits Körperschaftsteuer anfällt. Bei Aktienfonds sind 30% der Erträge steuerfrei, bei Mischfonds 15% und bei Immobilienfonds 60% bzw. 80%.',
    example: 'Aktienfonds mit 1.000 € Ertrag: 30% (300 €) sind steuerfrei, nur 700 € werden besteuert.',
    relatedTerms: ['vorabpauschale', 'kapitalertragsteuer'],
  },
  guenstigerpruefung: {
    term: 'Günstigerprüfung',
    shortDefinition: 'Vergleich zwischen Kapitalertragsteuer und persönlichem Steuersatz',
    detailedExplanation:
      'Bei der Günstigerprüfung prüft das Finanzamt automatisch, ob die Besteuerung mit dem persönlichen Einkommensteuersatz günstiger ist als die pauschale Kapitalertragsteuer. Dies lohnt sich bei niedrigem Einkommen und persönlichem Steuersatz unter 25%.',
    example:
      'Student mit 15% persönlichem Steuersatz: Statt 26,375% Kapitalertragsteuer zahlt er nur 15% auf seine Kapitalerträge.',
    relatedTerms: ['kapitalertragsteuer', 'einkommensteuersatz'],
  },
  grundfreibetrag: {
    term: 'Grundfreibetrag',
    shortDefinition: 'Steuerfreies Existenzminimum bei Einkommensteuer',
    detailedExplanation:
      'Der Grundfreibetrag ist der Betrag, bis zu dem keine Einkommensteuer anfällt. Er soll das Existenzminimum sichern. Für 2023 beträgt er 10.908 € (Einzelperson) bzw. 21.816 € (Ehepaare). Er wird jährlich angepasst.',
    example: 'Rentner mit 10.000 € Jahreseinkommen: Liegt unter dem Grundfreibetrag, keine Einkommensteuer fällig.',
    relatedTerms: ['guenstigerpruefung', 'einkommensteuersatz'],
  },
  freistellungsauftrag: {
    term: 'Freistellungsauftrag',
    shortDefinition: 'Antrag zur Nutzung des Sparerpauschbetrags',
    detailedExplanation:
      'Mit einem Freistellungsauftrag teilen Sie Ihrer Bank mit, bis zu welchem Betrag keine Kapitalertragsteuer einbehalten werden soll. Der Freistellungsauftrag kann auf mehrere Banken verteilt werden, darf aber insgesamt den Sparerpauschbetrag nicht überschreiten.',
    example: 'Sparerpauschbetrag 1.000 €: 600 € bei Bank A, 400 € bei Bank B.',
    relatedTerms: ['sparerpauschbetrag', 'kapitalertragsteuer'],
  },
  kindergeld: {
    term: 'Kindergeld',
    shortDefinition: 'Staatliche Familienleistung für Kinder',
    detailedExplanation:
      'Kindergeld ist eine steuerfreie staatliche Leistung zur Unterstützung von Familien. Ab 2024 beträgt es einheitlich 250 € pro Monat für jedes Kind. Es wird in der Regel bis zum 18. Geburtstag des Kindes gezahlt, bei Ausbildung oder Studium bis zum 25. Geburtstag. Kindergeld ist nicht steuerpflichtig und wird zusätzlich zum Einkommen gezahlt.',
    example: 'Familie mit 2 Kindern: 2 × 250 € = 500 € monatlich (6.000 € jährlich) steuerfrei.',
    relatedTerms: ['kinderfreibetrag'],
  },
  kinderfreibetrag: {
    term: 'Kinderfreibetrag',
    shortDefinition: 'Steuerlicher Freibetrag für Kinder',
    detailedExplanation:
      'Der Kinderfreibetrag ist ein Freibetrag bei der Einkommensteuer, der alternativ zum Kindergeld genutzt werden kann. Das Finanzamt prüft automatisch (Günstigerprüfung), ob der Kinderfreibetrag oder das Kindergeld vorteilhafter ist. Bei höherem Einkommen kann der Kinderfreibetrag günstiger sein.',
    example:
      'Kinderfreibetrag 2024: 6.384 € pro Kind und Jahr. Bei einem Grenzsteuersatz von 42% entspricht dies ca. 2.680 € Steuerersparnis.',
    relatedTerms: ['kindergeld', 'guenstigerpruefung'],
  },
  einkommensteuersatz: {
    term: 'Einkommensteuersatz',
    shortDefinition: 'Persönlicher Steuersatz auf das Gesamteinkommen',
    detailedExplanation:
      'Der Einkommensteuersatz ist progressiv und steigt mit dem Einkommen. Er beginnt bei 0% (bis zum Grundfreibetrag) und kann bis zu 45% (Reichensteuer ab ca. 277.826 €) betragen. Der durchschnittliche Steuersatz liegt meist zwischen 14% und 42%.',
    example: 'Bei 50.000 € zu versteuerndem Einkommen beträgt der durchschnittliche Steuersatz ca. 20%.',
    relatedTerms: ['guenstigerpruefung', 'grundfreibetrag'],
  },
  inflationsausgleich: {
    term: 'Inflationsausgleich',
    shortDefinition: 'Anpassung von Beträgen an Kaufkraftverlust',
    detailedExplanation:
      'Der Inflationsausgleich berücksichtigt, dass Geld im Zeitverlauf an Kaufkraft verliert. Bei langfristiger Finanzplanung ist es wichtig, zukünftige Ausgaben und Einnahmen inflationsbereinigt zu betrachten, um realistische Planungen zu erstellen.',
    example: 'Bei 2% Inflation pro Jahr sind 100 € in 10 Jahren nur noch etwa 82 € in heutiger Kaufkraft wert.',
    relatedTerms: ['realrendite'],
  },
  realrendite: {
    term: 'Realrendite',
    shortDefinition: 'Rendite nach Abzug der Inflation',
    detailedExplanation:
      'Die Realrendite ist die tatsächliche Wertsteigerung Ihres Kapitals unter Berücksichtigung der Inflation. Sie wird berechnet als Nominalrendite minus Inflationsrate. Nur die Realrendite zeigt den echten Kaufkraftgewinn.',
    example: 'Bei 7% Nominalrendite und 2% Inflation beträgt die Realrendite etwa 5%.',
    relatedTerms: ['inflationsausgleich'],
  },
  entnahmestrategie: {
    term: 'Entnahmestrategie',
    shortDefinition: 'Plan für regelmäßige Kapitalentnahmen im Ruhestand',
    detailedExplanation:
      'Eine Entnahmestrategie legt fest, wie viel Kapital jährlich oder monatlich aus dem Portfolio entnommen wird, um den Lebensunterhalt zu finanzieren. Bekannte Strategien sind die 4%-Regel, variable Entnahmen oder feste monatliche Beträge.',
    example: '4%-Regel: Bei 500.000 € Portfolio werden jährlich 20.000 € (4%) entnommen.',
    relatedTerms: ['sequenzrisiko'],
  },
  sequenzrisiko: {
    term: 'Sequenzrisiko',
    shortDefinition: 'Risiko ungünstiger Renditen zu Beginn der Entnahmephase',
    detailedExplanation:
      'Das Sequenzrisiko beschreibt die Gefahr, dass schlechte Börsenjahre am Anfang der Entnahmephase das Portfolio dauerhaft schädigen. Wenn gleichzeitig Verluste entstehen und Entnahmen getätigt werden, kann das Portfolio vorzeitig erschöpft sein.',
    example:
      'Ein Börsencrash von -30% im ersten Rentenjahr bei gleichzeitigen Entnahmen reduziert das Portfolio stärker als derselbe Crash 10 Jahre später.',
    relatedTerms: ['entnahmestrategie', 'montecarlo'],
  },
  montecarlo: {
    term: 'Monte-Carlo-Simulation',
    shortDefinition: 'Statistische Analyse mit vielen Zufallsszenarien',
    detailedExplanation:
      'Die Monte-Carlo-Simulation führt Tausende von Berechnungen mit unterschiedlichen zufälligen Renditen durch. So können Wahrscheinlichkeiten für verschiedene Ergebnisse ermittelt werden und das Risiko besser eingeschätzt werden.',
    example:
      'Nach 10.000 Simulationen zeigt sich: In 95% der Fälle reicht das Kapital für 30 Jahre, in 5% ist es vorher aufgebraucht.',
    relatedTerms: ['sequenzrisiko', 'volatilitaet'],
  },
  volatilitaet: {
    term: 'Volatilität',
    shortDefinition: 'Schwankungsbreite der Renditen',
    detailedExplanation:
      'Die Volatilität misst, wie stark die Renditen eines Investments schwanken. Eine hohe Volatilität bedeutet größere Schwankungen nach oben und unten. Aktien haben typischerweise höhere Volatilität als Anleihen.',
    example:
      'Aktien-ETF mit 15% Volatilität: In 68% der Jahre liegt die Rendite zwischen -8% und +22% (bei 7% Durchschnittsrendite).',
    relatedTerms: ['montecarlo', 'risiko'],
  },
  szenario: {
    term: 'Was-wäre-wenn Szenario',
    shortDefinition: 'Vordefinierte Finanzplanung zum Lernen',
    detailedExplanation:
      'Was-wäre-wenn Szenarien sind vordefinierte Beispielkonfigurationen, die realistische Finanzplanungssituationen abbilden. Sie helfen Anfängern, verschiedene Anlagestrategien und deren Auswirkungen zu verstehen, ohne selbst alle Parameter konfigurieren zu müssen.',
    example:
      'Szenario "Vorsichtiger Einsteiger": 300€/Monat über 30 Jahre mit 3,5% Rendite zeigt konservative Langzeitplanung mit geringem Risiko.',
    relatedTerms: ['rendite', 'risiko', 'anlagestrategie'],
  },
}

// Helper function to get a glossary term
export function getGlossaryTerm(key: string): GlossaryTerm | undefined {
  return glossaryTerms[key.toLowerCase()]
}

// Get all glossary terms as an array
export function getAllGlossaryTerms(): GlossaryTerm[] {
  return Object.values(glossaryTerms)
}

// Search glossary terms
export function searchGlossaryTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(glossaryTerms).filter(
    (term) =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.shortDefinition.toLowerCase().includes(lowerQuery) ||
      term.detailedExplanation.toLowerCase().includes(lowerQuery),
  )
}
