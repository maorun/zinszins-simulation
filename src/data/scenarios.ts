// What-If Scenarios - Predefined financial scenarios for learning and exploration
// Educational scenarios to help users understand different investment approaches

import type { ReturnMode } from '../utils/random-returns'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'

export interface FinancialScenario {
  id: string
  name: string
  description: string
  category: 'conservative' | 'balanced' | 'aggressive' | 'special'
  icon: string

  // Scenario configuration
  config: {
    // Time range
    startYear: number
    retirementYear: number

    // Savings plan
    monthlyContribution: number
    initialInvestment?: number

    // Return configuration
    returnMode: ReturnMode
    expectedReturn: number
    volatility?: number // For random return mode

    // Tax configuration
    steuerlast?: number
    teilfreistellungsquote?: number
    freibetrag?: number

    // Withdrawal strategy
    withdrawalStrategy?: WithdrawalStrategy
    withdrawalRate?: number

    // Special characteristics
    ter?: number
    inflationRate?: number
  }

  // Educational content
  learningPoints: string[]
  risks: string[]
  suitableFor: string[]
}

export const predefinedScenarios: FinancialScenario[] = [
  // Conservative Scenarios
  {
    id: 'conservative-beginner',
    name: '🛡️ Vorsichtiger Einsteiger',
    description: 'Konservative Strategie mit geringem Risiko für Anfänger. Fokus auf Kapitalerhalt mit moderatem Wachstum.',
    category: 'conservative',
    icon: '🛡️',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 30,
      monthlyContribution: 300,
      initialInvestment: 5000,
      returnMode: 'fixed',
      expectedReturn: 3.5,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: '3prozent',
      ter: 0.2,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Niedriges Risiko durch konservative Anlagestrategie',
      'Geringe Kosten (TER 0,2%) durch kostengünstige ETFs',
      'Vorhersehbare Rendite durch feste 3,5% p.a.',
      'Langfristiger Vermögensaufbau über 30 Jahre',
    ],
    risks: [
      'Geringe Rendite kann Inflation nur leicht übertreffen',
      'Bei höherer Inflation Kaufkraftverlust möglich',
      'Opportunitätskosten gegenüber aggressiveren Strategien',
    ],
    suitableFor: [
      'Börsen-Einsteiger ohne Erfahrung',
      'Sicherheitsorientierte Anleger',
      'Personen mit geringer Risikotoleranz',
    ],
  },
  {
    id: 'conservative-retiree',
    name: '🏖️ Ruhestand-Sicherheit',
    description: 'Kapitalerhalt im Ruhestand mit stabilen Entnahmen. Minimales Risiko für bereits Rentner.',
    category: 'conservative',
    icon: '🏖️',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear(),
      monthlyContribution: 0,
      initialInvestment: 400000,
      returnMode: 'fixed',
      expectedReturn: 2.5,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: 'kapitalerhalt',
      ter: 0.15,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Kapitalerhalt-Strategie sichert realen Vermögenswert',
      'Stabile, inflationsgeschützte Entnahmen',
      'Sehr niedrige Volatilität durch konservative Anlage',
      'Vermögen bleibt für Erben erhalten',
    ],
    risks: [
      'Sehr geringe Entnahmen bei niedriger Rendite',
      'Potenzial für höhere Entnahmen wird nicht genutzt',
      'Sensibel gegenüber steigenden Inflationsraten',
    ],
    suitableFor: [
      'Rentner mit Fokus auf Kapitalerhalt',
      'Personen mit ausreichend anderen Einkommensquellen',
      'Anleger, die Vermögen vererben möchten',
    ],
  },

  // Balanced Scenarios
  {
    id: 'balanced-standard',
    name: '⚖️ Ausgewogener Vermögensaufbau',
    description: 'Klassische 70/30-Strategie mit ausgewogenem Risiko-Rendite-Profil. Bewährte Langzeitstrategie.',
    category: 'balanced',
    icon: '⚖️',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 30,
      monthlyContribution: 500,
      initialInvestment: 10000,
      returnMode: 'random',
      expectedReturn: 6.0,
      volatility: 12,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: '4prozent',
      ter: 0.25,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Ausgewogenes Verhältnis zwischen Rendite und Risiko',
      'Historisch bewährte 4%-Entnahme-Regel',
      'Volatilität zeigt realistische Marktschwankungen',
      'Langfristig attraktive Rendite nach Kosten',
    ],
    risks: [
      'Volatilität von 12% bedeutet größere Schwankungen',
      'Sequenzrisiko in ersten Entnahmejahren',
      'Rendite nicht garantiert, nur historischer Durchschnitt',
    ],
    suitableFor: [
      'Langfristig orientierte Anleger (20+ Jahre)',
      'Personen mit moderater Risikotoleranz',
      'Anleger, die Schwankungen aushalten können',
    ],
  },
  {
    id: 'balanced-couple',
    name: '👫 Altersvorsorge für Paare',
    description: 'Gemeinsame Altersvorsorge mit erhöhtem Sparerpauschbetrag. Optimiert für Ehepaare.',
    category: 'balanced',
    icon: '👫',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 25,
      monthlyContribution: 800,
      initialInvestment: 20000,
      returnMode: 'random',
      expectedReturn: 6.5,
      volatility: 14,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 4000, // Doubled for couples
      withdrawalStrategy: '4prozent',
      ter: 0.3,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Doppelter Sparerpauschbetrag (4.000€) für Paare',
      'Höhere monatliche Sparrate durch gemeinsames Einkommen',
      'Gemeinsame Lebenserwartung berücksichtigen',
      'Steueroptimierung durch Zusammenveranlagung',
    ],
    risks: [
      'Abhängigkeit von beiden Einkommen',
      'Längere Lebensspanne erfordert mehr Kapital',
      'Komplexität bei unterschiedlichen Renteneintritten',
    ],
    suitableFor: [
      'Verheiratete Paare oder eingetragene Partnerschaften',
      'Gemeinsame Finanzplanung mit beiden Partnern',
      'Langfristige, stabile Beziehungen',
    ],
  },

  // Aggressive Scenarios
  {
    id: 'aggressive-growth',
    name: '🚀 Maximales Wachstum',
    description: '100% Aktien-Strategie für maximales Wachstumspotenzial. Nur für langfristige, risikotolerante Anleger.',
    category: 'aggressive',
    icon: '🚀',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 35,
      monthlyContribution: 1000,
      initialInvestment: 15000,
      returnMode: 'random',
      expectedReturn: 8.0,
      volatility: 18,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: 'dynamisch',
      ter: 0.2,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Höchste erwartete Rendite durch 100% Aktienanteil',
      'Langfristiger Anlagehorizont nutzt Zinseszins-Effekt',
      'Dynamische Entnahmestrategie passt sich Markt an',
      'Teilfreistellung reduziert Steuerlast auf Aktienfonds',
    ],
    risks: [
      'Sehr hohe Volatilität (18%) führt zu großen Schwankungen',
      'Potenzielle Verluste in Krisenzeiten bis -50%',
      'Psychologische Belastung bei starken Kursrückgängen',
      'Sequenzrisiko besonders ausgeprägt',
    ],
    suitableFor: [
      'Junge Anleger mit 30+ Jahren Anlagehorizont',
      'Hohe Risikotoleranz und finanzielle Stabilität',
      'Personen ohne kurzfristigen Kapitalbedarf',
    ],
  },
  {
    id: 'aggressive-early-retirement',
    name: '💼 Früher Ruhestand (FIRE)',
    description: 'Financial Independence, Retire Early - Aggressive Sparstrategie für frühe finanzielle Unabhängigkeit.',
    category: 'aggressive',
    icon: '💼',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 15,
      monthlyContribution: 2500,
      initialInvestment: 50000,
      returnMode: 'random',
      expectedReturn: 7.5,
      volatility: 16,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: '3prozent',
      ter: 0.15,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Sehr hohe Sparquote (50-70% des Einkommens)',
      'Kurze Ansparphase erfordert aggressive Strategie',
      'Konservative 3%-Entnahme für lange Rentendauer',
      'Frühe finanzielle Unabhängigkeit ab 40-45 Jahren',
    ],
    risks: [
      'Extrem hohe Sparquote schränkt Lebensqualität ein',
      'Lange Entnahmephase (40-50 Jahre) ist anspruchsvoll',
      'Gesundheitskosten in jungen Jahren ohne Arbeitgeber',
      'Inflation über lange Zeiträume schwer vorhersagbar',
    ],
    suitableFor: [
      'Hochverdiener mit niedriger Konsumneigung',
      'Personen mit starkem Wunsch nach früher Unabhängigkeit',
      'Disziplinierte Sparer mit klarem Ziel',
    ],
  },

  // Special Scenarios
  {
    id: 'special-inheritance',
    name: '🎁 Erbschaft investieren',
    description: 'Einmalanlage einer Erbschaft mit langfristigem Anlagehorizont. Optimale Nutzung von Einmalkapital.',
    category: 'special',
    icon: '🎁',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 20,
      monthlyContribution: 200, // Small regular contribution
      initialInvestment: 100000, // Large inheritance
      returnMode: 'random',
      expectedReturn: 6.5,
      volatility: 13,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: '4prozent',
      ter: 0.25,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Große Einmalanlage profitiert sofort vom Zinseszins',
      'Zusätzliche monatliche Sparrate verstärkt Effekt',
      'Langfristiger Anlagehorizont glättet Volatilität',
      'Erbschaftsteuer bereits abgezogen (Netto-Betrag)',
    ],
    risks: [
      'Timing-Risiko bei Einmalanlage (Markt-Hochpunkt)',
      'Versuchung, große Summe auszugeben statt anzulegen',
      'Emotionale Bindung an Erbschaft kann Entscheidungen beeinflussen',
    ],
    suitableFor: [
      'Empfänger größerer Erbschaften oder Schenkungen',
      'Personen mit langfristigem Anlagehorizont',
      'Anleger, die diszipliniert mit großen Summen umgehen können',
    ],
  },
  {
    id: 'special-career-break',
    name: '🎓 Sabbatical-Planung',
    description: 'Vorbereitung auf eine Auszeit mit gezieltem Vermögensaufbau. Finanzielle Freiheit für temporäre Auszeit.',
    category: 'special',
    icon: '🎓',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 5, // Short-term goal
      monthlyContribution: 1200,
      initialInvestment: 10000,
      returnMode: 'fixed',
      expectedReturn: 4.0, // Conservative for short timeframe
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: 'monatlich_fest',
      ter: 0.2,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Kurzer Anlagehorizont erfordert konservative Strategie',
      'Feste Rendite für planbare Zielerreichung',
      'Hohe Sparquote für schnellen Vermögensaufbau',
      'Monatliche Entnahmen während Sabbatical-Phase',
    ],
    risks: [
      'Kurzer Zeitraum lässt wenig Puffer für Marktvolatilität',
      'Feste Kosten während Auszeit könnten steigen',
      'Wiedereinstieg in Arbeitsleben nicht garantiert',
      'Gehaltssteigerungen während Pause verpasst',
    ],
    suitableFor: [
      'Personen, die eine temporäre Auszeit planen',
      'Sabbatical, Weltreise oder Weiterbildung',
      'Mittelfristige Finanzplanung (3-7 Jahre)',
    ],
  },
  {
    id: 'special-child-education',
    name: '👶 Ausbildung für Kinder',
    description: 'Langfristiger Vermögensaufbau für die Ausbildung der Kinder. Bildungssparen mit Horizont bis Volljährigkeit.',
    category: 'special',
    icon: '👶',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 18, // Until child is 18
      monthlyContribution: 250,
      initialInvestment: 5000,
      returnMode: 'random',
      expectedReturn: 6.0,
      volatility: 12,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: 'monatlich_fest',
      ter: 0.3,
      inflationRate: 2.5, // Higher education inflation
    },
    learningPoints: [
      'Langer Anlagehorizont ermöglicht aktienorientierte Strategie',
      'Früher Start maximiert Zinseszins-Effekt',
      'Flexibilität durch ETF-Investment (kein Versicherungsprodukt)',
      'Kapital steht für Studium, Ausbildung oder Start ins Berufsleben bereit',
    ],
    risks: [
      'Bildungsinflation oft höher als allgemeine Inflation',
      'Unsicherheit über tatsächlichen Kapitalbedarf',
      'Marktvolatilität zum Auszahlungszeitpunkt',
      'Steuerliche Behandlung bei Übertragung auf Kind',
    ],
    suitableFor: [
      'Eltern oder Großeltern, die für Kinder vorsorgen',
      'Langfristige Bildungsplanung (10-20 Jahre)',
      'Alternative zu klassischen Ausbildungsversicherungen',
    ],
  },
  {
    id: 'special-self-employed',
    name: '🏢 Selbstständigen-Vorsorge',
    description: 'Altersvorsorge für Selbstständige ohne Rentenanspruch. Eigenverantwortliche Ruhestandsplanung.',
    category: 'special',
    icon: '🏢',
    config: {
      startYear: new Date().getFullYear(),
      retirementYear: new Date().getFullYear() + 30,
      monthlyContribution: 1500, // Higher to compensate for no pension
      initialInvestment: 25000,
      returnMode: 'random',
      expectedReturn: 7.0,
      volatility: 15,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetrag: 2000,
      withdrawalStrategy: 'bucket_strategie',
      ter: 0.25,
      inflationRate: 2.0,
    },
    learningPoints: [
      'Höhere Sparrate kompensiert fehlende gesetzliche Rente',
      'Bucket-Strategie bietet Sicherheit bei Marktvolatilität',
      'Eigenverantwortliche Altersvorsorge ohne Arbeitgeberanteil',
      'Flexibilität bei schwankenden Einkommen möglich',
    ],
    risks: [
      'Keine gesetzliche Absicherung bei Berufsunfähigkeit',
      'Schwankende Einkommen erschweren konstantes Sparen',
      'Keine Arbeitgeberanteile zur Rentenversicherung',
      'Eigenverantwortung erfordert Disziplin und Wissen',
    ],
    suitableFor: [
      'Selbstständige ohne Pflichtversicherung',
      'Freiberufler mit unregelmäßigem Einkommen',
      'Personen, die eigenverantwortlich vorsorgen möchten',
    ],
  },
]

