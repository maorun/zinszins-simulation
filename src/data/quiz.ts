/**
 * Financial Education Quiz - Interactive quiz for learning German tax and investment concepts
 *
 * This module provides quiz questions to help users test their knowledge of:
 * - German tax law (Vorabpauschale, Teilfreistellung, etc.)
 * - Retirement planning (Rürup, Riester, bAV, gesetzliche Rente)
 * - Portfolio management strategies
 * - Risk management concepts
 */

export type QuizCategory = 'Steuern' | 'Altersvorsorge' | 'Portfolio-Management' | 'Risikomanagement'
export type QuizDifficulty = 'Einsteiger' | 'Fortgeschritten' | 'Experte'

/**
 * A single quiz question with multiple choice answers
 */
export interface QuizQuestion {
  /** Unique identifier for the question */
  id: string
  /** The quiz question text */
  question: string
  /** Category of the question */
  category: QuizCategory
  /** Difficulty level */
  difficulty: QuizDifficulty
  /** Array of possible answers */
  options: string[]
  /** Index of the correct answer (0-based) */
  correctAnswerIndex: number
  /** Detailed explanation provided after answering */
  explanation: string
  /** Optional reference to related glossary terms */
  relatedGlossaryTerms?: string[]
}

/**
 * Quiz statistics for tracking user progress
 */
export interface QuizStats {
  /** Total questions attempted */
  totalAttempts: number
  /** Number of correct answers */
  correctAnswers: number
  /** Number of incorrect answers */
  incorrectAnswers: number
  /** Questions attempted by category */
  byCategory: Record<QuizCategory, { correct: number; total: number }>
}

/**
 * Collection of quiz questions organized by category and difficulty
 */
