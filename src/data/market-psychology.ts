// Market Psychology Indicators - Sentiment indicators for investment decisions
// Educational content to help users understand market sentiment and timing

/**
 * Market sentiment level
 */
export type SentimentLevel = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'

/**
 * Individual market indicator
 */
export interface MarketIndicator {
  name: string
  germanName: string
  description: string
  currentValue: number // 0-100 scale
  interpretation: string
  source: string
  lastUpdate?: string
}

/**
 * Complete market psychology state
 */
export interface MarketPsychologyState {
  overallSentiment: SentimentLevel
  sentimentScore: number // 0-100 scale (0 = extreme fear, 100 = extreme greed)
  indicators: Record<string, MarketIndicator>
  interpretation: string
  recommendation: string
  historicalContext: string
}

/**
 * Calculate overall sentiment level from score
 */
export function getSentimentLevel(score: number): SentimentLevel {
  if (score <= 20) return 'Extreme Fear'
  if (score <= 40) return 'Fear'
  if (score <= 60) return 'Neutral'
  if (score <= 80) return 'Greed'
  return 'Extreme Greed'
}

/**
 * Get color class for sentiment level
 */
export function getSentimentColor(level: SentimentLevel): string {
  switch (level) {
    case 'Extreme Fear':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'Fear':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Neutral':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'Greed':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Extreme Greed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
}

/**
 * Get German label for sentiment level
 */
export function getSentimentLabel(level: SentimentLevel): string {
  switch (level) {
    case 'Extreme Fear':
      return 'Extreme Angst'
    case 'Fear':
      return 'Angst'
    case 'Neutral':
      return 'Neutral'
    case 'Greed':
      return 'Gier'
    case 'Extreme Greed':
      return 'Extreme Gier'
  }
}

/**
 * Market indicators with typical/educational values
 * In a real application, these would be fetched from APIs
 * For this educational tool, we provide realistic static values with explanations
 */
export const marketIndicators: Record<string, MarketIndicator> = {
  volatilityIndex: {
    name: 'Volatility Index (VIX)',
    germanName: 'Volatilitätsindex',
    description:
      'Der VIX misst die erwartete Volatilität des S&P 500 in den nächsten 30 Tagen und wird oft als "Angstindex" bezeichnet.',
    currentValue: 45, // 0-100 scale: normalized VIX value (typical range 10-80, scaled)
    interpretation:
      'Mittlere Werte (40-60) zeigen erhöhte Unsicherheit. Werte über 60 deuten auf Panik hin, unter 30 auf Selbstzufriedenheit.',
    source: 'CBOE - Chicago Board Options Exchange',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
  putCallRatio: {
    name: 'Put/Call Ratio',
    germanName: 'Put-Call-Verhältnis',
    description:
      'Das Verhältnis von Put-Optionen (Absicherung gegen Kursverluste) zu Call-Optionen (Spekulation auf Kursgewinne).',
    currentValue: 55,
    interpretation:
      'Hohe Werte (>60) zeigen Angst und defensive Positionierung. Niedrige Werte (<40) zeigen Optimismus und Risikobereitschaft.',
    source: 'CBOE - Options Market Data',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
  marketMomentum: {
    name: 'Market Momentum',
    germanName: 'Marktdynamik',
    description:
      'Anzahl der Aktien mit 52-Wochen-Hochs vs. Tiefs. Misst die Breite der Marktbewegung.',
    currentValue: 60,
    interpretation:
      'Werte über 60 zeigen breite Marktbeteiligung (positiv). Unter 40 zeigen schwache Marktbreite (negativ).',
    source: 'NYSE - Market Breadth Indicators',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
  junkBondDemand: {
    name: 'Junk Bond Demand',
    germanName: 'Hochzinsanleihen-Nachfrage',
    description:
      'Spread zwischen High-Yield-Anleihen und sicheren Staatsanleihen. Zeigt Risikobereitschaft.',
    currentValue: 50,
    interpretation:
      'Niedrige Spreads (>60 auf unserer Skala) zeigen hohe Risikobereitschaft. Hohe Spreads (<40) zeigen Flucht in Sicherheit.',
    source: 'Bloomberg - Credit Markets',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
  safeHavenDemand: {
    name: 'Safe Haven Demand',
    germanName: 'Nachfrage nach sicheren Häfen',
    description:
      'Relative Stärke von Gold, US-Staatsanleihen und CHF gegenüber risikoreichen Assets.',
    currentValue: 40,
    interpretation:
      'Hohe Werte (>60) zeigen Angst und Kapitalflucht. Niedrige Werte (<40) zeigen Risikobereitschaft.',
    source: 'Multi-Asset Analysis',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
  marketBreadth: {
    name: 'Market Breadth',
    germanName: 'Marktbreite',
    description:
      'Prozentsatz der Aktien über ihrer 50-Tage-Linie. Zeigt wie viele Aktien am Aufschwung teilnehmen.',
    currentValue: 55,
    interpretation:
      'Werte über 60 zeigen gesunden, breiten Aufschwung. Unter 40 warnen vor schwachem Markt trotz steigender Indizes.',
    source: 'Technical Market Analysis',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
  sentimentSurveys: {
    name: 'Sentiment Surveys',
    germanName: 'Stimmungsumfragen',
    description:
      'Aggregierte Umfragen unter institutionellen und privaten Anlegern (z.B. AAII Sentiment).',
    currentValue: 52,
    interpretation:
      'Extreme Werte (>75 oder <25) sind oft konträre Indikatoren. Zu viel Optimismus kann Tops, zu viel Pessimismus Böden signalisieren.',
    source: 'AAII & Other Investor Surveys',
    lastUpdate: 'Beispielwert für Bildungszwecke',
  },
}

/**
 * Calculate overall sentiment score from individual indicators
 */
export function calculateSentimentScore(indicators: Record<string, MarketIndicator>): number {
  const values = Object.values(indicators).map((ind) => ind.currentValue)
  if (values.length === 0) return 50

  // Simple average of all indicators
  const average = values.reduce((sum, val) => sum + val, 0) / values.length
  return Math.round(average)
}

/**
 * Get interpretation based on overall sentiment
 */
export function getOverallInterpretation(sentiment: SentimentLevel, score: number): string {
  switch (sentiment) {
    case 'Extreme Fear':
      return `Mit einem Score von ${score}/100 herrscht extreme Angst am Markt. Historisch waren solche Phasen oft gute langfristige Einstiegschancen, da die Kurse stark gefallen sind. Panikverkäufe sind meist ein schlechter Zeitpunkt zum Verkaufen.`
    case 'Fear':
      return `Mit einem Score von ${score}/100 zeigt der Markt deutliche Angst. Vorsichtige Anleger dominieren, was mittelfristig Chancen bieten kann. Wichtig: Nicht in Panik verfallen, sondern rational agieren.`
    case 'Neutral':
      return `Mit einem Score von ${score}/100 ist der Markt relativ ausgeglichen. Weder extreme Angst noch Gier dominieren. Dies ist oft eine gute Zeit für disziplinierte, planmäßige Investments ohne Markt-Timing-Versuche.`
    case 'Greed':
      return `Mit einem Score von ${score}/100 zeigt der Markt deutliche Gier. Optimismus dominiert, was auf fortgeschrittene Marktphasen hindeuten kann. Vorsicht vor FOMO (Fear of Missing Out) und überbewerteten Assets.`
    case 'Extreme Greed':
      return `Mit einem Score von ${score}/100 herrscht extreme Gier am Markt. Euphorie und Überbewertung sind oft Vorboten von Korrekturen. Historisch waren solche Phasen schlechte Zeitpunkte für große Neuinvestments.`
  }
}

/**
 * Get investment recommendation based on sentiment
 */
export function getInvestmentRecommendation(sentiment: SentimentLevel): string {
  switch (sentiment) {
    case 'Extreme Fear':
      return '🎯 Langfristige Investoren: Gute Zeit für antizyklische Käufe. Kurzfristige Anleger: Vorsicht vor weiteren Rückgängen. Nutzen Sie Sparpläne für kontinuierliche Käufe ohne Market-Timing.'
    case 'Fear':
      return '⚖️ Ausgewogen bleiben. Bei fallenden Kursen nicht in Panik geraten. Für langfristige Anleger können sich Chancen bieten. Sparpläne fortsetzen statt aussetzen.'
    case 'Neutral':
      return '📊 Diszipliniert investieren. Keine extremen Emotionen - gut für rationale Entscheidungen. Halten Sie sich an Ihren Plan und vermeiden Sie Markt-Timing-Versuche.'
    case 'Greed':
      return '⚠️ Vorsichtig werden. Übermäßiger Optimismus kann zu Überbewertungen führen. Keine FOMO-getriebenen Entscheidungen. Gewinne teilweise realisieren kann sinnvoll sein.'
    case 'Extreme Greed':
      return '🛑 Zurückhaltung üben. Euphorie ist oft ein Warnsignal. Keine großen Neuinvestments bei Höchstständen. Eher Risiko reduzieren und Gewinne sichern. Sparpläne können reduziert oder pausiert werden.'
  }
}

/**
 * Get historical context for current sentiment
 */
export function getHistoricalContext(sentiment: SentimentLevel): string {
  switch (sentiment) {
    case 'Extreme Fear':
      return '📚 Historischer Kontext: Extreme Angst-Phasen wie März 2020 (Corona-Crash), 2008 (Finanzkrise) oder 2002 (Dotcom-Crash) waren rückblickend exzellente Kaufgelegenheiten für langfristige Anleger. Kurzfristig können die Kurse aber noch weiter fallen.'
    case 'Fear':
      return '📚 Historischer Kontext: Angst-Phasen treten in jedem Bärenmarkt auf. Wer in solchen Phasen investierte (z.B. 2011 Euro-Krise, 2018 Korrektur), wurde meist innerhalb von 1-3 Jahren belohnt.'
    case 'Neutral':
      return '📚 Historischer Kontext: Neutrale Sentiment-Phasen sind die häufigsten und historisch gute Zeitpunkte für disziplinierte, emotionslose Investments. Die meisten erfolgreichen Buy-and-Hold-Strategien nutzen genau solche Phasen.'
    case 'Greed':
      return '📚 Historischer Kontext: Gier-Phasen entstehen nach längeren Aufwärtstrends. Beispiele: 2017 (Bitcoin-Hype), 2021 (Meme-Stocks). Oft folgen Korrekturen von 10-20%, aber nicht immer sofort.'
    case 'Extreme Greed':
      return '📚 Historischer Kontext: Extreme Gier markierte oft Markt-Tops: 1999/2000 (Dotcom-Blase), 2007 (vor Finanzkrise), Ende 2021 (vor 2022-Korrektur). Allerdings können solche Phasen auch Monate andauern, bevor es zu Korrekturen kommt.'
  }
}

/**
 * Get current market psychology state
 * In production, this would aggregate data from real APIs
 */
export function getMarketPsychologyState(): MarketPsychologyState {
  const score = calculateSentimentScore(marketIndicators)
  const sentiment = getSentimentLevel(score)

  return {
    overallSentiment: sentiment,
    sentimentScore: score,
    indicators: marketIndicators,
    interpretation: getOverallInterpretation(sentiment, score),
    recommendation: getInvestmentRecommendation(sentiment),
    historicalContext: getHistoricalContext(sentiment),
  }
}
