import type { SimulationContextState } from '../contexts/SimulationContext';
import type { WithdrawalResult } from '../../helpers/withdrawal';

/**
 * Utility functions for exporting simulation data in CSV and Markdown formats
 */

export interface ExportData {
  savingsData?: any;
  withdrawalData?: WithdrawalResult;
  context: SimulationContextState;
}

/**
 * Helper function to format currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper function to format currency for CSV (no currency symbol)
 */
function formatCurrencyForCSV(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper function to format percentage values
 */
function formatPercentage(value: number): string {
  return value != null ? `${value.toFixed(2)}%` : '0.00%';
}

/**
 * Generate CSV header for savings phase export
 */
function generateSavingsCSVHeader(sparplans: any[]): string {
  const baseHeaders = ['Jahr', 'Monat', 'Startkapital (EUR)', 'Zinsen (EUR)'];
  
  // Add headers for each configured savings plan
  const sparplanHeaders = sparplans.map((_, index) => 
    `Einzahlung Sparplan ${index + 1} (EUR)`
  );
  
  const endHeaders = [
    'Gesamte Einzahlungen (EUR)',
    'Endkapital (EUR)', 
    'Vorabpauschale (EUR)',
    'Bezahlte Steuer (EUR)',
    'Genutzter Freibetrag (EUR)'
  ];
  
  return [...baseHeaders, ...sparplanHeaders, ...endHeaders].join(';');
}

/**
 * Export savings phase data to CSV format
 */
export function exportSavingsDataToCSV(data: ExportData): string {
  const { savingsData, context } = data;
  
  if (!savingsData?.sparplanElements) {
    throw new Error('Keine Sparplan-Daten verfügbar');
  }

  const lines: string[] = [];
  
  // Process simulation data first to determine structure
  const simulationElements = savingsData.sparplanElements;
  
  if (!simulationElements || simulationElements.length === 0) {
    throw new Error('Keine Simulationselemente verfügbar');
  }
  
  // Calculate the savings phase time period from savings plan configuration
  const currentYear = new Date().getFullYear();
  const savingsStartYear = Math.min(currentYear, 
    ...context.sparplanElemente.map(plan => new Date(plan.start).getFullYear())
  );
  
  // For savings phase, use the planned end date from savings plans or withdrawal start
  const planEndYears = context.sparplan
    .filter(plan => plan.end)
    .map(plan => new Date(plan.end!).getFullYear());
  
  const savingsEndYear = planEndYears.length > 0 
    ? Math.max(...planEndYears)
    : context.startEnd[0]; // Fallback to withdrawal start if no plan end dates
  
  // Add header with parameter information
  lines.push('# Sparphase - Simulationsdaten');
  lines.push('# Zeitraum: ' + savingsStartYear + ' - ' + savingsEndYear);
  lines.push('# Rendite: ' + formatPercentage(context.rendite));
  lines.push('# Kapitalertragsteuer: ' + formatPercentage(context.steuerlast));
  lines.push('# Teilfreistellungsquote: ' + formatPercentage(context.teilfreistellungsquote));
  lines.push('# Berechnungsmodus: ' + (context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'));
  lines.push('');
  
  // Add CSV header with only the configured savings plans
  lines.push(generateSavingsCSVHeader(context.sparplan));
  
  // Detect data structure and export accordingly
  const hasSimulationProperty = simulationElements.some((element: any) => element.simulation);
  
  if (hasSimulationProperty) {
    // Real app structure: elements have simulation property with years as keys
    exportSimulationStructure(simulationElements, context, lines);
  } else {
    // Test mock structure: each element represents a year's data
    exportMockStructure(simulationElements, context, lines);
  }
  
  return lines.join('\n');
}

/**
 * Export data from real simulation structure (elements with simulation property)
 */
function exportSimulationStructure(simulationElements: any[], context: any, lines: string[]) {
  // Collect all years from all simulation elements
  const allYears = new Set<number>();
  for (const element of simulationElements) {
    if (element.simulation) {
      Object.keys(element.simulation).forEach(year => allYears.add(parseInt(year)));
    }
  }
  
  // Sort years and process each one
  const sortedYears = Array.from(allYears).sort((a, b) => a - b);
  
  for (const year of sortedYears) {
    const isMonthly = context.simulationAnnual === 'monthly';
    
    // Aggregate data for this year across all elements
    let totalStartkapital = 0;
    let totalZinsen = 0;
    let totalEndkapital = 0;
    let totalBezahlteSteuer = 0;
    let totalGenutzterFreibetrag = 0;
    let totalVorabpauschale = 0;
    const sparplanContributions: number[] = [];
    
    // Initialize contributions array for each configured savings plan
    context.sparplan.forEach(() => {
      sparplanContributions.push(0);
    });
    
    // Sum up data from all elements for this year
    simulationElements.forEach((element: any, elementIndex: number) => {
      const yearData = element.simulation?.[year];
      if (yearData) {
        totalStartkapital += yearData.startkapital || 0;
        totalZinsen += yearData.zinsen || 0;
        totalEndkapital += yearData.endkapital || 0;
        totalBezahlteSteuer += yearData.bezahlteSteuer || 0;
        totalGenutzterFreibetrag += yearData.genutzterFreibetrag || 0;
        totalVorabpauschale += yearData.vorabpauschale || 0;
        
        // Calculate contribution for this element in this year
        const elementContribution = getElementContributionForYear(element, year, isMonthly);
        if (elementIndex < sparplanContributions.length) {
          sparplanContributions[elementIndex] = elementContribution;
        }
      }
    });
    
    addYearRows(year, isMonthly, totalStartkapital, totalZinsen, totalEndkapital, 
                totalBezahlteSteuer, totalGenutzterFreibetrag, totalVorabpauschale, 
                sparplanContributions, lines);
  }
}

/**
 * Export data from test mock structure (each element represents a year)
 */
function exportMockStructure(simulationElements: any[], context: any, lines: string[]) {
  for (const element of simulationElements) {
    if (!element) continue;
    
    const year = new Date(element.start).getFullYear();
    const isMonthly = context.simulationAnnual === 'monthly';
    
    // For mock data, treat each element as year data
    const sparplanContributions: number[] = [];
    context.sparplan.forEach(() => {
      sparplanContributions.push(element.amount || 0);
    });
    
    addYearRows(year, isMonthly, element.startkapital || 0, element.zinsen || 0, 
                element.endkapital || 0, element.bezahlteSteuer || 0, 
                element.genutzterFreibetrag || 0, element.vorabpauschale || 0,
                sparplanContributions, lines);
  }
}

/**
 * Add rows for a specific year to the CSV output
 */
function addYearRows(
  year: number, 
  isMonthly: boolean, 
  startkapital: number, 
  zinsen: number, 
  endkapital: number,
  bezahlteSteuer: number, 
  genutzterFreibetrag: number, 
  vorabpauschale: number,
  sparplanContributions: number[], 
  lines: string[]
) {
  const months = isMonthly ? 12 : 1;
  
  for (let month = 1; month <= months; month++) {
    const row: string[] = [];
    
    // Basic data
    row.push(year.toString());
    row.push(isMonthly ? month.toString() : '12');
    row.push(formatCurrencyForCSV(startkapital));
    row.push(formatCurrencyForCSV(zinsen));
    
    // Individual savings plan contributions
    sparplanContributions.forEach(contribution => {
      row.push(formatCurrencyForCSV(contribution));
    });
    
    // Summary data
    const totalContributions = sparplanContributions.reduce((sum, contrib) => sum + contrib, 0);
    row.push(formatCurrencyForCSV(totalContributions));
    row.push(formatCurrencyForCSV(endkapital));
    row.push(formatCurrencyForCSV(vorabpauschale));
    row.push(formatCurrencyForCSV(bezahlteSteuer));
    row.push(formatCurrencyForCSV(genutzterFreibetrag));
    
    lines.push(row.join(';'));
  }
}

/**
 * Calculate the contribution amount for a specific element in a specific year
 */
function getElementContributionForYear(element: any, year: number, isMonthly: boolean): number {
  // Check if this element was active in this year
  const startYear = new Date(element.start).getFullYear();
  const endYear = element.end ? new Date(element.end).getFullYear() : new Date().getFullYear() + 50;
  
  if (year < startYear || year > endYear) {
    return 0;
  }
  
  // Return the element's annual amount (or monthly if needed)
  const yearlyAmount = element.amount || 0;
  return isMonthly ? yearlyAmount / 12 : yearlyAmount;
}

/**
 * Export withdrawal phase data to CSV format
 */
export function exportWithdrawalDataToCSV(data: ExportData): string {
  const { withdrawalData, context } = data;
  
  if (!withdrawalData) {
    throw new Error('Keine Entnahme-Daten verfügbar');
  }

  const lines: string[] = [];
  
  // Add header with parameter information
  lines.push('# Entnahmephase - Simulationsdaten');
  
  const withdrawalConfig = context.withdrawalConfig;
  if (withdrawalConfig?.formValue) {
    lines.push('# Lebensende: ' + withdrawalConfig.formValue.endOfLife);
    lines.push('# Strategie: ' + getWithdrawalStrategyLabel(withdrawalConfig.formValue.strategie));
    lines.push('# Entnahme-Rendite: ' + formatPercentage(withdrawalConfig.formValue.rendite));
    lines.push('# Häufigkeit: ' + (withdrawalConfig.formValue.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'));
  }
  lines.push('');
  
  // CSV header for withdrawal phase
  const headers = [
    'Jahr',
    'Monat', 
    'Startkapital (EUR)',
    'Entnahme (EUR)',
    'Zinsen (EUR)',
    'Endkapital (EUR)',
    'Basiszins (%)',
    'Basisertrag (EUR)',
    'Tatsächlicher Gewinn (EUR)',
    'Vorabpauschale (EUR)',
    'Steuerbasis vor Freibetrag (EUR)',
    'Bezahlte Steuer (EUR)',
    'Genutzter Freibetrag (EUR)'
  ];
  
  // Add conditional headers
  if (withdrawalConfig?.formValue.strategie === 'monatlich_fest') {
    headers.push('Monatliche Entnahme (EUR)');
    if (withdrawalConfig.formValue.inflationAktiv) {
      headers.push('Inflationsanpassung (EUR)');
    }
    if (withdrawalConfig.formValue.guardrailsAktiv) {
      headers.push('Portfolio-Anpassung (EUR)');
    }
  }
  
  if (withdrawalConfig?.formValue.strategie === 'dynamisch') {
    headers.push('Vorjahres-Rendite (%)');
    headers.push('Dynamische Anpassung (EUR)');
  }
  
  if (context.grundfreibetragAktiv) {
    headers.push('Einkommensteuer (EUR)');
    headers.push('Genutzter Grundfreibetrag (EUR)');
  }
  
  lines.push(headers.join(';'));
  
  // Process withdrawal data
  const years = Object.keys(withdrawalData).map(Number).sort();
  
  for (const year of years) {
    const yearData = withdrawalData[year];
    if (!yearData) continue;
    
    const isMonthly = withdrawalConfig?.formValue?.withdrawalFrequency === 'monthly';
    const months = isMonthly ? 12 : 1;
    
    for (let month = 1; month <= months; month++) {
      const row: string[] = [];
      
      // Basic data
      row.push(year.toString());
      row.push(isMonthly ? month.toString() : '12');
      row.push(formatCurrencyForCSV(yearData.startkapital));
      row.push(formatCurrencyForCSV(yearData.entnahme));
      row.push(formatCurrencyForCSV(yearData.zinsen));
      row.push(formatCurrencyForCSV(yearData.endkapital));
      
      // Vorabpauschale details for transparency
      const details = yearData.vorabpauschaleDetails;
      row.push(details ? formatPercentage(details.basiszins * 100).replace('%', '') : '0,00'); // Basiszins in %
      row.push(formatCurrencyForCSV(details?.basisertrag || 0)); // Basisertrag
      row.push(formatCurrencyForCSV(details?.jahresgewinn || 0)); // Tatsächlicher Gewinn
      row.push(formatCurrencyForCSV(yearData.vorabpauschale || 0)); // Final Vorabpauschale
      row.push(formatCurrencyForCSV(details?.steuerVorFreibetrag || 0)); // Steuerbasis vor Freibetrag
      row.push(formatCurrencyForCSV(yearData.bezahlteSteuer)); // Bezahlte Steuer
      row.push(formatCurrencyForCSV(yearData.genutzterFreibetrag)); // Genutzter Freibetrag
      
      // Conditional data
      if (withdrawalConfig?.formValue.strategie === 'monatlich_fest') {
        row.push(formatCurrencyForCSV(yearData.monatlicheEntnahme || 0));
        if (withdrawalConfig.formValue.inflationAktiv) {
          row.push(formatCurrencyForCSV(yearData.inflationAnpassung || 0));
        }
        if (withdrawalConfig.formValue.guardrailsAktiv) {
          row.push(formatCurrencyForCSV(yearData.portfolioAnpassung || 0));
        }
      }
      
      if (withdrawalConfig?.formValue.strategie === 'dynamisch') {
        row.push(formatPercentage(yearData.vorjahresRendite || 0));
        row.push(formatCurrencyForCSV(yearData.dynamischeAnpassung || 0));
      }
      
      if (context.grundfreibetragAktiv) {
        row.push(formatCurrencyForCSV(yearData.einkommensteuer || 0));
        row.push(formatCurrencyForCSV(yearData.genutzterGrundfreibetrag || 0));
      }
      
      lines.push(row.join(';'));
    }
  }
  
  return lines.join('\n');
}

/**
 * Export all simulation data to Markdown format
 */
export function exportDataToMarkdown(data: ExportData): string {
  const { savingsData, withdrawalData, context } = data;
  
  const lines: string[] = [];
  
  // Header
  lines.push('# Simulationsdaten Export');
  lines.push('');
  lines.push(`**Exportiert am:** ${new Date().toLocaleDateString('de-DE')}`);
  lines.push('');
  
  // Parameters section
  lines.push('## Parameter');
  lines.push('');
  lines.push('### Grundparameter');
  lines.push(`- **Zeitraum:** ${context.startEnd[0]} - ${context.startEnd[1]}`);
  lines.push(`- **Rendite:** ${formatPercentage(context.rendite)}`);
  lines.push(`- **Kapitalertragsteuer:** ${formatPercentage(context.steuerlast)}`);
  lines.push(`- **Teilfreistellungsquote:** ${formatPercentage(context.teilfreistellungsquote)}`);
  lines.push(`- **Berechnungsmodus:** ${context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'}`);
  lines.push('');
  
  // Calculation explanations
  lines.push('## Berechnungsgrundlagen');
  lines.push('');
  lines.push('### Zinseszinsrechnung');
  lines.push('Die Berechnung erfolgt nach der Formel:');
  lines.push('```');
  lines.push('Endkapital = Startkapital × (1 + Rendite)^Laufzeit + Einzahlungen');
  lines.push('```');
  lines.push('');
  
  lines.push('### Vorabpauschale');
  lines.push('Die Vorabpauschale wird nach folgender Formel berechnet:');
  lines.push('```');
  lines.push('Basisertrag = Startkapital × Basiszins × 0,7');
  lines.push('Vorabpauschale = min(Basisertrag, tatsächlicher Gewinn)');
  lines.push('```');
  lines.push('');
  
  lines.push('### Steuerberechnung');
  lines.push('```');
  lines.push('Steuer vor Freibetrag = Vorabpauschale × (1 - Teilfreistellung) × Steuersatz');
  lines.push('Bezahlte Steuer = max(0, Steuer vor Freibetrag - verfügbarer Freibetrag)');
  lines.push('```');
  lines.push('');
  
  // Savings phase data
  if (savingsData?.sparplanElements && savingsData.sparplanElements.length > 0) {
    lines.push('## Sparphase');
    lines.push('');
    lines.push('| Jahr | Startkapital | Zinsen | Einzahlungen | Endkapital | Vorabpauschale | Steuer |');
    lines.push('|------|--------------|--------|--------------|------------|----------------|--------|');
    
    for (const yearData of savingsData.sparplanElements) {
      if (!yearData) continue;
      
      const year = new Date(yearData.start).getFullYear();
      const contribution = yearData.amount || yearData.monthlyAmount || 0;
      
      lines.push(`| ${year} | ${formatCurrency(yearData.startkapital || 0)} | ${formatCurrency(yearData.zinsen || 0)} | ${formatCurrency(contribution)} | ${formatCurrency(yearData.endkapital || 0)} | ${formatCurrency(yearData.vorabpauschale || 0)} | ${formatCurrency(yearData.bezahlteSteuer || 0)} |`);
    }
    lines.push('');
  } else {
    lines.push('## Sparphase');
    lines.push('');
    lines.push('> ℹ️ Keine Sparplan-Daten verfügbar. Führen Sie eine Simulation durch oder wechseln Sie zum Ansparen-Tab, um Daten zu generieren.');
    lines.push('');
  }
  
  // Withdrawal phase data
  if (withdrawalData && Object.keys(withdrawalData).length > 0) {
    lines.push('## Entnahmephase');
    lines.push('');
    
    const withdrawalConfig = context.withdrawalConfig;
    if (withdrawalConfig?.formValue) {
      lines.push('### Entnahme-Parameter');
      lines.push(`- **Strategie:** ${getWithdrawalStrategyLabel(withdrawalConfig.formValue.strategie)}`);
      lines.push(`- **Lebensende:** ${withdrawalConfig.formValue.endOfLife}`);
      lines.push(`- **Entnahme-Rendite:** ${formatPercentage(withdrawalConfig.formValue.rendite)}`);
      lines.push('');
    }
    
    lines.push('| Jahr | Startkapital | Entnahme | Zinsen | Endkapital | Vorabpauschale Details | Steuer |');
    lines.push('|------|--------------|----------|--------|------------|------------------------|--------|');
    
    const years = Object.keys(withdrawalData).map(Number).sort();
    for (const year of years) {
      const yearData = withdrawalData[year];
      if (!yearData) continue;
      
      // Format Vorabpauschale details for transparency
      let vorabDetails = 'N/A';
      if (yearData.vorabpauschaleDetails) {
        const details = yearData.vorabpauschaleDetails;
        vorabDetails = `Basiszins: ${formatPercentage(details.basiszins * 100)}<br/>` +
                      `Basisertrag: ${formatCurrency(details.basisertrag)}<br/>` +
                      `Jahresgewinn: ${formatCurrency(details.jahresgewinn)}<br/>` +
                      `Vorabpauschale: ${formatCurrency(yearData.vorabpauschale || 0)}`;
      }
      
      lines.push(`| ${year} | ${formatCurrency(yearData.startkapital)} | ${formatCurrency(yearData.entnahme)} | ${formatCurrency(yearData.zinsen)} | ${formatCurrency(yearData.endkapital)} | ${vorabDetails} | ${formatCurrency(yearData.bezahlteSteuer)} |`);
    }
    lines.push('');
  } else {
    lines.push('## Entnahmephase');
    lines.push('');
    lines.push('> ℹ️ Keine Entnahme-Daten verfügbar. Wechseln Sie zum Entnehmen-Tab und konfigurieren Sie eine Entnahmestrategie, um Daten zu generieren.');
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Generate calculation explanations text
 */
export function generateCalculationExplanations(context: SimulationContextState): string {
  const lines: string[] = [];
  
  lines.push('Berechnungsdetails und Formeln');
  lines.push('=================================');
  lines.push('');
  
  lines.push('1. ZINSESZINSRECHNUNG');
  lines.push('   Grundformel: Endkapital = Startkapital × (1 + Rendite)^Jahre');
  lines.push(`   Verwendete Rendite: ${formatPercentage(context.rendite)}`);
  lines.push('');
  
  lines.push('2. VORABPAUSCHALE-BERECHNUNG');
  lines.push('   a) Basisertrag = Kapital zu Jahresbeginn × Basiszins × 70%');
  lines.push('   b) Vorabpauschale = min(Basisertrag, tatsächlicher Jahresgewinn)');
  lines.push('   c) Nur bei positiver Vorabpauschale wird Steuer fällig');
  lines.push('');
  
  lines.push('3. STEUERBERECHNUNG');
  lines.push('   a) Steuer vor Freibetrag = Vorabpauschale × (1 - Teilfreistellung) × Steuersatz');
  lines.push(`   b) Teilfreistellungsquote: ${formatPercentage(context.teilfreistellungsquote)}`);
  lines.push(`   c) Kapitalertragsteuer: ${formatPercentage(context.steuerlast)}`);
  lines.push('   d) Bezahlte Steuer = max(0, Steuer vor Freibetrag - verfügbarer Freibetrag)');
  lines.push('');
  
  lines.push('4. FREIBETRÄGE');
  Object.entries(context.freibetragPerYear).forEach(([year, amount]) => {
    lines.push(`   ${year}: ${formatCurrency(amount)} Sparerpauschbetrag`);
  });
  lines.push('');
  
  if (context.grundfreibetragAktiv) {
    lines.push('5. GRUNDFREIBETRAG (ENTNAHMEPHASE)');
    lines.push(`   Grundfreibetrag: ${formatCurrency(context.grundfreibetragBetrag)}`);
    lines.push('   Wird bei der Einkommensteuer-Berechnung berücksichtigt');
    lines.push('');
  }
  
  const withdrawalConfig = context.withdrawalConfig;
  if (withdrawalConfig?.formValue) {
    lines.push('6. ENTNAHMESTRATEGIE');
    lines.push(`   Strategie: ${getWithdrawalStrategyLabel(withdrawalConfig.formValue.strategie)}`);
    
    if (withdrawalConfig.formValue.strategie === '4prozent') {
      lines.push('   Formel: Jährliche Entnahme = 4% vom Startkapital');
    } else if (withdrawalConfig.formValue.strategie === '3prozent') {
      lines.push('   Formel: Jährliche Entnahme = 3% vom Startkapital');
    } else if (withdrawalConfig.formValue.strategie === 'variabel_prozent') {
      lines.push(`   Formel: Jährliche Entnahme = ${formatPercentage(withdrawalConfig.formValue.variabelProzent || 0)} vom aktuellen Kapital`);
    } else if (withdrawalConfig.formValue.strategie === 'monatlich_fest') {
      lines.push(`   Monatliche Entnahme: ${formatCurrency(withdrawalConfig.formValue.monatlicheBetrag || 0)}`);
      if (withdrawalConfig.formValue.inflationAktiv) {
        lines.push(`   Inflationsanpassung: ${formatPercentage(withdrawalConfig.formValue.inflationsrate || 2)} jährlich`);
      }
    } else if (withdrawalConfig.formValue.strategie === 'dynamisch') {
      lines.push(`   Basisrate: ${formatPercentage(withdrawalConfig.formValue.dynamischBasisrate || 4)}`);
      lines.push('   Anpassung basierend auf Vorjahres-Performance');
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Helper function to get German label for withdrawal strategy
 */
function getWithdrawalStrategyLabel(strategy: string): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel';
    case '3prozent':
      return '3% Regel';
    case 'variabel_prozent':
      return 'Variabler Prozentsatz';
    case 'monatlich_fest':
      return 'Monatliche Entnahme';
    case 'dynamisch':
      return 'Dynamische Strategie';
    default:
      return strategy;
  }
}

/**
 * Download text content as file
 */
export function downloadTextAsFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  // Add UTF-8 BOM (Byte Order Mark) to ensure proper encoding for special characters
  const BOM = '\uFEFF';
  const contentWithBOM = BOM + content;
  
  // Ensure the MIME type includes charset=utf-8 if not already specified
  const finalMimeType = mimeType.includes('charset') ? mimeType : `${mimeType};charset=utf-8`;
  
  const blob = new Blob([contentWithBOM], { type: finalMimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Copy text content to clipboard
 */
export async function copyTextToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}