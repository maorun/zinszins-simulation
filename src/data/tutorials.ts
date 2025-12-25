/**
 * Interactive Tutorials - Step-by-step guides for new users
 *
 * This module defines tutorial content to help users understand and use
 * the Zinseszins-Simulation application effectively.
 */

/**
 * Tutorial step targeting a specific UI element
 */
export interface TutorialStep {
  /** Unique identifier for the step */
  id: string
  /** Title of the step */
  title: string
  /** Description/instructions for the step */
  description: string
  /** Optional CSS selector for highlighting an element */
  targetSelector?: string
  /** Position of the tutorial popover relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Optional action the user should take */
  action?: string
  /** Whether this step can be skipped */
  skippable?: boolean
}

/**
 * Complete tutorial definition
 */
export interface Tutorial {
  /** Unique identifier for the tutorial */
  id: string
  /** Tutorial name */
  name: string
  /** Brief description of what the tutorial covers */
  description: string
  /** Category for grouping tutorials */
  category: 'getting-started' | 'savings' | 'withdrawal' | 'tax' | 'advanced'
  /** Icon for the tutorial */
  icon: string
  /** Estimated time to complete in minutes */
  estimatedMinutes: number
  /** Steps in the tutorial */
  steps: TutorialStep[]
  /** Prerequisites (IDs of tutorials that should be completed first) */
  prerequisites?: string[]
}

/**
 * Predefined tutorials for the application
 */
