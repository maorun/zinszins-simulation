import type { DashboardSectionId } from '../../utils/dashboard-preferences'

/**
 * German section labels for display
 */
export const SECTION_LABELS: Record<DashboardSectionId, string> = {
  introduction: 'Einführung',
  zeitspanne: 'Zeitspanne',
  'sparplan-eingabe': 'Sparplan-Eingabe',
  'return-configuration': 'Rendite-Konfiguration',
  'tax-configuration': 'Steuer-Konfiguration',
  'simulation-results': 'Simulationsergebnisse',
  'withdrawal-planning': 'Entnahmeplanung',
  'monte-carlo-analysis': 'Monte Carlo Analyse',
  'special-events': 'Besondere Ereignisse',
  'risk-analysis': 'Risikoanalyse',
  'behavioral-finance': 'Verhaltensfinanzierung',
  'global-planning': 'Globale Planung',
  'data-export': 'Datenexport',
}

/**
 * Section descriptions for better user understanding
 */
export const SECTION_DESCRIPTIONS: Record<DashboardSectionId, string> = {
  introduction: 'Willkommensbereich und allgemeine Informationen',
  zeitspanne: 'Zeitraum-Auswahl für Simulation',
  'sparplan-eingabe': 'Sparpläne und Einmalzahlungen konfigurieren',
  'return-configuration': 'Rendite-Modus und Parameter einstellen',
  'tax-configuration': 'Steuerliche Einstellungen verwalten',
  'simulation-results': 'Ergebnisse der Ansparphase anzeigen',
  'withdrawal-planning': 'Entnahmestrategie planen',
  'monte-carlo-analysis': 'Wahrscheinlichkeitsanalyse durchführen',
  'special-events': 'Lebensereignisse und Anpassungen',
  'risk-analysis': 'Risikokennzahlen und Analysen',
  'behavioral-finance': 'Anlegerverhalten berücksichtigen',
  'global-planning': 'Umfassende Lebensplanung',
  'data-export': 'Daten exportieren und speichern',
}
