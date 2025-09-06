import type { SimulationContextState } from '../contexts/SimulationContext';

/**
 * Formats all simulation parameters into a human-readable German text format
 * for export to clipboard to help with development and bug reporting.
 */
export function formatParametersForExport(context: SimulationContextState): string {
  const lines: string[] = [];
  
  // Basic financial parameters
  lines.push(`Rendite: ${context.rendite.toFixed(2)} %`);
  lines.push(`Kapitalertragsteuer: ${context.steuerlast.toFixed(2)} %`);
  lines.push(`Teilfreistellungsquote: ${context.teilfreistellungsquote.toFixed(2)} %`);
  
  // Tax phase settings
  lines.push(`Steuerreduzierung Sparphase: ${context.steuerReduzierenEndkapitalSparphase ? 'Ja' : 'Nein'}`);
  lines.push(`Steuerreduzierung Entnahmephase: ${context.steuerReduzierenEndkapitalEntspharphase ? 'Ja' : 'Nein'}`);
  
  // Time range
  lines.push(`Zeitraum: ${context.startEnd[0]} - ${context.startEnd[1]}`);
  
  // Simulation mode
  lines.push(`Simulationsmodus: ${context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'}`);
  
  // Return configuration
  lines.push(`Rendite-Modus: ${getReturnModeLabel(context.returnMode)}`);
  
  if (context.returnMode === 'random') {
    lines.push(`Durchschnittsrendite: ${context.averageReturn.toFixed(2)} %`);
    lines.push(`Standardabweichung: ${context.standardDeviation.toFixed(2)} %`);
    if (context.randomSeed !== undefined) {
      lines.push(`Zufallsseed: ${context.randomSeed}`);
    }
  }
  
  // Variable returns (if any)
  const variableReturnsEntries = Object.entries(context.variableReturns);
  if (variableReturnsEntries.length > 0) {
    lines.push(`Variable Renditen:`);
    variableReturnsEntries
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, returnRate]) => {
        lines.push(`  ${year}: ${returnRate.toFixed(2)} %`);
      });
  }
  
  // Tax allowances per year
  const freibetragEntries = Object.entries(context.freibetragPerYear);
  if (freibetragEntries.length > 0) {
    lines.push(`Freibeträge pro Jahr:`);
    freibetragEntries
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, amount]) => {
        lines.push(`  ${year}: ${formatCurrency(amount)}`);
      });
  }
  
  // Savings plans
  if (context.sparplan.length > 0) {
    lines.push(`Sparpläne:`);
    context.sparplan.forEach((plan, index) => {
      lines.push(`  Sparplan ${index + 1}:`);
      lines.push(`    Betrag: ${formatCurrency(plan.einzahlung)}`);
      lines.push(`    Start: ${plan.start}`);
      lines.push(`    Ende: ${plan.end || 'Unbegrenzt'}`);
      if (plan.ter !== undefined) {
        lines.push(`    TER: ${plan.ter.toFixed(2)} %`);
      }
      if (plan.transactionCostPercent !== undefined) {
        lines.push(`    Transaktionskosten: ${plan.transactionCostPercent.toFixed(2)} %`);
      }
      if (plan.transactionCostAbsolute !== undefined) {
        lines.push(`    Absolute Transaktionskosten: ${formatCurrency(plan.transactionCostAbsolute)}`);
      }
    });
  }
  
  // Withdrawal configuration (if available)
  if (context.withdrawalConfig) {
    lines.push(`Entnahme-Konfiguration:`);
    const wc = context.withdrawalConfig;
    
    if (wc.formValue) {
      lines.push(`  Lebensende: ${wc.formValue.endOfLife}`);
      lines.push(`  Strategie: ${getWithdrawalStrategyLabel(wc.formValue.strategie)}`);
      lines.push(`  Entnahme-Rendite: ${wc.formValue.rendite.toFixed(2)} %`);
      lines.push(`  Entnahme-Häufigkeit: ${wc.formValue.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'}`);
      
      if (wc.formValue.inflationAktiv) {
        lines.push(`  Inflation aktiv: Ja (${wc.formValue.inflationsrate.toFixed(2)} %)`);
      } else {
        lines.push(`  Inflation aktiv: Nein`);
      }
      
      if (wc.formValue.strategie === 'monatlich_fest' && wc.formValue.monatlicheBetrag) {
        lines.push(`  Monatlicher Betrag: ${formatCurrency(wc.formValue.monatlicheBetrag)}`);
        if (wc.formValue.guardrailsAktiv) {
          lines.push(`  Guardrails aktiv: Ja (${wc.formValue.guardrailsSchwelle.toFixed(1)} %)`);
        }
      }
      
      if (wc.formValue.strategie === 'variabel_prozent' && wc.formValue.variabelProzent) {
        lines.push(`  Variabler Prozentsatz: ${wc.formValue.variabelProzent.toFixed(2)} %`);
      }
      
      if (wc.formValue.grundfreibetragAktiv) {
        lines.push(`  Grundfreibetrag aktiv: Ja`);
        lines.push(`  Grundfreibetrag: ${formatCurrency(wc.formValue.grundfreibetragBetrag)}`);
        lines.push(`  Einkommensteuersatz: ${wc.formValue.einkommensteuersatz.toFixed(2)} %`);
      }
    }
  }
  
  return lines.join('\n');
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
 * Helper function to get German label for return mode
 */
function getReturnModeLabel(mode: string): string {
  switch (mode) {
    case 'fixed':
      return 'Fest';
    case 'random':
      return 'Zufällig';
    case 'variable':
      return 'Variabel';
    default:
      return mode;
  }
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
      return 'Dynamische Entnahme';
    default:
      return strategy;
  }
}

/**
 * Copies the formatted parameters to clipboard
 * Returns a promise that resolves to true if successful, false otherwise
 */
export async function copyParametersToClipboard(context: SimulationContextState): Promise<boolean> {
  try {
    const formattedText = formatParametersForExport(context);
    await navigator.clipboard.writeText(formattedText);
    return true;
  } catch (error) {
    console.error('Failed to copy parameters to clipboard:', error);
    return false;
  }
}