export const tutorials: Tutorial[] = [
  {
    id: 'welcome',
    name: '👋 Willkommen bei der Zinseszins-Simulation',
    description: 'Eine kurze Einführung in die wichtigsten Funktionen der Anwendung',
    category: 'getting-started',
    icon: '👋',
    estimatedMinutes: 3,
    steps: [
      {
        id: 'welcome-intro',
        title: 'Willkommen!',
        description:
          'Die Zinseszins-Simulation hilft Ihnen, Ihre langfristige Finanzplanung unter Berücksichtigung deutscher Steuergesetze zu simulieren. Lassen Sie uns einen kurzen Rundgang machen.',
        skippable: true,
      },
      {
        id: 'welcome-timespan',
        title: 'Zeitspanne festlegen',
        description:
          'Wählen Sie zunächst die Zeitspanne für Ihre Simulation. Der Startjahr ist normalerweise das aktuelle Jahr, und das Rentenjahr ist Ihr geplanter Ruhestand.',
        targetSelector: '[data-tutorial="zeitspanne"]',
        position: 'bottom',
        action: 'Passen Sie die Zeitspanne mit den Schiebereglern an',
      },
      {
        id: 'welcome-savings-plan',
        title: 'Sparplan erstellen',
        description:
          'Hier können Sie regelmäßige Sparpläne einrichten. Geben Sie an, wie viel Sie monatlich oder jährlich investieren möchten.',
        targetSelector: '[data-tutorial="sparplan-eingabe"]',
        position: 'bottom',
        action: 'Klicken Sie auf "Sparplan hinzufügen" um einen neuen Sparplan zu erstellen',
      },
      {
        id: 'welcome-return-config',
        title: 'Rendite konfigurieren',
        description:
          'Wählen Sie die erwartete Rendite Ihrer Investitionen. Sie können zwischen fester Rendite, zufälliger Rendite (Monte Carlo) oder variablen Renditen wählen.',
        targetSelector: '[data-tutorial="rendite-config"]',
        position: 'bottom',
        action: 'Passen Sie die Renditeeinstellungen nach Ihren Erwartungen an',
      },
      {
        id: 'welcome-results',
        title: 'Ergebnisse ansehen',
        description:
          'Die Simulation zeigt Ihnen das erwartete Endkapital, die jährliche Entwicklung und wichtige Kennzahlen wie die Gesamtrendite und gezahlte Steuern.',
        targetSelector: '[data-tutorial="simulation-results"]',
        position: 'top',
      },
      {
        id: 'welcome-complete',
        title: 'Weitere Funktionen entdecken',
        description:
          'Sie haben die Grundlagen kennengelernt! Erkunden Sie weitere Tutorials, um mehr über Steueroptimierung, Entnahmestrategien und erweiterte Analysen zu erfahren.',
        skippable: false,
      },
    ],
  },
  {
    id: 'savings-plan-basics',
    name: '💰 Sparpläne verstehen',
    description: 'Lernen Sie, wie Sie effektive Sparpläne erstellen und verwalten',
    category: 'savings',
    icon: '💰',
    estimatedMinutes: 5,
    prerequisites: ['welcome'],
    steps: [
      {
        id: 'savings-intro',
        title: 'Sparpläne - Ihr Weg zum Vermögensaufbau',
        description:
          'Sparpläne sind regelmäßige Investitionen, die durch den Zinseszins-Effekt über Zeit erheblich wachsen können. Lassen Sie uns einen Sparplan einrichten.',
      },
      {
        id: 'savings-monthly-vs-yearly',
        title: 'Monatlich oder jährlich?',
        description:
          'Sie können wählen, ob Sie monatlich oder jährlich sparen möchten. Monatliches Sparen nutzt den Cost-Average-Effekt besser, während jährliches Sparen einfacher zu verwalten ist.',
        targetSelector: '[data-tutorial="calculation-mode"]',
        position: 'bottom',
        action: 'Wählen Sie zwischen monatlicher und jährlicher Berechnung',
      },
      {
        id: 'savings-amount',
        title: 'Sparbetrag festlegen',
        description:
          'Legen Sie fest, wie viel Sie regelmäßig investieren möchten. Beginnen Sie mit einem realistischen Betrag, den Sie langfristig aufbringen können.',
        targetSelector: '[data-tutorial="savings-amount"]',
        position: 'right',
        action: 'Geben Sie Ihren monatlichen oder jährlichen Sparbetrag ein',
      },
      {
        id: 'savings-initial-investment',
        title: 'Startkapital (optional)',
        description:
          'Wenn Sie bereits Kapital haben, können Sie dies als Einmalzahlung hinzufügen. Dies beschleunigt den Vermögensaufbau durch den Zinseszins-Effekt.',
        targetSelector: '[data-tutorial="initial-investment"]',
        position: 'right',
        action: 'Optional: Fügen Sie ein Startkapital hinzu',
      },
      {
        id: 'savings-compound-effect',
        title: 'Der Zinseszins-Effekt',
        description:
          'In der Simulationstabelle sehen Sie, wie Ihr Kapital Jahr für Jahr wächst. Beachten Sie, wie die Zinsen auf Zinsen wirken und das Wachstum beschleunigen.',
        targetSelector: '[data-tutorial="year-by-year"]',
        position: 'top',
      },
      {
        id: 'savings-complete',
        title: 'Sparpläne meistern',
        description:
          'Glückwunsch! Sie verstehen nun, wie Sparpläne funktionieren. Probieren Sie verschiedene Beträge und Zeiträume aus, um zu sehen, wie sich Ihr Vermögen entwickelt.',
      },
    ],
  },
  {
    id: 'tax-configuration',
    name: '🧾 Deutsche Steuern verstehen',
    description: 'Verstehen Sie die deutschen Steuerregeln für Kapitalanlagen',
    category: 'tax',
    icon: '🧾',
    estimatedMinutes: 7,
    prerequisites: ['welcome'],
    steps: [
      {
        id: 'tax-intro',
        title: 'Steuern auf Kapitalerträge',
        description:
          'In Deutschland unterliegen Kapitalerträge der Abgeltungssteuer (26,375% inkl. Solidaritätszuschlag). Diese Simulation berücksichtigt alle relevanten deutschen Steuerregeln.',
      },
      {
        id: 'tax-config-section',
        title: 'Steuereinstellungen',
        description:
          'Im Steuer-Konfigurationsbereich können Sie alle steuerrelevanten Parameter anpassen. Die Standardwerte entsprechen den aktuellen deutschen Steuergesetzen.',
        targetSelector: '[data-tutorial="tax-config"]',
        position: 'bottom',
        action: 'Öffnen Sie die Steuerkonfiguration',
      },
      {
        id: 'tax-freibetrag',
        title: 'Sparerpauschbetrag',
        description:
          'Der Sparerpauschbetrag (2.000€ für Einzelpersonen, 4.000€ für Paare) ist steuerfrei. Kapitalerträge bis zu diesem Betrag werden nicht besteuert.',
        targetSelector: '[data-tutorial="freibetrag"]',
        position: 'right',
        action: 'Überprüfen Sie den Sparerpauschbetrag',
      },
      {
        id: 'tax-teilfreistellung',
        title: 'Teilfreistellungsquote',
        description:
          'Aktienfonds profitieren von einer Teilfreistellung (30%), Mischfonds von 15%. Dies reduziert die steuerpflichtige Kapitaleinkünfte.',
        targetSelector: '[data-tutorial="teilfreistellung"]',
        position: 'right',
        action: 'Wählen Sie die passende Anlageklasse',
      },
      {
        id: 'tax-vorabpauschale',
        title: 'Vorabpauschale verstehen',
        description:
          'Die Vorabpauschale ist eine jährliche Mindestbesteuerung für thesaurierende Fonds. In der Simulation wird sie automatisch berechnet und in den Ergebnissen angezeigt.',
        targetSelector: '[data-tutorial="vorabpauschale-info"]',
        position: 'top',
      },
      {
        id: 'tax-guenstigerpruefung',
        title: 'Günstigerprüfung (optional)',
        description:
          'Bei niedrigem Einkommen kann die Günstigerprüfung vorteilhaft sein. Das Finanzamt vergleicht automatisch Ihren persönlichen Steuersatz mit der Abgeltungssteuer.',
        targetSelector: '[data-tutorial="guenstigerpruefung"]',
        position: 'right',
      },
      {
        id: 'tax-complete',
        title: 'Steuerregeln verstanden',
        description:
          'Exzellent! Sie verstehen nun die wichtigsten deutschen Steuerregeln für Kapitalanlagen. Die Simulation berücksichtigt alle diese Faktoren automatisch.',
      },
    ],
  },
  {
    id: 'withdrawal-strategies',
    name: '🏖️ Entnahmestrategien planen',
    description: 'Lernen Sie verschiedene Strategien für die Entsparphase kennen',
    category: 'withdrawal',
    icon: '🏖️',
    estimatedMinutes: 6,
    prerequisites: ['welcome', 'savings-plan-basics'],
    steps: [
      {
        id: 'withdrawal-intro',
        title: 'Die Entsparphase',
        description:
          'Nach dem Vermögensaufbau folgt die Entsparphase. Hier entnehmen Sie regelmäßig Geld aus Ihrem Portfolio, um Ihren Ruhestand zu finanzieren.',
      },
      {
        id: 'withdrawal-tab',
        title: 'Entnehmen-Tab',
        description:
          'Wechseln Sie zum "Entnehmen"-Tab, um Entnahmestrategien zu konfigurieren und zu simulieren.',
        targetSelector: '[data-tutorial="entnahme-tab"]',
        position: 'bottom',
        action: 'Klicken Sie auf den "Entnehmen"-Tab',
      },
      {
        id: 'withdrawal-strategies',
        title: 'Entnahmestrategien',
        description:
          'Es gibt verschiedene Strategien: Die 4%-Regel (klassisch), die 3%-Regel (konservativ), variable Prozentsätze oder feste monatliche Beträge.',
        targetSelector: '[data-tutorial="withdrawal-strategy"]',
        position: 'right',
        action: 'Wählen Sie eine Entnahmestrategie',
      },
      {
        id: 'withdrawal-4percent',
        title: 'Die 4%-Regel',
        description:
          'Die 4%-Regel besagt, dass Sie jährlich 4% Ihres Startkapitals entnehmen können und das Portfolio trotzdem 30+ Jahre hält. Dies ist eine bewährte Strategie.',
        targetSelector: '[data-tutorial="withdrawal-rate"]',
        position: 'right',
      },
      {
        id: 'withdrawal-flexible',
        title: 'Flexible Entnahmen',
        description:
          'Sie können auch variable Entnahmen planen, die sich an Ihre Lebensphase anpassen (z.B. mehr in den aktiven Ruhestandsjahren, weniger später).',
        targetSelector: '[data-tutorial="flexible-withdrawal"]',
        position: 'right',
      },
      {
        id: 'withdrawal-simulation',
        title: 'Entnahme-Simulation',
        description:
          'Die Simulation zeigt, wie lange Ihr Portfolio mit der gewählten Strategie hält und wie sich das Vermögen über die Jahre entwickelt.',
        targetSelector: '[data-tutorial="withdrawal-results"]',
        position: 'top',
      },
      {
        id: 'withdrawal-complete',
        title: 'Entnahmeplanung gemeistert',
        description:
          'Hervorragend! Sie können nun verschiedene Entnahmestrategien vergleichen und die optimale für Ihre Situation finden.',
      },
    ],
  },
  {
    id: 'monte-carlo-analysis',
    name: '🎲 Monte Carlo Analyse',
    description: 'Verstehen Sie Risiken durch stochastische Simulation',
    category: 'advanced',
    icon: '🎲',
    estimatedMinutes: 5,
    prerequisites: ['welcome', 'savings-plan-basics'],
    steps: [
      {
        id: 'monte-carlo-intro',
        title: 'Was ist Monte Carlo Simulation?',
        description:
          'Monte Carlo Simulation führt Tausende von Szenarien mit zufälligen Renditen durch. So sehen Sie nicht nur den Durchschnitt, sondern auch die Bandbreite möglicher Ergebnisse.',
      },
      {
        id: 'monte-carlo-activate',
        title: 'Renditemodus ändern',
        description:
          'Wählen Sie "Zufällige Rendite (Monte Carlo)" als Renditemodus, um die stochastische Simulation zu aktivieren.',
        targetSelector: '[data-tutorial="return-mode"]',
        position: 'bottom',
        action: 'Wählen Sie "Zufällige Rendite"',
      },
      {
        id: 'monte-carlo-parameters',
        title: 'Durchschnittsrendite und Volatilität',
        description:
          'Geben Sie die erwartete durchschnittliche Rendite und die Volatilität (Schwankungsbreite) an. Aktienfonds haben typischerweise 5-8% Rendite bei 15-20% Volatilität.',
        targetSelector: '[data-tutorial="mc-parameters"]',
        position: 'right',
        action: 'Passen Sie Rendite und Volatilität an',
      },
      {
        id: 'monte-carlo-results',
        title: 'Monte Carlo Ergebnisse',
        description:
          'Die Analyse zeigt verschiedene Perzentile (10%, 25%, Median, 75%, 90%). Sie sehen das beste, wahrscheinlichste und schlechteste Szenario.',
        targetSelector: '[data-tutorial="mc-results"]',
        position: 'top',
      },
      {
        id: 'monte-carlo-interpretation',
        title: 'Ergebnisse interpretieren',
        description:
          'Der Median (50%-Perzentil) ist das wahrscheinlichste Ergebnis. Das 10%-Perzentil zeigt, was im schlechten Fall passiert. Planen Sie konservativ!',
      },
      {
        id: 'monte-carlo-complete',
        title: 'Risiken verstanden',
        description:
          'Großartig! Sie können nun mit Monte Carlo Simulation Ihre Planungssicherheit erhöhen und verschiedene Szenarien durchspielen.',
      },
    ],
  },
]

