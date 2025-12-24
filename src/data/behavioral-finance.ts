// Behavioral Finance Biases - Common investor psychological errors
// Educational content to help users avoid common investing mistakes

export interface BehavioralBias {
  name: string
  category: 'Emotional' | 'Cognitive' | 'Social'
  shortDescription: string
  detailedExplanation: string
  germanExample: string
  howToAvoid: string
  relatedBiases?: string[]
}

export const behavioralBiases: Record<string, BehavioralBias> = {
  lossAversion: {
    name: 'Verlustaversion (Loss Aversion)',
    category: 'Emotional',
    shortDescription: 'Verluste wiegen psychologisch schwerer als Gewinne',
    detailedExplanation:
      'Verlustaversion beschreibt die Tendenz, Verluste als etwa doppelt so schmerzhaft zu empfinden wie Gewinne erfreulich sind. Dies führt dazu, dass Anleger zu lange an Verlustpositionen festhalten und profitable Positionen zu früh verkaufen.',
    germanExample:
      'Ein Anleger hält seit 2 Jahren eine DAX-Aktie mit 30% Verlust und hofft auf Erholung, verkauft aber einen ETF mit 15% Gewinn sofort, aus Angst den Gewinn zu verlieren.',
    howToAvoid:
      'Setzen Sie klare Stop-Loss-Limits und Gewinnziele VOR dem Kauf. Bewerten Sie Investments objektiv anhand ihrer zukünftigen Aussichten, nicht vergangener Kurse.',
    relatedBiases: ['dispositionEffect', 'mentalAccounting'],
  },
  dispositionEffect: {
    name: 'Dispositionseffekt',
    category: 'Emotional',
    shortDescription: 'Gewinner zu früh verkaufen, Verlierer zu lange halten',
    detailedExplanation:
      'Der Dispositionseffekt ist die Tendenz, profitable Investments zu früh zu verkaufen (um Gewinne zu realisieren) und Verlustpositionen zu lange zu halten (um Verluste nicht realisieren zu müssen). Dies widerspricht oft der rationalen Strategie.',
    germanExample:
      'Nach 10% Gewinn bei einem DAX-ETF verkauft der Anleger, aber hält eine Einzelaktie mit 40% Verlust, weil er nicht mit Verlust verkaufen will.',
    howToAvoid:
      'Bewerten Sie jede Position unabhängig von Ihrem Einstandspreis. Fragen Sie sich: "Würde ich diese Position heute zum aktuellen Kurs kaufen?"',
    relatedBiases: ['lossAversion', 'anchoringBias'],
  },
  herdingBias: {
    name: 'Herdentrieb (Herding)',
    category: 'Social',
    shortDescription: 'Der Masse folgen statt eigene Analyse',
    detailedExplanation:
      'Herdentrieb beschreibt die Tendenz, Investmententscheidungen anderer zu kopieren, ohne eigene Analyse. Dies führt zu Blasenbildung und Panikverkäufen.',
    germanExample:
      'Im Jahr 2021 kaufen viele Deutsche Kryptowährungen, weil "alle darüber reden". Bei Kurseinbrüchen 2022 verkaufen sie panisch mit hohen Verlusten.',
    howToAvoid:
      'Entwickeln Sie eine eigene Investmentstrategie basierend auf Ihren Zielen. Hinterfragen Sie Trends kritisch und investieren Sie nur nach eigener Analyse.',
    relatedBiases: ['fomo', 'recencyBias'],
  },
  recencyBias: {
    name: 'Verfügbarkeitsheuristik (Recency Bias)',
    category: 'Cognitive',
    shortDescription: 'Überbewertung jüngster Ereignisse',
    detailedExplanation:
      'Die Verfügbarkeitsheuristik führt dazu, dass Anleger jüngste Ereignisse und Entwicklungen übergewichten und langfristige Trends unterschätzen. Nach Bullenmärkten wird oft zu optimistisch, nach Crashes zu pessimistisch investiert.',
    germanExample:
      'Nach den starken Jahren 2019-2021 erwarten Anleger weiter hohe Renditen. Nach dem Crash 2022 meiden viele komplett Aktien, obwohl günstige Einstiegschancen bestehen.',
    howToAvoid:
      'Betrachten Sie langfristige historische Daten statt nur der letzten Monate. Nutzen Sie Dollar-Cost-Averaging (Sparpläne) statt Timing-Versuchen.',
    relatedBiases: ['herdingBias', 'overconfidence'],
  },
  overconfidence: {
    name: 'Selbstüberschätzung (Overconfidence)',
    category: 'Cognitive',
    shortDescription: 'Überschätzung der eigenen Fähigkeiten',
    detailedExplanation:
      'Selbstüberschätzung führt dazu, dass Anleger ihre Fähigkeiten zur Marktprognose überbewerten und zu häufig handeln. Studien zeigen, dass aktivere Anleger oft schlechter abschneiden als passive Investoren.',
    germanExample:
      'Ein Anleger glaubt, den DAX besser timen zu können als andere. Durch häufiges Kaufen und Verkaufen entstehen hohe Transaktionskosten und er erzielt schlechtere Rendite als ein MSCI World ETF.',
    howToAvoid:
      'Akzeptieren Sie, dass selbst Profis den Markt selten schlagen. Bevorzugen Sie passive, kostengünstige ETF-Strategien. Reduzieren Sie die Handelsfrequenz.',
    relatedBiases: ['overconfidence', 'illusionOfControl', 'hindsightBias'],
  },
  anchoringBias: {
    name: 'Anker-Effekt (Anchoring)',
    category: 'Cognitive',
    shortDescription: 'Fixierung auf ursprüngliche Kaufpreise',
    detailedExplanation:
      'Der Anker-Effekt beschreibt die Tendenz, sich zu stark an Referenzpunkten wie dem Kaufpreis zu orientieren. Der Kaufpreis ist jedoch für die zukünftige Wertentwicklung irrelevant.',
    germanExample:
      'Eine Aktie wurde für 100€ gekauft und steht jetzt bei 70€. Der Anleger wartet auf 100€, obwohl die Fundamentaldaten sich verschlechtert haben und 50€ realistischer wären.',
    howToAvoid:
      'Ignorieren Sie den Kaufpreis bei Verkaufsentscheidungen. Bewerten Sie jede Position anhand aktueller Fundamentaldaten und Zukunftsaussichten.',
    relatedBiases: ['dispositionEffect', 'lossAversion'],
  },
  confirmationBias: {
    name: 'Bestätigungsfehler (Confirmation Bias)',
    category: 'Cognitive',
    shortDescription: 'Nur Informationen suchen, die eigene Meinung bestätigen',
    detailedExplanation:
      'Der Bestätigungsfehler führt dazu, dass Anleger bevorzugt Informationen wahrnehmen, die ihre bestehende Meinung stützen, und widersprechende Informationen ignorieren oder abwerten.',
    germanExample:
      'Ein Investor ist von einer deutschen Technologie-Aktie überzeugt. Er liest nur positive Analysen und ignoriert Warnungen vor Überbewertung und sinkenden Margen.',
    howToAvoid:
      'Suchen Sie aktiv nach Gegenargumenten zu Ihren Investments. Lesen Sie auch kritische Analysen und Bärenmarkt-Szenarien.',
    relatedBiases: ['overconfidence'],
  },
  mentalAccounting: {
    name: 'Mentale Buchführung (Mental Accounting)',
    category: 'Cognitive',
    shortDescription: 'Geld in mentale Kategorien einteilen',
    detailedExplanation:
      'Mentale Buchführung bedeutet, dass Anleger Geld in verschiedene mentale Kategorien einteilen und unterschiedlich behandeln, obwohl Geld fungibel ist. Dies kann zu irrationalen Entscheidungen führen.',
    germanExample:
      'Ein Anleger hat 10.000€ "sicheres Tagesgeld" und 5.000€ "Spielgeld" in riskanteren Aktien. Obwohl das Gesamtportfolio betrachtet werden sollte, behandelt er die Töpfe völlig getrennt.',
    howToAvoid:
      'Betrachten Sie Ihr Gesamtvermögen als ein Portfolio. Optimieren Sie die Asset Allocation über alle Konten hinweg, nicht für jedes Konto separat.',
    relatedBiases: ['lossAversion'],
  },
  fomo: {
    name: 'FOMO - Fear of Missing Out',
    category: 'Emotional',
    shortDescription: 'Angst, profitable Gelegenheiten zu verpassen',
    detailedExplanation:
      'FOMO beschreibt die Angst, profitable Investmentchancen zu verpassen. Dies führt oft zu überstürzten Käufen nahe Allzeithochs und schlechtem Market-Timing.',
    germanExample:
      'Bitcoin steigt 2021 auf 60.000€. Aus Angst, weitere Gewinne zu verpassen, kauft ein Anleger bei 55.000€. Kurz darauf fällt der Kurs auf 20.000€.',
    howToAvoid:
      'Entwickeln Sie einen disziplinierten Sparplan. Akzeptieren Sie, dass Sie nie alle Chancen nutzen können. Fokussieren Sie auf langfristige Strategie.',
    relatedBiases: ['herdingBias', 'recencyBias'],
  },
  hindsightBias: {
    name: 'Rückschaufehler (Hindsight Bias)',
    category: 'Cognitive',
    shortDescription: 'Glauben, vergangene Ereignisse vorhersehbar waren',
    detailedExplanation:
      'Der Rückschaufehler führt dazu, dass Anleger glauben, vergangene Marktereignisse wären vorhersehbar gewesen. Dies führt zu Selbstüberschätzung bei zukünftigen Prognosen.',
    germanExample:
      'Nach dem Tech-Crash 2000 sagen viele: "Das war doch klar, dass die Blase platzt." Doch vorher hatten die meisten weiter gekauft.',
    howToAvoid:
      'Dokumentieren Sie Ihre Investmententscheidungen und Prognosen schriftlich VOR Ereignissen. Lernen Sie aus Fehlern, aber überschätzen Sie nicht Ihre Vorhersagekraft.',
    relatedBiases: ['overconfidence'],
  },
  homeBias: {
    name: 'Home Bias',
    category: 'Cognitive',
    shortDescription: 'Übermäßige Investition in heimische Märkte',
    detailedExplanation:
      'Home Bias beschreibt die Tendenz, überproportional in den Heimatmarkt zu investieren, oft aus Vertrautheit. Dies führt zu mangelnder globaler Diversifikation und erhöhtem Risiko.',
    germanExample:
      'Ein deutscher Anleger investiert 80% seines Portfolios in DAX-Aktien und deutsche Anleihen, obwohl Deutschland nur ~3% der globalen Marktkapitalisierung ausmacht.',
    howToAvoid:
      'Investieren Sie global diversifiziert. Ein MSCI World oder FTSE All-World ETF bietet breite internationale Streuung. Deutschland sollte nicht über Marktkapitalisierung (~3%) gewichtet sein.',
    relatedBiases: ['confirmationBias'],
  },
  illusionOfControl: {
    name: 'Kontrollillusion',
    category: 'Cognitive',
    shortDescription: 'Glauben, Einfluss auf unkontrollierbare Ereignisse zu haben',
    detailedExplanation:
      'Die Kontrollillusion führt dazu, dass Anleger glauben, durch intensive Beobachtung und häufiges Handeln bessere Ergebnisse zu erzielen, obwohl Märkte weitgehend unvorhersehbar sind.',
    germanExample:
      'Ein Daytrader checkt stündlich Charts und handelt mehrmals täglich, in dem Glauben, er könne so den Markt kontrollieren. Studien zeigen: Je mehr gehandelt wird, desto schlechter die Rendite.',
    howToAvoid:
      'Akzeptieren Sie die Unvorhersehbarkeit von Märkten. Reduzieren Sie Handelsaktivität. Konzentrieren Sie sich auf kontrollierbare Faktoren: Kosten, Diversifikation, Sparrate.',
    relatedBiases: ['overconfidence'],
  },
}

// Get all biases for a specific category
export function getBiasesByCategory(category: BehavioralBias['category']): BehavioralBias[] {
  return Object.values(behavioralBiases).filter(bias => bias.category === category)
}

// Get all bias categories
export function getAllCategories(): Array<BehavioralBias['category']> {
  return ['Emotional', 'Cognitive', 'Social']
}

// Search biases by term
export function searchBiases(searchTerm: string): BehavioralBias[] {
  const term = searchTerm.toLowerCase()
  return Object.values(behavioralBiases).filter(
    bias =>
      bias.name.toLowerCase().includes(term) ||
      bias.shortDescription.toLowerCase().includes(term) ||
      bias.detailedExplanation.toLowerCase().includes(term) ||
      bias.germanExample.toLowerCase().includes(term) ||
      bias.howToAvoid.toLowerCase().includes(term),
  )
}
