/**
 * Predefined Realistic Life Scenarios for Financial Planning
 *
 * This module provides a library of predefined, realistic financial planning scenarios
 * that users can import with one click. Each scenario represents a typical life situation
 * with appropriate financial parameters, savings rates, and investment strategies.
 *
 * Scenarios include detailed explanations to help users understand typical financial
 * planning situations and compare their own situation against common benchmarks.
 */

import type { ExtendedSavedConfiguration } from '../src/contexts/helpers/config-types'
import { SimulationAnnual } from '../src/utils/simulate'

/**
 * Category of predefined scenarios
 */
export type ScenarioCategory =
  | 'career-start' // Berufsanfänger
  | 'family' // Familie
  | 'mid-career' // Karrieremitte
  | 'pre-retirement' // Vor dem Ruhestand
  | 'retirement' // Im Ruhestand
  | 'wealth-building' // Vermögensaufbau

/**
 * Predefined scenario with metadata
 */
export interface PredefinedScenario {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Category */
  category: ScenarioCategory
  /** Short description (1-2 sentences) */
  description: string
  /** Detailed explanation of assumptions and strategy */
  detailedExplanation: string
  /** Target audience description */
  targetAudience: string
  /** Key assumptions as bullet points */
  keyAssumptions: string[]
  /** Configuration to apply */
  configuration: ExtendedSavedConfiguration
  /** Tags for filtering */
  tags: string[]
}

/**
 * Get category display name in German
 */
export function getCategoryDisplayName(category: ScenarioCategory): string {
  const names: Record<ScenarioCategory, string> = {
    'career-start': 'Berufsanfänger',
    family: 'Familie',
    'mid-career': 'Karrieremitte',
    'pre-retirement': 'Vor dem Ruhestand',
    retirement: 'Im Ruhestand',
    'wealth-building': 'Vermögensaufbau',
  }
  return names[category]
}

/**
 * Get all predefined scenarios
 */
export function getPredefinedScenarios(): PredefinedScenario[] {
  return PREDEFINED_SCENARIOS_DATA
}

/**
 * Predefined scenarios data
 * Extracted to separate constant to keep getPredefinedScenarios() function small
 */
