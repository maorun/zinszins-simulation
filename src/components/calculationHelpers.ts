// Helper functions to create calculation explanations for different simulation data

interface CalculationStep {
  title: string
  description: string
  calculation: string
  result: string
  backgroundColor: string
  borderColor: string
}

interface CalculationExplanation {
  title: string
  introduction: string
  steps: CalculationStep[]
  finalResult: {
    title: string
    values: { label: string, value: string }[]
  }
}

// Format currency for display
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

// Interest calculation explanation (for savings phase)
export function createInterestExplanation(
  startkapital: number,
  zinsen: number,
  rendite: number,
  _year: number,
): CalculationExplanation {
  return {
    title: '📈 Zinsen-Berechnung Schritt für Schritt',
    introduction: 'Die Zinsen werden basierend auf dem Startkapital und der erwarteten Rendite berechnet. Diese Berechnung zeigt, wie sich Ihr Kapital durch Zinsen und Zinseszinsen vermehrt.',
    steps: [
      {
        title: 'Schritt 1: Startkapital ermitteln',
        description: 'Das verfügbare Kapital zu Beginn des Jahres.',
        calculation: `Startkapital = ${formatCurrency(startkapital)}`,
        result: formatCurrency(startkapital),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Rendite anwenden',
        description: `Die erwartete jährliche Rendite von ${rendite}% wird auf das Startkapital angewendet.`,
        calculation: `Zinsen = Startkapital × Rendite<br/>${formatCurrency(startkapital)} × ${rendite}%`,
        result: formatCurrency(zinsen),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Startkapital', value: formatCurrency(startkapital) },
        { label: 'Zinsen/Wertzuwachs', value: formatCurrency(zinsen) },
        { label: 'Rendite', value: `${rendite}%` },
      ],
    },
  }
}

