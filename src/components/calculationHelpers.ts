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
    values: Array<{ label: string, value: string }>
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

// Final capital calculation explanation (for savings phase)
export function createEndkapitalExplanation(
  endkapital: number,
  startkapital: number,
  einzahlung: number,
  zinsen: number,
  bezahlteSteuer: number,
  year: number,
): CalculationExplanation {
  return {
    title: '🎯 Endkapital-Berechnung Schritt für Schritt',
    introduction: `Die Endkapital-Berechnung für das Jahr ${year} zeigt, wie sich Ihr Portfolio durch Einzahlungen, Zinserträge und Steuern entwickelt. Das Endkapital ist das verfügbare Kapital am Ende des Jahres.`,
    steps: [
      {
        title: 'Schritt 1: Startkapital zu Jahresbeginn',
        description: 'Das verfügbare Kapital zu Beginn des Jahres (Endkapital des Vorjahres).',
        calculation: `Startkapital = ${formatCurrency(startkapital)}`,
        result: formatCurrency(startkapital),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 2: Neue Einzahlungen addieren',
        description: 'Ihre Einzahlungen/Sparraten für das Jahr werden zum Startkapital hinzugefügt.',
        calculation: `Kapital nach Einzahlungen = Startkapital + Einzahlungen<br/>${formatCurrency(startkapital)} + ${formatCurrency(einzahlung)}`,
        result: formatCurrency(startkapital + einzahlung),
        backgroundColor: '#e8f5e8',
        borderColor: '#81c784',
      },
      {
        title: 'Schritt 3: Zinserträge/Wertzuwachs berücksichtigen',
        description: 'Die erwirtschafteten Zinsen und Wertsteigerungen werden hinzugefügt (können auch negativ sein bei Verlusten).',
        calculation: `Kapital nach Zinsen = Kapital nach Einzahlungen + Zinsen<br/>${formatCurrency(startkapital + einzahlung)} + ${formatCurrency(zinsen)}`,
        result: formatCurrency(startkapital + einzahlung + zinsen),
        backgroundColor: '#e3f2fd',
        borderColor: '#64b5f6',
      },
      {
        title: 'Schritt 4: Steuern abziehen',
        description: 'Die für das Jahr anfallenden Steuern (z.B. Vorabpauschale) werden vom Kapital abgezogen.',
        calculation: `Endkapital = Kapital nach Zinsen - Bezahlte Steuern<br/>${formatCurrency(startkapital + einzahlung + zinsen)} - ${formatCurrency(bezahlteSteuer)}`,
        result: formatCurrency(endkapital),
        backgroundColor: '#f3e5f5',
        borderColor: '#ba68c8',
      },
    ],
    finalResult: {
      title: 'Endergebnis',
      values: [
        { label: 'Startkapital', value: formatCurrency(startkapital) },
        { label: 'Einzahlungen', value: formatCurrency(einzahlung) },
        { label: 'Zinsen/Wertzuwachs', value: formatCurrency(zinsen) },
        { label: 'Bezahlte Steuern', value: formatCurrency(bezahlteSteuer) },
        { label: 'Endkapital', value: formatCurrency(endkapital) },
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
  statutoryPensionTaxableAmount?: number,
  otherIncomeGrossAmount?: number,
  healthCareInsuranceAnnual?: number,
): CalculationExplanation {
  // Calculate total taxable income from all sources
  let totalTaxableIncome = entnahme

  if (statutoryPensionTaxableAmount) {
    totalTaxableIncome += statutoryPensionTaxableAmount
  }

  if (otherIncomeGrossAmount) {
    totalTaxableIncome += otherIncomeGrossAmount
  }

  // Deduct health care insurance contributions (tax-deductible in Germany)
  if (healthCareInsuranceAnnual && healthCareInsuranceAnnual > 0) {
    totalTaxableIncome -= healthCareInsuranceAnnual
  }

  const steuerpflichtigesEinkommen = Math.max(0, totalTaxableIncome - grundfreibetrag)

  const steps = [
    {
      title: 'Schritt 1: Portfolio-Entnahme',
      description: 'Die Entnahme aus dem Portfolio vor Steuern.',
      calculation: `Portfolio-Entnahme = ${formatCurrency(entnahme)}`,
      result: formatCurrency(entnahme),
      backgroundColor: '#fff3e0',
      borderColor: '#ffcc80',
    },
  ]

  // Add statutory pension step if applicable
  if (statutoryPensionTaxableAmount && statutoryPensionTaxableAmount > 0) {
    steps.push({
      title: 'Schritt 2: Gesetzliche Rente (steuerpflichtiger Anteil)',
      description: 'Der steuerpflichtige Anteil der gesetzlichen Rente wird zu den Einkünften hinzugefügt.',
      calculation: `Steuerpflichtiger Rentenanteil = ${formatCurrency(statutoryPensionTaxableAmount)}`,
      result: formatCurrency(statutoryPensionTaxableAmount),
      backgroundColor: '#e3f2fd',
      borderColor: '#90caf9',
    })
  }

  // Add other income step if applicable
  if (otherIncomeGrossAmount && otherIncomeGrossAmount > 0) {
    steps.push({
      title: `Schritt ${steps.length + 1}: Andere Einkünfte`,
      description: 'Weitere Einkünfte (Mieteinnahmen, Nebeneinkünfte, etc.) werden zu den Einkünften hinzugefügt.',
      calculation: `Andere Einkünfte = ${formatCurrency(otherIncomeGrossAmount)}`,
      result: formatCurrency(otherIncomeGrossAmount),
      backgroundColor: '#f3e5f5',
      borderColor: '#ce93d8',
    })
  }

  // Add health care insurance deduction step if applicable
  if (healthCareInsuranceAnnual && healthCareInsuranceAnnual > 0) {
    steps.push({
      title: `Schritt ${steps.length + 1}: Krankenversicherung abziehen`,
      description: 'Kranken- und Pflegeversicherungsbeiträge sind in Deutschland steuerlich absetzbar und werden von den '
        + 'Brutto-Einkünften abgezogen.',
      calculation: `Krankenversicherungsbeiträge = ${formatCurrency(healthCareInsuranceAnnual)} `
        + '(steuerlich absetzbar)',
      result: `-${formatCurrency(healthCareInsuranceAnnual)}`,
      backgroundColor: '#e1f5fe',
      borderColor: '#81d4fa',
    })
  }

  // Add total income step if we have multiple sources or health care insurance
  if (statutoryPensionTaxableAmount || otherIncomeGrossAmount
    || (healthCareInsuranceAnnual && healthCareInsuranceAnnual > 0)) {
    let calculationText = `Gesamte Einkünfte = Portfolio-Entnahme`
    if (statutoryPensionTaxableAmount && statutoryPensionTaxableAmount > 0) {
      calculationText += ` + Gesetzliche Rente`
    }
    if (otherIncomeGrossAmount && otherIncomeGrossAmount > 0) {
      calculationText += ` + Andere Einkünfte`
    }
    if (healthCareInsuranceAnnual && healthCareInsuranceAnnual > 0) {
      calculationText += ` - Krankenversicherung`
    }
    calculationText += `<br/>${formatCurrency(entnahme)}`
    if (statutoryPensionTaxableAmount && statutoryPensionTaxableAmount > 0) {
      calculationText += ` + ${formatCurrency(statutoryPensionTaxableAmount)}`
    }
    if (otherIncomeGrossAmount && otherIncomeGrossAmount > 0) {
      calculationText += ` + ${formatCurrency(otherIncomeGrossAmount)}`
    }
    if (healthCareInsuranceAnnual && healthCareInsuranceAnnual > 0) {
      calculationText += ` - ${formatCurrency(healthCareInsuranceAnnual)}`
    }
    calculationText += ` = ${formatCurrency(totalTaxableIncome)}`

    steps.push({
      title: `Schritt ${steps.length + 1}: Gesamte Einkünfte`,
      description: 'Alle Einkunftsarten werden zusammengefasst und steuerlich absetzbare Beiträge abgezogen.',
      calculation: calculationText,
      result: formatCurrency(totalTaxableIncome),
      backgroundColor: '#fff9c4',
      borderColor: '#fff176',
    })
  }

  // Final step: subtract Grundfreibetrag
  steps.push({
    title: `Schritt ${steps.length + 1}: Grundfreibetrag abziehen`,
    description: `Der steuerfreie Grundfreibetrag von ${formatCurrency(grundfreibetrag)} wird von den gesamten Einkünften abgezogen.`,
    calculation: `Zu versteuerndes Einkommen = max(0, Gesamte Einkünfte - Grundfreibetrag)<br/>max(0, ${formatCurrency(totalTaxableIncome)} - ${formatCurrency(grundfreibetrag)})`,
    result: formatCurrency(steuerpflichtigesEinkommen),
    backgroundColor: '#e8f5e8',
    borderColor: '#81c784',
  })

  const finalResultValues = [
    { label: 'Portfolio-Entnahme', value: formatCurrency(entnahme) },
  ]

  if (statutoryPensionTaxableAmount && statutoryPensionTaxableAmount > 0) {
    finalResultValues.push({ label: 'Gesetzliche Rente (steuerpflichtig)', value: formatCurrency(statutoryPensionTaxableAmount) })
  }

  if (otherIncomeGrossAmount && otherIncomeGrossAmount > 0) {
    finalResultValues.push({ label: 'Andere Einkünfte', value: formatCurrency(otherIncomeGrossAmount) })
  }

  if (healthCareInsuranceAnnual && healthCareInsuranceAnnual > 0) {
    finalResultValues.push({ label: 'Krankenversicherung (absetzbar)', value: `-${formatCurrency(healthCareInsuranceAnnual)}` })
  }

  finalResultValues.push(
    { label: 'Gesamte Einkünfte', value: formatCurrency(totalTaxableIncome) },
    { label: 'Grundfreibetrag', value: formatCurrency(grundfreibetrag) },
    { label: 'Zu versteuerndes Einkommen', value: formatCurrency(steuerpflichtigesEinkommen) },
  )

  return {
    title: '💰 Zu versteuerndes Einkommen Schritt für Schritt',
    introduction: 'Das zu versteuernde Einkommen ergibt sich aus allen Einkunftsarten (Portfolio-Entnahme, gesetzliche Rente, andere Einkünfte) nach Abzug steuerlich absetzbarer Beiträge (z.B. Krankenversicherung) und dem Grundfreibetrag. Dies ist die Grundlage für die Berechnung der Einkommensteuer.',
    steps,
    finalResult: {
      title: 'Endergebnis',
      values: finalResultValues,
    },
  }
}

// Other income calculation explanation
export function createOtherIncomeExplanation(
  totalNetAmount: number,
  totalTaxAmount: number,
  sourceCount: number,
  _otherIncomeData: any,
): CalculationExplanation {
  const totalGrossAmount = totalNetAmount + totalTaxAmount

  return {
    title: '💰 Andere Einkünfte Schritt für Schritt',
    introduction: `Die anderen Einkünfte umfassen ${sourceCount} Einkommensquelle${sourceCount === 1 ? '' : 'n'} wie Mieteinnahmen, private Renten oder Gewerbeeinkünfte. Diese reduzieren die notwendigen Entnahmen aus dem Portfolio.`,
    steps: [
      {
        title: 'Schritt 1: Brutto-Einkünfte',
        description: `Gesamte Brutto-Einkünfte aus ${sourceCount} Quelle${sourceCount === 1 ? '' : 'n'}.`,
        calculation: `Brutto-Einkünfte = ${formatCurrency(totalGrossAmount)}`,
        result: formatCurrency(totalGrossAmount),
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
      },
      {
        title: 'Schritt 2: Steuern berechnen',
        description: 'Steuern werden basierend auf den konfigurierten Steuersätzen der Brutto-Einkünfte berechnet.',
        calculation: `Steuern = ${formatCurrency(totalTaxAmount)}`,
        result: formatCurrency(totalTaxAmount),
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
      },
      {
        title: 'Schritt 3: Netto-Einkünfte',
        description: 'Die verfügbaren Netto-Einkünfte nach Abzug der Steuern.',
        calculation: `Netto-Einkünfte = ${formatCurrency(totalGrossAmount)} - ${formatCurrency(totalTaxAmount)}`,
        result: formatCurrency(totalNetAmount),
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
      },
    ],
    finalResult: {
      title: 'Zusammenfassung der anderen Einkünfte',
      values: [
        { label: 'Anzahl Einkommensquellen', value: sourceCount.toString() },
        { label: 'Brutto-Einkünfte gesamt', value: formatCurrency(totalGrossAmount) },
        { label: 'Steuern gesamt', value: formatCurrency(totalTaxAmount) },
        { label: 'Netto-Einkünfte verfügbar', value: formatCurrency(totalNetAmount) },
        { label: 'Entlastung des Portfolios', value: formatCurrency(totalNetAmount) },
      ],
    },
  }
}

// Statutory pension calculation explanation
export function createStatutoryPensionExplanation(
  grossAnnualAmount: number,
  netAnnualAmount: number,
  incomeTax: number,
  taxableAmount: number,
  year: number,
): CalculationExplanation {
  const taxablePercentage = grossAnnualAmount > 0 ? (taxableAmount / grossAnnualAmount) * 100 : 0
  const monthlyNetAmount = netAnnualAmount / 12

  return {
    title: '🏛️ Gesetzliche Rente - Berechnung Schritt für Schritt',
    introduction: `Die gesetzliche Rente wird mit dem steuerpflichtigen Anteil versteuert. Hier sehen Sie die Berechnung für das Jahr ${year}.`,
    steps: [
      {
        title: 'Schritt 1: Brutto-Renteneinkommen',
        description: 'Die jährliche Brutto-Rente, die Sie von der Deutschen Rentenversicherung erhalten.',
        calculation: `Brutto-Rente (jährlich) = ${formatCurrency(grossAnnualAmount)}`,
        result: formatCurrency(grossAnnualAmount),
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
      },
      {
        title: 'Schritt 2: Steuerpflichtiger Anteil',
        description: `Der steuerpflichtige Anteil der Rente beträgt ${taxablePercentage.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% der Brutto-Rente.`,
        calculation: `Steuerpflichtiger Anteil = ${formatCurrency(grossAnnualAmount)} × ${taxablePercentage.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
        result: formatCurrency(taxableAmount),
        backgroundColor: '#fff3e0',
        borderColor: '#ffcc80',
      },
      {
        title: 'Schritt 3: Einkommensteuer auf Rente',
        description: 'Auf den steuerpflichtigen Anteil wird die Einkommensteuer erhoben.',
        calculation: `Einkommensteuer = ${formatCurrency(taxableAmount)} - Grundfreibetrag, dann Steuersatz anwenden`,
        result: formatCurrency(incomeTax),
        backgroundColor: '#ffebee',
        borderColor: '#ef5350',
      },
      {
        title: 'Schritt 4: Netto-Renteneinkommen',
        description: 'Das verfügbare Netto-Einkommen aus der gesetzlichen Rente nach Abzug der Steuern.',
        calculation: `Netto-Rente = ${formatCurrency(grossAnnualAmount)} - ${formatCurrency(incomeTax)}`,
        result: formatCurrency(netAnnualAmount),
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
      },
    ],
    finalResult: {
      title: 'Zusammenfassung der gesetzlichen Rente',
      values: [
        { label: 'Brutto-Rente (jährlich)', value: formatCurrency(grossAnnualAmount) },
        { label: 'Steuerpflichtiger Anteil', value: `${taxablePercentage.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` },
        { label: 'Zu versteuernder Betrag', value: formatCurrency(taxableAmount) },
        { label: 'Einkommensteuer', value: formatCurrency(incomeTax) },
        { label: 'Netto-Rente (jährlich)', value: formatCurrency(netAnnualAmount) },
        { label: 'Netto-Rente (monatlich)', value: formatCurrency(monthlyNetAmount) },
        { label: 'Entlastung des Portfolios', value: formatCurrency(netAnnualAmount) },
      ],
    },
  }
}

// Health care insurance calculation explanation
export function createHealthCareInsuranceExplanation(
  healthInsuranceAnnual: number,
  careInsuranceAnnual: number,
  totalAnnual: number,
  insuranceType: 'statutory' | 'private',
  effectiveHealthInsuranceRate?: number,
  effectiveCareInsuranceRate?: number,
  baseIncomeForCalculation?: number,
  isRetirementPhase?: boolean,
  includesEmployerContribution?: boolean,
  inflationAdjustmentFactor?: number,
  year?: number,
): CalculationExplanation {
  const monthlyHealthInsurance = healthInsuranceAnnual / 12
  const monthlyCareInsurance = careInsuranceAnnual / 12
  const monthlyTotal = totalAnnual / 12

  const title = insuranceType === 'statutory'
    ? '🏥 Gesetzliche Kranken- & Pflegeversicherung - Berechnung'
    : '🏥 Private Kranken- & Pflegeversicherung - Berechnung'

  const phaseText = isRetirementPhase ? 'Rente' : 'vor der Rente'
  const employerText = includesEmployerContribution
    ? 'inklusive Arbeitgeberanteil'
    : 'nur Arbeitnehmeranteil'

  let steps: CalculationStep[] = []
  let introduction = ''

  if (insuranceType === 'statutory') {
    introduction = `Die gesetzliche Kranken- und Pflegeversicherung wird basierend auf dem Einkommen berechnet. In der Phase ${phaseText} gelten besondere Beitragssätze.`

    if (baseIncomeForCalculation && effectiveHealthInsuranceRate && effectiveCareInsuranceRate) {
      steps = [
        {
          title: 'Schritt 1: Beitragsbemessungsgrundlage',
          description: 'Das Einkommen, auf das die Kranken- und Pflegeversicherungsbeiträge berechnet werden.',
          calculation: `Bemessungsgrundlage = ${formatCurrency(baseIncomeForCalculation)}`,
          result: formatCurrency(baseIncomeForCalculation),
          backgroundColor: '#fff3e0',
          borderColor: '#ff9800',
        },
        {
          title: 'Schritt 2: Krankenversicherungsbeitrag',
          description: `Krankenversicherung: ${effectiveHealthInsuranceRate}% ${employerText}`,
          calculation: `Krankenversicherung = ${formatCurrency(baseIncomeForCalculation)} × ${effectiveHealthInsuranceRate}%`,
          result: formatCurrency(healthInsuranceAnnual),
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
        },
        {
          title: 'Schritt 3: Pflegeversicherungsbeitrag',
          description: `Pflegeversicherung: ${effectiveCareInsuranceRate}% ${employerText}`,
          calculation: `Pflegeversicherung = ${formatCurrency(baseIncomeForCalculation)} × ${effectiveCareInsuranceRate}%`,
          result: formatCurrency(careInsuranceAnnual),
          backgroundColor: '#e8f5e8',
          borderColor: '#4caf50',
        },
        {
          title: 'Schritt 4: Gesamtbeitrag',
          description: 'Die Summe aus Kranken- und Pflegeversicherungsbeiträgen.',
          calculation: `Gesamt = ${formatCurrency(healthInsuranceAnnual)} + ${formatCurrency(careInsuranceAnnual)}`,
          result: formatCurrency(totalAnnual),
          backgroundColor: '#fce4ec',
          borderColor: '#e91e63',
        },
      ]
    }
  }
  else {
    introduction = `Die private Kranken- und Pflegeversicherung basiert auf festen monatlichen Beiträgen${inflationAdjustmentFactor ? ' mit jährlicher Anpassung' : ''}.`

    steps = [
      {
        title: 'Schritt 1: Krankenversicherung (privat)',
        description: 'Der monatliche Beitrag zur privaten Krankenversicherung.',
        calculation: `Krankenversicherung = ${formatCurrency(monthlyHealthInsurance)} × 12 Monate`,
        result: formatCurrency(healthInsuranceAnnual),
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
      },
      {
        title: 'Schritt 2: Pflegeversicherung (privat)',
        description: 'Der monatliche Beitrag zur privaten Pflegeversicherung.',
        calculation: `Pflegeversicherung = ${formatCurrency(monthlyCareInsurance)} × 12 Monate`,
        result: formatCurrency(careInsuranceAnnual),
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
      },
    ]

    if (inflationAdjustmentFactor && inflationAdjustmentFactor > 1) {
      const inflationRate = ((inflationAdjustmentFactor - 1) * 100)
      steps.unshift({
        title: 'Schritt 1: Inflationsanpassung',
        description: `Die Beiträge werden jährlich um ${inflationRate.toFixed(1)}% angepasst.`,
        calculation: `Anpassungsfaktor = ${(inflationAdjustmentFactor * 100).toFixed(1)}%`,
        result: `+${inflationRate.toFixed(1)}%`,
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
      })
    }

    steps.push({
      title: `Schritt ${steps.length + 1}: Gesamtbeitrag`,
      description: 'Die Summe aus Kranken- und Pflegeversicherungsbeiträgen.',
      calculation: `Gesamt = ${formatCurrency(healthInsuranceAnnual)} + ${formatCurrency(careInsuranceAnnual)}`,
      result: formatCurrency(totalAnnual),
      backgroundColor: '#fce4ec',
      borderColor: '#e91e63',
    })
  }

  return {
    title,
    introduction,
    steps,
    finalResult: {
      title: 'Zusammenfassung der Kranken- & Pflegeversicherung',
      values: [
        { label: 'Versicherungsart', value: insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat' },
        { label: 'Krankenversicherung (jährlich)', value: formatCurrency(healthInsuranceAnnual) },
        { label: 'Pflegeversicherung (jährlich)', value: formatCurrency(careInsuranceAnnual) },
        { label: 'Gesamtbeitrag (jährlich)', value: formatCurrency(totalAnnual) },
        { label: 'Gesamtbeitrag (monatlich)', value: formatCurrency(monthlyTotal) },
        { label: 'Steuerliche Behandlung', value: 'Vollständig absetzbar' },
        ...(year ? [{ label: 'Jahr', value: year.toString() }] : []),
      ],
    },
  }
}