/**
 * Get a tutorial by ID
 */
export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find(tutorial => tutorial.id === id)
}

/**
 * Get tutorials by category
 */
export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return tutorials.filter(tutorial => tutorial.category === category)
}

/**
 * Get all tutorial categories
 */
export function getAllTutorialCategories(): Array<Tutorial['category']> {
  return ['getting-started', 'savings', 'withdrawal', 'tax', 'advanced']
}

/**
 * Get category display name in German
 */
export function getCategoryName(category: Tutorial['category']): string {
  const names: Record<Tutorial['category'], string> = {
    'getting-started': 'Erste Schritte',
    'savings': 'Sparpläne',
    'withdrawal': 'Entnahme',
    'tax': 'Steuern',
    'advanced': 'Erweitert',
  }
  return names[category]
}

/**
 * Check if a tutorial has all prerequisites completed
 */
export function canStartTutorial(tutorialId: string, completedTutorialIds: string[]): boolean {
  const tutorial = getTutorialById(tutorialId)
  if (!tutorial) return false
  if (!tutorial.prerequisites || tutorial.prerequisites.length === 0) return true
  
  return tutorial.prerequisites.every(prereqId => completedTutorialIds.includes(prereqId))
}

/**
 * Get recommended next tutorial based on completed tutorials
 */
export function getRecommendedTutorial(completedTutorialIds: string[]): Tutorial | undefined {
  // Always recommend welcome tutorial first
  if (!completedTutorialIds.includes('welcome')) {
    return getTutorialById('welcome')
  }
  
  // Find next uncompleted tutorial with satisfied prerequisites
  for (const tutorial of tutorials) {
    if (
      !completedTutorialIds.includes(tutorial.id) &&
      canStartTutorial(tutorial.id, completedTutorialIds)
    ) {
      return tutorial
    }
  }
  
  return undefined
}