export const quizQuestions: QuizQuestion[] = [
  // Steuern - Einsteiger
  {
    id: 'tax-basic-001',
    question: 'Wie hoch ist der Sparerpauschbetrag für eine ledige Person seit 2023?',
    category: 'Steuern',
    difficulty: 'Einsteiger',
    options: ['801 €', '1.000 €', '2.000 €', '1.602 €'],
    correctAnswerIndex: 1,
    explanation:
      'Der Sparerpauschbetrag wurde 2023 von 801 € auf 1.000 € für Ledige erhöht. Für zusammenveranlagte Paare beträgt er 2.000 €. Bis zu diesem Betrag sind Kapitalerträge steuerfrei.',
    relatedGlossaryTerms: ['sparerpauschbetrag', 'kapitalertragsteuer'],
  },
  {
    id: 'tax-basic-002',
    question: 'Wie hoch ist die Kapitalertragsteuer in Deutschland (inklusive Solidaritätszuschlag)?',
    category: 'Steuern',
    difficulty: 'Einsteiger',
    options: ['25%', '26,375%', '28%', '30%'],
    correctAnswerIndex: 1,
    explanation:
      'Die Kapitalertragsteuer beträgt 25%. Hinzu kommt der Solidaritätszuschlag von 5,5% auf die Steuer (25% × 5,5% = 1,375%), was insgesamt 26,375% ergibt.',
    relatedGlossaryTerms: ['kapitalertragsteuer'],
  },
  {
    id: 'tax-basic-003',
    question: 'Was ist die Teilfreistellung bei Aktienfonds?',
    category: 'Steuern',
    difficulty: 'Einsteiger',
    options: [
      '15% der Erträge sind steuerfrei',
      '30% der Erträge sind steuerfrei',
      '50% der Erträge sind steuerfrei',
      'Es gibt keine Teilfreistellung',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Bei Aktienfonds sind 30% der Erträge steuerfrei. Dies berücksichtigt, dass auf Fondsebene bereits Körperschaftsteuer gezahlt wurde. Bei Mischfonds beträgt die Teilfreistellung 15%, bei Immobilienfonds 60-80%.',
    relatedGlossaryTerms: ['teilfreistellung'],
  },

  // Steuern - Fortgeschritten
  {
    id: 'tax-advanced-001',
    question: 'Wie wird die Vorabpauschale berechnet?',
    category: 'Steuern',
    difficulty: 'Fortgeschritten',
    options: [
      'Fondswert × Basiszins × 100%',
      'Fondswert × Basiszins × 70%',
      'Fondswert × Basiszins × 30%',
      'Fondswert × 2,55%',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Die Vorabpauschale wird mit folgender Formel berechnet: Fondswert zu Jahresbeginn × Basiszins × 70%. Der Basiszins wird jährlich vom Bundesfinanzministerium festgelegt. Die Vorabpauschale ist auf die tatsächlichen Wertsteigerungen des Fonds begrenzt.',
    relatedGlossaryTerms: ['vorabpauschale', 'basiszins'],
  },
  {
    id: 'tax-advanced-002',
    question: 'Wann lohnt sich die Günstigerprüfung bei Kapitalerträgen?',
    category: 'Steuern',
    difficulty: 'Fortgeschritten',
    options: [
      'Bei persönlichem Steuersatz über 26,375%',
      'Bei persönlichem Steuersatz unter 26,375%',
      'Immer',
      'Nie, sie wird automatisch durchgeführt',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Die Günstigerprüfung lohnt sich, wenn der persönliche Einkommensteuersatz unter 26,375% liegt (z.B. bei Studenten, Rentnern mit niedrigem Einkommen). Das Finanzamt führt sie bei der Steuererklärung automatisch durch und wählt die günstigere Variante.',
    relatedGlossaryTerms: ['guenstigerpruefung', 'kapitalertragsteuer'],
  },
  {
    id: 'tax-advanced-003',
    question:
      'Wie hoch ist der maximale Absetzbetrag für Rürup-Rentenbeiträge im Jahr 2024 für Ledige?',
    category: 'Steuern',
    difficulty: 'Fortgeschritten',
    options: ['25.639 €', '27.566 €', '20.000 €', '23.712 €'],
    correctAnswerIndex: 1,
    explanation:
      'Für 2024 beträgt der Höchstbeitrag zur Rürup-Rente 27.566 € für Ledige und 55.132 € für Verheiratete. Diese Beiträge sind zu 100% steuerlich absetzbar (ab 2025 vollständig). Die Grenze orientiert sich am Höchstbeitrag zur knappschaftlichen Rentenversicherung.',
    relatedGlossaryTerms: [],
  },

  // Steuern - Experte
  {
    id: 'tax-expert-001',
    question:
      'Welche Anlageklasse hat die höchste Teilfreistellungsquote im deutschen Investmentsteuerrecht?',
    category: 'Steuern',
    difficulty: 'Experte',
    options: ['Aktienfonds (30%)', 'Mischfonds (15%)', 'Immobilienfonds (60-80%)', 'Rentenfonds (0%)'],
    correctAnswerIndex: 2,
    explanation:
      'Immobilienfonds haben die höchste Teilfreistellung: 60% für Investmentfonds und 80% für REIT-Anteile. Dies liegt daran, dass Immobiliengesellschaften keine Körperschaftsteuer zahlen, aber dennoch Grunderwerbsteuer und andere immobilienspezifische Steuern anfallen.',
    relatedGlossaryTerms: ['teilfreistellung'],
  },
  {
    id: 'tax-expert-002',
    question:
      'Was ist der maximale Prozentsatz, zu dem ausländische Quellensteuer auf die deutsche Kapitalertragsteuer angerechnet werden kann?',
    category: 'Steuern',
    difficulty: 'Experte',
    options: ['10%', '15%', '25%', 'Unbegrenzt bis zur Höhe der deutschen Steuer'],
    correctAnswerIndex: 3,
    explanation:
      'Ausländische Quellensteuer kann bis zur Höhe der deutschen Kapitalertragsteuer angerechnet werden. Die Anrechnung erfolgt nach § 32d EStG und berücksichtigt die Teilfreistellung. Überschüssige ausländische Quellensteuer kann nicht erstattet oder vorgetragen werden.',
    relatedGlossaryTerms: [],
  },

  // Altersvorsorge - Einsteiger
  {
    id: 'retirement-basic-001',
    question: 'Welche Altersvorsorge bietet die höchste staatliche Förderung in Form von Zulagen?',
    category: 'Altersvorsorge',
    difficulty: 'Einsteiger',
    options: ['Gesetzliche Rente', 'Riester-Rente', 'Rürup-Rente', 'Betriebsrente (bAV)'],
    correctAnswerIndex: 1,
    explanation:
      'Die Riester-Rente bietet staatliche Zulagen: 175 € Grundzulage plus 185-300 € Kinderzulage pro Kind. Zusätzlich können Beiträge als Sonderausgaben abgesetzt werden (Günstigerprüfung bis 2.100 €).',
    relatedGlossaryTerms: [],
  },
  {
    id: 'retirement-basic-002',
    question: 'Wie viel Prozent der Rürup-Rentenbeiträge sind ab 2025 steuerlich absetzbar?',
    category: 'Altersvorsorge',
    difficulty: 'Einsteiger',
    options: ['74%', '90%', '96%', '100%'],
    correctAnswerIndex: 3,
    explanation:
      'Ab 2025 sind Rürup-Rentenbeiträge zu 100% steuerlich absetzbar. Die Absetzbarkeit wurde schrittweise seit 2005 erhöht (2005: 60%, 2023: 96%, 2025: 100%). Die Rente wird im Gegenzug später nachgelagert besteuert.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'retirement-basic-003',
    question: 'Was ist der Vorteil der betrieblichen Altersvorsorge (bAV) in der Ansparphase?',
    category: 'Altersvorsorge',
    difficulty: 'Einsteiger',
    options: [
      'Nur steuerfrei',
      'Nur sozialversicherungsfrei',
      'Steuer- und sozialversicherungsfrei bis zu Grenzen',
      'Vollständig steuerpflichtig',
    ],
    correctAnswerIndex: 2,
    explanation:
      'Die bAV ist bis zu 8% der BBG West steuerfrei (7.248 € in 2024) und bis zu 4% der BBG West sozialversicherungsfrei (3.624 € in 2024). Dies bedeutet eine doppelte Ersparnis: weniger Steuern und weniger Sozialabgaben.',
    relatedGlossaryTerms: [],
  },

  // Altersvorsorge - Fortgeschritten
  {
    id: 'retirement-advanced-001',
    question: 'Wie hoch ist der Rentenabschlag pro Monat bei vorzeitigem Renteneintritt?',
    category: 'Altersvorsorge',
    difficulty: 'Fortgeschritten',
    options: ['0,2%', '0,3%', '0,5%', '1,0%'],
    correctAnswerIndex: 1,
    explanation:
      'Bei vorzeitigem Renteneintritt beträgt der Rentenabschlag 0,3% pro Monat, also 3,6% pro Jahr. Dieser Abschlag gilt lebenslang. Der Ausgleich der Rentenabschläge ist durch freiwillige Zahlungen nach § 187a SGB VI möglich.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'retirement-advanced-002',
    question: 'Welcher Besteuerungsanteil gilt für Rentenbeginn im Jahr 2040?',
    category: 'Altersvorsorge',
    difficulty: 'Fortgeschritten',
    options: ['50%', '80%', '90%', '100%'],
    correctAnswerIndex: 3,
    explanation:
      'Renten mit Beginn ab 2040 werden zu 100% besteuert. Der Besteuerungsanteil steigt schrittweise: 2005 waren es 50%, 2023 sind es 83%, und ab 2040 gilt die vollständige nachgelagerte Besteuerung für alle Neurentner.',
    relatedGlossaryTerms: [],
  },

  // Portfolio-Management - Einsteiger
  {
    id: 'portfolio-basic-001',
    question: 'Was bedeutet "Rebalancing" im Portfolio-Management?',
    category: 'Portfolio-Management',
    difficulty: 'Einsteiger',
    options: [
      'Verkauf aller Positionen',
      'Wiederherstellung der ursprünglichen Asset-Allokation',
      'Erhöhung der Aktienquote',
      'Reduzierung des Risikos',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Rebalancing bedeutet die Wiederherstellung der ursprünglichen Asset-Allokation. Wenn z.B. Aktien stark gestiegen sind und nun 70% statt geplanter 60% ausmachen, werden Aktien verkauft und Anleihen gekauft, um wieder auf 60/40 zu kommen.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'portfolio-basic-002',
    question: 'Was ist die "100-minus-Alter"-Regel?',
    category: 'Portfolio-Management',
    difficulty: 'Einsteiger',
    options: [
      'Maximale Anzahl von Aktien im Portfolio',
      'Empfohlene Aktienquote in Prozent',
      'Mindestanlagedauer in Jahren',
      'Maximales Risiko in Prozent',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Die "100-minus-Alter"-Regel ist eine Faustformel für die Aktienquote: Bei einem 30-Jährigen wären das 70% Aktien (100-30=70), bei einem 60-Jährigen 40%. Sie dient als grobe Orientierung, sollte aber individuell an Risikobereitschaft und Ziele angepasst werden.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'portfolio-basic-003',
    question: 'Was ist ein ETF?',
    category: 'Portfolio-Management',
    difficulty: 'Einsteiger',
    options: [
      'Ein einzelnes Unternehmen',
      'Ein börsengehandelter Indexfonds',
      'Eine Staatsanleihe',
      'Ein Sparkonto',
    ],
    correctAnswerIndex: 1,
    explanation:
      'ETF steht für Exchange Traded Fund (börsengehandelter Fonds). ETFs bilden einen Index nach (z.B. DAX, MSCI World) und können wie Aktien an der Börse gehandelt werden. Sie bieten breite Diversifikation bei niedrigen Kosten.',
    relatedGlossaryTerms: [],
  },

  // Portfolio-Management - Fortgeschritten
  {
    id: 'portfolio-advanced-001',
    question: 'Was ist die Sharpe Ratio?',
    category: 'Portfolio-Management',
    difficulty: 'Fortgeschritten',
    options: [
      'Die absolute Rendite eines Portfolios',
      'Das Verhältnis von Rendite zu Risiko',
      'Die Korrelation zwischen zwei Assets',
      'Die durchschnittliche Volatilität',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Die Sharpe Ratio misst das Verhältnis von Überrendite (über dem risikolosen Zins) zu Volatilität. Eine höhere Sharpe Ratio bedeutet bessere risikoadjustierte Rendite. Werte über 1 gelten als gut, über 2 als sehr gut.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'portfolio-advanced-002',
    question: 'Was ist "Tax Loss Harvesting"?',
    category: 'Portfolio-Management',
    difficulty: 'Fortgeschritten',
    options: [
      'Steuerhinterziehung',
      'Verkauf von Verlustpositionen zur Steueroptimierung',
      'Aufschub von Steuerz ahlungen',
      'Investition in steuerfreie Anlagen',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Tax Loss Harvesting bedeutet den strategischen Verkauf von Verlustpositionen, um Kapitalgewinne zu verrechnen und Steuern zu sparen. In Deutschland können Verluste mit Gewinnen desselben Jahres verrechnet werden. Wichtig: Wash-Sale-Regel beachten.',
    relatedGlossaryTerms: [],
  },

  // Risikomanagement - Einsteiger
  {
    id: 'risk-basic-001',
    question: 'Was ist Diversifikation?',
    category: 'Risikomanagement',
    difficulty: 'Einsteiger',
    options: [
      'Investition in nur eine Aktie',
      'Verteilung des Kapitals auf verschiedene Anlagen',
      'Verkauf aller Aktien',
      'Investition nur in sichere Anlagen',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Diversifikation bedeutet "nicht alle Eier in einen Korb legen". Durch Verteilung des Kapitals auf verschiedene Anlageklassen, Länder und Branchen wird das Risiko reduziert. Ein diversifiziertes Portfolio schwankt weniger stark als Einzelinvestments.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'risk-basic-002',
    question: 'Was ist ein Notgroschen und wie groß sollte er mindestens sein?',
    category: 'Risikomanagement',
    difficulty: 'Einsteiger',
    options: [
      '1 Monatsgehalt',
      '3-6 Monatsausgaben',
      '12 Monatsausgaben',
      'Er ist nicht notwendig',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Ein Notgroschen ist eine sofort verfügbare Geldreserve für Notfälle (Jobverlust, Autoreparatur, etc.). Er sollte 3-6 Monatsausgaben betragen (Angestellte) bzw. 6-12 Monate (Selbstständige) und auf einem Tagesgeldkonto o.ä. liegen.',
    relatedGlossaryTerms: [],
  },

  // Risikomanagement - Fortgeschritten
  {
    id: 'risk-advanced-001',
    question: 'Was ist Volatilität?',
    category: 'Risikomanagement',
    difficulty: 'Fortgeschritten',
    options: [
      'Die erwartete Rendite',
      'Die Schwankungsbreite von Kursen',
      'Die Inflationsrate',
      'Der Zinssatz',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Volatilität ist ein Maß für die Schwankungsbreite von Wertpapierkursen. Sie wird meist als Standardabweichung der Renditen angegeben. Hohe Volatilität bedeutet größere Kursschwankungen (höheres Risiko), niedrige Volatilität bedeutet stabilere Kurse.',
    relatedGlossaryTerms: [],
  },
  {
    id: 'risk-advanced-002',
    question: 'Was ist der Maximum Drawdown?',
    category: 'Risikomanagement',
    difficulty: 'Fortgeschritten',
    options: [
      'Der höchste jemals erreichte Wert',
      'Der größte Verlust vom Höchststand bis zum Tiefststand',
      'Die durchschnittliche jährliche Rendite',
      'Die Standardabweichung',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Der Maximum Drawdown ist der größte prozentuale Verlust vom Höchststand bis zum tiefsten Punkt. Ein MDD von 50% bedeutet, dass das Portfolio vom Höchststand um die Hälfte gefallen ist. Er ist ein wichtiges Risikomaß für die psychologische Belastbarkeit.',
    relatedGlossaryTerms: [],
  },
]

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: QuizCategory): QuizQuestion[] {
  return quizQuestions.filter((q) => q.category === category)
}

/**
 * Get questions by difficulty
 */
export function getQuestionsByDifficulty(difficulty: QuizDifficulty): QuizQuestion[] {
  return quizQuestions.filter((q) => q.difficulty === difficulty)
}

/**
 * Get a random question from the pool
 */
export function getRandomQuestion(): QuizQuestion {
  const randomIndex = Math.floor(Math.random() * quizQuestions.length)
  return quizQuestions[randomIndex]
}

/**
 * Get random questions (without replacement)
 */
export function getRandomQuestions(count: number): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, quizQuestions.length))
}

/**
 * Calculate quiz statistics
 */
export function calculateQuizStats(
  answers: Array<{ questionId: string; userAnswerIndex: number; isCorrect: boolean }>
): QuizStats {
  const byCategory: Record<QuizCategory, { correct: number; total: number }> = {
    Steuern: { correct: 0, total: 0 },
    Altersvorsorge: { correct: 0, total: 0 },
    'Portfolio-Management': { correct: 0, total: 0 },
    Risikomanagement: { correct: 0, total: 0 },
  }

  answers.forEach((answer) => {
    const question = quizQuestions.find((q) => q.id === answer.questionId)
    if (question) {
      byCategory[question.category].total++
      if (answer.isCorrect) {
        byCategory[question.category].correct++
      }
    }
  })

  return {
    totalAttempts: answers.length,
    correctAnswers: answers.filter((a) => a.isCorrect).length,
    incorrectAnswers: answers.filter((a) => !a.isCorrect).length,
    byCategory,
  }
}