// Helper function to get scenario by ID
export function getScenarioById(id: string): FinancialScenario | undefined {
  return predefinedScenarios.find(scenario => scenario.id === id)
}

// Get scenarios by category
export function getScenariosByCategory(category: FinancialScenario['category']): FinancialScenario[] {
  return predefinedScenarios.filter(scenario => scenario.category === category)
}

// Get all categories
export function getScenarioCategories(): Array<{ id: FinancialScenario['category'], name: string, icon: string }> {
  return [
    { id: 'conservative', name: 'Konservativ', icon: '🛡️' },
    { id: 'balanced', name: 'Ausgewogen', icon: '⚖️' },
    { id: 'aggressive', name: 'Wachstumsorientiert', icon: '🚀' },
    { id: 'special', name: 'Spezielle Situationen', icon: '⭐' },
  ]
}

// Search scenarios by name or description
export function searchScenarios(query: string): FinancialScenario[] {
  const lowerQuery = query.toLowerCase()
  return predefinedScenarios.filter(
    scenario =>
      scenario.name.toLowerCase().includes(lowerQuery)
      || scenario.description.toLowerCase().includes(lowerQuery)
      || scenario.learningPoints.some(point => point.toLowerCase().includes(lowerQuery))
      || scenario.suitableFor.some(suitable => suitable.toLowerCase().includes(lowerQuery)),
  )
}