const PREDEFINED_SCENARIOS_DATA: PredefinedScenario[] = (() => {
  const currentYear = new Date().getFullYear()

  return [
    // Berufsanfänger
    {
      id: 'career-starter-conservative',
      name: 'Berufsanfänger - Konservativ',
      category: 'career-start',
      description:
        'Für junge Berufsstarter (25-30 Jahre) mit erstem Gehalt und moderatem Sparwillen. Fokus auf langfristigen Vermögensaufbau mit konservativer Strategie.',
      detailedExplanation:
        'Dieses Szenario ist für Berufseinsteiger gedacht, die gerade ihre erste Festanstellung haben und mit dem Sparen beginnen möchten. Die Sparrate ist moderat (200€/Monat, später steigend auf 400€/Monat), um Flexibilität für andere Ausgaben zu bewahren. Die Anlagestrategie ist konservativ mit 5% erwarteter Rendite, passend für Anleger mit geringer Risikotoleranz oder Mischfonds-Portfolio. Der Anlagehorizont ist sehr lang (40 Jahre), was den Zinseszinseffekt optimal nutzt.',
      targetAudience: 'Alter 25-30, Brutto-Jahresgehalt 35.000-45.000€, erste Festanstellung',
      keyAssumptions: [
        'Monatliche Sparrate: 200€ (Jahre 1-10), dann 400€',
        'Erwartete Rendite: 5% p.a. (Mischfonds)',
        'Anlagehorizont: 40 Jahre',
        'Teilfreistellung: 30% (Aktienfonds)',
        'Keine Einmalzahlung zu Beginn',
      ],
      configuration: {
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'fixed',
        averageReturn: 5,
        standardDeviation: 15,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 40],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 10}-12-31`,
            einzahlung: 2400, // 200€/month * 12
          },
          {
            id: 2,
            start: `${currentYear + 11}-01-01`,
            end: `${currentYear + 40}-12-31`,
            einzahlung: 4800, // 400€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['konservativ', 'einsteiger', 'langfristig', 'mischfonds'],
    },
    {
      id: 'career-starter-aggressive',
      name: 'Berufsanfänger - Offensiv',
      category: 'career-start',
      description:
        'Für ambitionierte junge Berufsstarter mit höherem Einkommen und Risikobereitschaft. Maximal offensive Aktienstrategie für langfristigen Vermögensaufbau.',
      detailedExplanation:
        'Perfekt für junge Menschen mit gutem Einkommen, die bereit sind, höhere Risiken für potenziell höhere Renditen einzugehen. Mit 7% erwarteter Rendite und hoher Volatilität (20%) bildet dieses Szenario ein 100% Aktien-Portfolio ab (z.B. MSCI World ETF). Die höhere Sparrate (500€/Monat) reflektiert ein besseres Einkommen. Der lange Anlagehorizont (40 Jahre) hilft, kurzfristige Schwankungen auszusitzen.',
      targetAudience: 'Alter 25-30, Brutto-Jahresgehalt 50.000-65.000€, hohe Risikotoleranz',
      keyAssumptions: [
        'Monatliche Sparrate: 500€ (konstant)',
        'Erwartete Rendite: 7% p.a. (100% Aktien)',
        'Volatilität: 20% (hohes Risiko)',
        'Anlagehorizont: 40 Jahre',
        'Teilfreistellung: 30% (Aktienfonds)',
      ],
      configuration: {
        rendite: 7,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'random',
        averageReturn: 7,
        standardDeviation: 20,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 40],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 40}-12-31`,
            einzahlung: 6000, // 500€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['offensiv', 'aktien', 'langfristig', 'höheres-einkommen'],
    },

    // Familie
    {
      id: 'young-family',
      name: 'Junge Familie mit Kindern',
      category: 'family',
      description:
        'Für Familien mit kleinen Kindern (30-40 Jahre), die trotz hoher Ausgaben für ihre Zukunft vorsorgen möchten. Ausgewogene Balance zwischen Sparen und Liquidität.',
      detailedExplanation:
        'Dieses Szenario berücksichtigt die finanzielle Realität junger Familien: Höhere Ausgaben für Kinder bedeuten kleinere Sparraten (150€/Monat), aber dennoch langfristige Vorsorge. Die moderate Renditeerwartung (5,5%) entspricht einem ausgewogenen Portfolio (60/40 Aktien/Anleihen). Eine kleine Einmalzahlung (5.000€) könnte z.B. Elterngeld-Erspartes sein. Der Zeithorizont (30 Jahre) führt zur Entnahmephase wenn die Kinder selbstständig sind.',
      targetAudience:
        'Alter 30-40, Doppelverdiener-Haushalt 60.000-80.000€, 1-2 kleine Kinder',
      keyAssumptions: [
        'Monatliche Sparrate: 150€ (begrenzt durch Kinderkosten)',
        'Einmalzahlung: 5.000€ (z.B. Elterngeld-Rücklage)',
        'Erwartete Rendite: 5,5% p.a. (60/40 Aktien/Anleihen)',
        'Anlagehorizont: 30 Jahre',
        'Teilfreistellung: 30%',
      ],
      configuration: {
        rendite: 5.5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'fixed',
        averageReturn: 5.5,
        standardDeviation: 12,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 30],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 5000,
            eventType: 'inheritance', // Mark as one-time investment
          },
          {
            id: 2,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 30}-12-31`,
            einzahlung: 1800, // 150€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['familie', 'ausgewogen', 'kinder', 'doppelverdiener'],
    },

    // Karrieremitte
    {
      id: 'mid-career-wealth-building',
      name: 'Karrieremitte - Vermögensaufbau',
      category: 'mid-career',
      description:
        'Für Berufstätige in der Karrieremitte (40-50 Jahre) mit gutem Einkommen und fokussiertem Vermögensaufbau für die Altersvorsorge. Aggressive aber ausgewogene Strategie.',
      detailedExplanation:
        'In der Karrieremitte steigt typischerweise das Einkommen deutlich, während Ausgaben für Kinder zurückgehen. Dieses Szenario nutzt diese Phase optimal mit höheren Sparraten (800€/Monat) und einer Einmalzahlung von 20.000€ (z.B. Bonus, Erbschaft, oder aufgelöstes Sparguthaben). Mit 6,5% erwarteter Rendite und 20 Jahren Anlagehorizont ist noch genug Zeit für Aktien-fokussierte Strategie (70/30), aber mit etwas mehr Sicherheit als in jungen Jahren.',
      targetAudience:
        'Alter 40-50, Brutto-Jahresgehalt 70.000-100.000€, etablierte Karriere',
      keyAssumptions: [
        'Monatliche Sparrate: 800€',
        'Einmalzahlung: 20.000€',
        'Erwartete Rendite: 6,5% p.a. (70/30 Aktien/Anleihen)',
        'Volatilität: 16%',
        'Anlagehorizont: 20 Jahre',
      ],
      configuration: {
        rendite: 6.5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'random',
        averageReturn: 6.5,
        standardDeviation: 16,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 20],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 20000,
            eventType: 'inheritance',
          },
          {
            id: 2,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 20}-12-31`,
            einzahlung: 9600, // 800€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['karrieremitte', 'hohe-sparrate', 'vermögensaufbau', 'etabliert'],
    },
    {
      id: 'dual-income-no-kids',
      name: 'DINK - Doppelverdiener ohne Kinder',
      category: 'mid-career',
      description:
        'Für Doppelverdiener-Paare ohne Kinder mit hohem verfügbaren Einkommen. Maximaler Vermögensaufbau mit aggressiver Strategie.',
      detailedExplanation:
        'DINKs (Double Income, No Kids) haben oft das höchste verfügbare Einkommen für Investitionen. Dieses Szenario nutzt diese Situation optimal mit sehr hohen monatlichen Sparraten (1.500€) und einer substanziellen Einmalzahlung (50.000€). Die aggressive Renditeerwartung (7,5%) mit hoher Volatilität entspricht einem stark aktienorientierten Portfolio. Perfekt für Paare, die ihre finanzielle Freiheit maximieren möchten.',
      targetAudience:
        'Alter 35-50, kombiniertes Brutto-Jahresgehalt 120.000-180.000€, keine Kinder',
      keyAssumptions: [
        'Monatliche Sparrate: 1.500€ (gemeinsam)',
        'Einmalzahlung: 50.000€',
        'Erwartete Rendite: 7,5% p.a. (85/15 Aktien/Anleihen)',
        'Volatilität: 18%',
        'Anlagehorizont: 25 Jahre',
      ],
      configuration: {
        rendite: 7.5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'random',
        averageReturn: 7.5,
        standardDeviation: 18,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 25],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 50000,
            eventType: 'inheritance',
          },
          {
            id: 2,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 25}-12-31`,
            einzahlung: 18000, // 1500€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['dink', 'high-income', 'aggressiv', 'doppelverdiener'],
    },

    // Vor dem Ruhestand
    {
      id: 'pre-retirement-conservative',
      name: 'Kurz vor Ruhestand - Sicherheitsorientiert',
      category: 'pre-retirement',
      description:
        'Für Menschen kurz vor dem Ruhestand (55-60 Jahre) mit Fokus auf Kapitalerhalt. Konservative Strategie zum Schutz des angesammelten Vermögens.',
      detailedExplanation:
        'In den letzten Jahren vor dem Ruhestand liegt der Fokus auf Kapitalerhalt statt Wachstum. Dieses Szenario startet mit substanziellem Kapital (150.000€) und moderaten laufenden Sparraten (600€/Monat), um das Portfolio vor dem Ruhestand aufzufüllen. Die konservative Rendite (4%) entspricht einem defensiven Portfolio (30/70 Aktien/Anleihen). Mit nur 10 Jahren Horizont werden Marktschwankungen minimiert.',
      targetAudience: 'Alter 55-60, bestehendes Vermögen, Fokus auf Sicherheit vor Ruhestand',
      keyAssumptions: [
        'Bestehendes Kapital: 150.000€',
        'Monatliche Sparrate: 600€ (letzte Sparjahre)',
        'Erwartete Rendite: 4% p.a. (30/70 Aktien/Anleihen)',
        'Anlagehorizont: 10 Jahre',
        'Fokus auf Kapitalerhalt',
      ],
      configuration: {
        rendite: 4,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'fixed',
        averageReturn: 4,
        standardDeviation: 8,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 10],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 150000,
            eventType: 'inheritance',
          },
          {
            id: 2,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 10}-12-31`,
            einzahlung: 7200, // 600€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['pre-retirement', 'konservativ', 'kapitalerhalt', 'sicherheit'],
    },
    {
      id: 'late-starter',
      name: 'Spätstarter - Aufholphase',
      category: 'pre-retirement',
      description:
        'Für Menschen, die erst spät mit dem Sparen begonnen haben (45-55 Jahre). Aggressive Strategie mit hohen Sparraten zum Aufholen.',
      detailedExplanation:
        'Wer erst spät mit dem systematischen Vermögensaufbau beginnt, muss aggressiver vorgehen. Dieses Szenario kombiniert eine moderate Einmalzahlung (30.000€) mit sehr hohen monatlichen Sparraten (1.200€), um verlorene Zeit aufzuholen. Die höhere Renditeerwartung (7%) rechtfertigt sich durch den noch 20-jährigen Anlagehorizont und die Notwendigkeit, schnell Vermögen aufzubauen. Volatilität von 18% ist akzeptabel bei diesem Zeithorizont.',
      targetAudience:
        'Alter 45-55, später Karrierestart oder spätes Sparbewusstsein, hohes aktuelles Einkommen',
      keyAssumptions: [
        'Einmalzahlung: 30.000€',
        'Hohe monatliche Sparrate: 1.200€',
        'Erwartete Rendite: 7% p.a. (70/30 Aktien/Anleihen)',
        'Volatilität: 18%',
        'Anlagehorizont: 20 Jahre (Aufholphase)',
      ],
      configuration: {
        rendite: 7,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'random',
        averageReturn: 7,
        standardDeviation: 18,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 20],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 30000,
            eventType: 'inheritance',
          },
          {
            id: 2,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 20}-12-31`,
            einzahlung: 14400, // 1200€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['spätstarter', 'aufholen', 'hohe-sparrate', 'aggressiv'],
    },

    // Vermögensaufbau
    {
      id: 'inheritance-management',
      name: 'Erbschaft-Management',
      category: 'wealth-building',
      description:
        'Für Menschen, die eine größere Erbschaft erhalten haben und diese optimal anlegen möchten. Professionelle Vermögensverwaltungs-Strategie.',
      detailedExplanation:
        'Eine Erbschaft bietet die Chance für substanziellen Vermögensaufbau. Dieses Szenario startet mit einer großen Einmalzahlung (250.000€) und ergänzt diese mit moderaten laufenden Sparbeiträgen (500€/Monat). Die ausgewogene Renditeerwartung (6%) entspricht einem professionell verwalteten Portfolio (60/40 Aktien/Anleihen). Mit 25 Jahren Anlagehorizont kann das Vermögen optimal für die Altersvorsorge oder als generationenübergreifender Vermögensaufbau wachsen.',
      targetAudience: 'Alle Altersgruppen, Erbschaft oder Schenkung erhalten, Langfristfokus',
      keyAssumptions: [
        'Erbschaft/Schenkung: 250.000€',
        'Ergänzende monatliche Sparrate: 500€',
        'Erwartete Rendite: 6% p.a. (60/40 Aktien/Anleihen)',
        'Volatilität: 14%',
        'Anlagehorizont: 25 Jahre',
      ],
      configuration: {
        rendite: 6,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'random',
        averageReturn: 6,
        standardDeviation: 14,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 25],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 250000,
            eventType: 'inheritance',
          },
          {
            id: 2,
            start: `${currentYear}-01-01`,
            end: `${currentYear + 25}-12-31`,
            einzahlung: 6000, // 500€/month * 12
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['erbschaft', 'vermögensverwaltung', 'großkapital', 'ausgewogen'],
    },
    {
      id: 'entrepreneur-exit',
      name: 'Unternehmer nach Exit',
      category: 'wealth-building',
      description:
        'Für Unternehmer nach erfolgreichem Unternehmensverkauf. Diversifizierung und professionelle Vermögensanlage mit substanziellem Kapital.',
      detailedExplanation:
        'Nach einem erfolgreichen Exit müssen Unternehmer ihr Kapital diversifizieren und professionell anlegen. Dieses Szenario beginnt mit substanziellem Kapital (500.000€) und fokussiert auf langfristige Wertsteigerung ohne weitere Sparbeiträge. Die moderate Renditeerwartung (5,5%) entspricht einem ausgewogenen, breit diversifizierten Portfolio mit professionellem Risikomanagement. Der 30-jährige Horizont ermöglicht langfristige Vermögensplanung und potenziellen generationenübergreifenden Vermögensaufbau.',
      targetAudience: 'Unternehmer nach Exit, Fokus auf Vermögenserhalt und Wachstum',
      keyAssumptions: [
        'Exit-Erlös (nach Steuern): 500.000€',
        'Keine weiteren Sparbeiträge',
        'Erwartete Rendite: 5,5% p.a. (50/50 Aktien/Anleihen)',
        'Volatilität: 12%',
        'Anlagehorizont: 30 Jahre (langfristig)',
      ],
      configuration: {
        rendite: 5.5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetragPerYear: { [currentYear]: 2000 },
        returnMode: 'random',
        averageReturn: 5.5,
        standardDeviation: 12,
        variableReturns: {},
        startEnd: [currentYear, currentYear + 30],
        sparplan: [
          {
            id: 1,
            start: `${currentYear}-01-01`,
            end: null,
            einzahlung: 500000,
            eventType: 'inheritance',
          },
        ],
        simulationAnnual: SimulationAnnual.monthly,
      },
      tags: ['unternehmer', 'exit', 'großkapital', 'diversifikation'],
    },
  ]
})()

/**
 * Get scenarios filtered by category
 */
export function getScenariosByCategory(category: ScenarioCategory): PredefinedScenario[] {
  return getPredefinedScenarios().filter((scenario) => scenario.category === category)
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): PredefinedScenario | undefined {
  return getPredefinedScenarios().find((scenario) => scenario.id === id)
}

/**
 * Get all available categories
 */
export function getAllCategories(): ScenarioCategory[] {
  return ['career-start', 'family', 'mid-career', 'pre-retirement', 'retirement', 'wealth-building']
}

/**
 * Search scenarios by keyword
 */
export function searchScenarios(keyword: string): PredefinedScenario[] {
  const lowerKeyword = keyword.toLowerCase()
  return getPredefinedScenarios().filter(
    (scenario) =>
      scenario.name.toLowerCase().includes(lowerKeyword) ||
      scenario.description.toLowerCase().includes(lowerKeyword) ||
      scenario.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword)) ||
      scenario.targetAudience.toLowerCase().includes(lowerKeyword),
  )
}