// Tax calculation explanation (for savings phase)
export function createTaxExplanation(
  bezahlteSteuer: number,
  vorabpauschaleAmount: number,
  steuersatz: number,
  teilfreistellungsquote: number,
  freibetrag: number,
  _year: number,
): CalculationExplanation {
  const steuerVorFreibetrag = vorabpauschaleAmount * steuersatz * (1 - teilfreistellungsquote)

  return {
    title: '💸 Steuer-Berechnung Schritt für Schritt',
    introduction: 'Die Steuerberechnung erfolgt basierend auf der Vorabpauschale, dem Steuersatz und dem verfügbaren Freibetrag. Für thesaurierende Fonds wird jährlich die Vorabpauschale besteuert.',
    steps: [
      {
        title: 'Schritt 1: Vorabpauschale ermitteln',
        description: 'Die Vorabpauschale ist der Betrag, der für die Besteuerung relevant ist.',
        calculation: `Vorabpauschale = ${formatCurrency(vorabpauschaleAmount)}`,
        result: formatCurrency(vorabpauschaleAmount),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Steuer vor Sparerpauschbetrag berechnen',
        description: `Steuer wird mit ${(steuersatz * 100).toFixed(1)}% Steuersatz berechnet, reduziert um ${(teilfreistellungsquote * 100)}% Teilfreistellung.`,
        calculation: `Steuer = Vorabpauschale × ${(steuersatz * 100).toFixed(1)}% × (1 - ${(teilfreistellungsquote * 100)}%)<br/>${formatCurrency(vorabpauschaleAmount)} × ${(steuersatz * 100).toFixed(1)}% × ${((1 - teilfreistellungsquote) * 100)}%`,
        result: formatCurrency(steuerVorFreibetrag),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
      {
        title: 'Schritt 3: Sparerpauschbetrag anwenden',
        description: `Der verfügbare Sparerpauschbetrag von ${formatCurrency(freibetrag)} reduziert die zu zahlende Steuer.`,
        calculation: `Bezahlte Steuer = max(0, Steuer vor Sparerpauschbetrag - Sparerpauschbetrag)<br/>max(0, ${formatCurrency(steuerVorFreibetrag)} - ${formatCurrency(freibetrag)})`,
        result: formatCurrency(bezahlteSteuer),
        backgroundColor: '#e3f2fd',
        borderColor: '#64b5f6',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Vorabpauschale', value: formatCurrency(vorabpauschaleAmount) },
        { label: 'Steuer vor Sparerpauschbetrag', value: formatCurrency(steuerVorFreibetrag) },
        { label: 'Genutzter Sparerpauschbetrag', value: formatCurrency(Math.min(freibetrag, steuerVorFreibetrag)) },
        { label: 'Bezahlte Steuer', value: formatCurrency(bezahlteSteuer) },
      ],
    },
  }
}

// Inflation calculation explanation (for withdrawal phase)
export function createInflationExplanation(
  baseAmount: number,
  inflationRate: number,
  yearsPassed: number,
  inflationAnpassung: number,
): CalculationExplanation {
  const totalInflationMultiplier = Math.pow(1 + inflationRate, yearsPassed)
  const adjustedAmount = baseAmount * totalInflationMultiplier

  return {
    title: '📈 Inflation-Anpassung Schritt für Schritt',
    introduction: 'Die Inflation-Anpassung sorgt dafür, dass die Kaufkraft der Entnahme über die Jahre erhalten bleibt. Der Entnahmebetrag wird jährlich um die Inflationsrate erhöht.',
    steps: [
      {
        title: 'Schritt 1: Basis-Entnahmebetrag',
        description: 'Der ursprüngliche Entnahmebetrag zu Beginn der Entnahme-Phase.',
        calculation: `Basis-Betrag = ${formatCurrency(baseAmount)}`,
        result: formatCurrency(baseAmount),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Inflationsrate anwenden',
        description: `Nach ${yearsPassed} Jahr${yearsPassed === 1 ? '' : 'en'} mit ${(inflationRate * 100).toFixed(1)}% jährlicher Inflation.`,
        calculation: `Angepasster Betrag = Basis-Betrag × (1 + Inflation)^Jahre<br/>${formatCurrency(baseAmount)} × (1 + ${(inflationRate * 100).toFixed(1)}%)^${yearsPassed}<br/>${formatCurrency(baseAmount)} × ${totalInflationMultiplier.toFixed(4)}`,
        result: formatCurrency(adjustedAmount),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
      {
        title: 'Schritt 3: Inflations-Anpassung berechnen',
        description: 'Die zusätzliche Summe durch die Inflations-Anpassung.',
        calculation: `Inflations-Anpassung = Angepasster Betrag - Basis-Betrag<br/>${formatCurrency(adjustedAmount)} - ${formatCurrency(baseAmount)}`,
        result: formatCurrency(inflationAnpassung),
        backgroundColor: '#e3f2fd',
        borderColor: '#64b5f6',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Basis-Entnahmebetrag', value: formatCurrency(baseAmount) },
        { label: 'Inflationsrate', value: `${(inflationRate * 100).toFixed(1)}% p.a.` },
        { label: 'Jahre vergangen', value: yearsPassed.toString() },
        { label: 'Inflations-Anpassung', value: formatCurrency(inflationAnpassung) },
        { label: 'Angepasster Gesamtbetrag', value: formatCurrency(adjustedAmount) },
      ],
    },
  }
}

// Income tax calculation explanation (for withdrawal phase)
export function createIncomeTaxExplanation(
  entnahme: number,
  grundfreibetrag: number,
  steuersatz: number,
  einkommensteuer: number,
  genutzterGrundfreibetrag: number,
): CalculationExplanation {
  const steuerpflichtigesEinkommen = Math.max(0, entnahme - grundfreibetrag)

  return {
    title: '🏛️ Einkommensteuer-Berechnung Schritt für Schritt',
    introduction: 'Die Einkommensteuer wird auf die Entnahme angewendet, wobei der Grundfreibetrag steuerfrei bleibt. Dies ist relevant für Rentner ohne weiteres Einkommen.',
    steps: [
      {
        title: 'Schritt 1: Entnahmebetrag ermitteln',
        description: 'Die jährliche Entnahme aus dem Portfolio.',
        calculation: `Jährliche Entnahme = ${formatCurrency(entnahme)}`,
        result: formatCurrency(entnahme),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Grundfreibetrag anwenden',
        description: `Der Grundfreibetrag von ${formatCurrency(grundfreibetrag)} ist steuerfrei.`,
        calculation: `Steuerpflichtiges Einkommen = max(0, Entnahme - Grundfreibetrag)<br/>max(0, ${formatCurrency(entnahme)} - ${formatCurrency(grundfreibetrag)})`,
        result: formatCurrency(steuerpflichtigesEinkommen),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
      {
        title: 'Schritt 3: Einkommensteuer berechnen',
        description: `Steuersatz von ${steuersatz}% auf das steuerpflichtige Einkommen.`,
        calculation: `Einkommensteuer = Steuerpflichtiges Einkommen × ${steuersatz}%<br/>${formatCurrency(steuerpflichtigesEinkommen)} × ${steuersatz}%`,
        result: formatCurrency(einkommensteuer),
        backgroundColor: '#e3f2fd',
        borderColor: '#64b5f6',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Jährliche Entnahme', value: formatCurrency(entnahme) },
        { label: 'Grundfreibetrag verfügbar', value: formatCurrency(grundfreibetrag) },
        { label: 'Genutzter Grundfreibetrag', value: formatCurrency(genutzterGrundfreibetrag) },
        { label: 'Steuerpflichtiges Einkommen', value: formatCurrency(steuerpflichtigesEinkommen) },
        { label: 'Einkommensteuer', value: formatCurrency(einkommensteuer) },
      ],
    },
  }
}

// Withdrawal interest calculation explanation
export function createWithdrawalInterestExplanation(
  startkapital: number,
  zinsen: number,
  rendite: number,
  _year: number,
): CalculationExplanation {
  return {
    title: '📈 Zinsen-Berechnung (Entnahme-Phase) Schritt für Schritt',
    introduction: 'Auch während der Entnahme-Phase erwirtschaftet das verbleibende Kapital weiterhin Zinsen. Diese Zinsen helfen dabei, das Portfolio länger aufrechtzuerhalten.',
    steps: [
      {
        title: 'Schritt 1: Verfügbares Kapital',
        description: 'Das Kapital, das zu Beginn des Jahres zur Verfügung steht.',
        calculation: `Startkapital = ${formatCurrency(startkapital)}`,
        result: formatCurrency(startkapital),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Rendite erwirtschaften',
        description: `Das Kapital erwirtschaftet eine Rendite von ${rendite}% über das Jahr.`,
        calculation: `Zinsen = Startkapital × Rendite<br/>${formatCurrency(startkapital)} × ${rendite}%`,
        result: formatCurrency(zinsen),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Startkapital', value: formatCurrency(startkapital) },
        { label: 'Erwirtschaftete Zinsen', value: formatCurrency(zinsen) },
        { label: 'Rendite', value: `${rendite}%` },
      ],
    },
  }
}

// Taxable income calculation explanation
export function createTaxableIncomeExplanation(
  entnahme: number,
  grundfreibetrag: number,
  _vorabpauschale?: number,
  _kapitalertragsteuer?: number,
): CalculationExplanation {
  const steuerpflichtigesEinkommen = Math.max(0, entnahme - grundfreibetrag)

  return {
    title: '💰 Zu versteuerndes Einkommen Schritt für Schritt',
    introduction: 'Das zu versteuernde Einkommen ergibt sich aus der Entnahme nach Abzug der verfügbaren Freibeträge. Dies ist die Grundlage für die Berechnung der Einkommensteuer.',
    steps: [
      {
        title: 'Schritt 1: Brutto-Entnahme',
        description: 'Die gesamte Entnahme aus dem Portfolio vor Steuern.',
        calculation: `Brutto-Entnahme = ${formatCurrency(entnahme)}`,
        result: formatCurrency(entnahme),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Grundfreibetrag abziehen',
        description: `Der steuerfreie Grundfreibetrag von ${formatCurrency(grundfreibetrag)} wird abgezogen.`,
        calculation: `Zu versteuerndes Einkommen = max(0, Brutto-Entnahme - Grundfreibetrag)<br/>max(0, ${formatCurrency(entnahme)} - ${formatCurrency(grundfreibetrag)})`,
        result: formatCurrency(steuerpflichtigesEinkommen),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Brutto-Entnahme', value: formatCurrency(entnahme) },
        { label: 'Grundfreibetrag', value: formatCurrency(grundfreibetrag) },
        { label: 'Zu versteuerndes Einkommen', value: formatCurrency(steuerpflichtigesEinkommen) },
      ],
    },
  }
}
