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
  
  // Inflation settings for savings phase
  lines.push(`Inflation Sparphase: ${context.inflationAktivSparphase ? 'Ja' : 'Nein'}`);
  if (context.inflationAktivSparphase) {
    lines.push(`Inflationsrate Sparphase: ${context.inflationsrateSparphase.toFixed(2)} %`);
  }
  
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
  
  // Withdrawal configuration (always show, with defaults if not configured)
  lines.push(`Entnahme-Konfiguration:`);
  
  if (context.withdrawalConfig && context.withdrawalConfig.formValue) {
    const wc = context.withdrawalConfig;
    const fv = wc.formValue;
    
    lines.push(`  Lebensende: ${fv.endOfLife}`);
    lines.push(`  Strategie: ${getWithdrawalStrategyLabel(fv.strategie)}`);
    lines.push(`  Entnahme-Rendite: ${fv.rendite.toFixed(2)} %`);
    lines.push(`  Entnahme-Häufigkeit: ${fv.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'}`);
    
    if (fv.inflationAktiv) {
      lines.push(`  Inflation aktiv: Ja (${fv.inflationsrate.toFixed(2)} %)`);
    } else {
      lines.push(`  Inflation aktiv: Nein`);
    }
    
    if (fv.strategie === 'monatlich_fest') {
      lines.push(`  Monatlicher Betrag: ${formatCurrency(fv.monatlicheBetrag)}`);
      if (fv.guardrailsAktiv) {
        lines.push(`  Guardrails aktiv: Ja (${fv.guardrailsSchwelle.toFixed(1)} %)`);
      } else {
        lines.push(`  Guardrails aktiv: Nein`);
      }
    }
    
    if (fv.strategie === 'variabel_prozent') {
      lines.push(`  Variabler Prozentsatz: ${fv.variabelProzent.toFixed(2)} %`);
    }
    
    if (fv.strategie === 'dynamisch') {
      lines.push(`  Dynamische Basisrate: ${fv.dynamischBasisrate.toFixed(2)} %`);
      lines.push(`  Obere Schwelle: ${fv.dynamischObereSchwell.toFixed(2)} %`);
      lines.push(`  Obere Anpassung: ${fv.dynamischObereAnpassung.toFixed(2)} %`);
      lines.push(`  Untere Schwelle: ${fv.dynamischUntereSchwell.toFixed(2)} %`);
      lines.push(`  Untere Anpassung: ${fv.dynamischUntereAnpassung.toFixed(2)} %`);
    }
    
    if (fv.grundfreibetragAktiv && fv.grundfreibetragBetrag !== undefined) {
      lines.push(`  Grundfreibetrag aktiv: Ja`);
      lines.push(`  Grundfreibetrag: ${formatCurrency(fv.grundfreibetragBetrag)}`);
      lines.push(`  Einkommensteuersatz: ${fv.einkommensteuersatz.toFixed(2)} %`);
    } else {
      lines.push(`  Grundfreibetrag aktiv: Nein`);
    }
    
    // Additional withdrawal configuration details
    lines.push(`  Entnahme-Rendite-Modus: ${getReturnModeLabel(wc.withdrawalReturnMode)}`);
    if (wc.withdrawalReturnMode === 'random') {
      lines.push(`  Entnahme-Durchschnittsrendite: ${wc.withdrawalAverageReturn.toFixed(2)} %`);
      lines.push(`  Entnahme-Standardabweichung: ${wc.withdrawalStandardDeviation.toFixed(2)} %`);
    }
    
    if (wc.useSegmentedWithdrawal) {
      lines.push(`  Segmentierte Entnahme: Ja`);
      lines.push(`  Anzahl Segmente: ${wc.withdrawalSegments.length}`);
      
      // Export detailed segment configuration
      if (wc.withdrawalSegments.length > 0) {
        lines.push(`  Segment-Details:`);
        wc.withdrawalSegments.forEach((segment, index) => {
          lines.push(`    Segment ${index + 1} (${segment.name}):`);
          lines.push(`      Zeitraum: ${segment.startYear} - ${segment.endYear}`);
          lines.push(`      Strategie: ${getWithdrawalStrategyLabel(segment.strategy)}`);
          lines.push(`      Häufigkeit: ${segment.withdrawalFrequency === 'yearly' ? 'Jährlich' : 'Monatlich'}`);
          
          // Return configuration
          lines.push(`      Rendite-Modus: ${getReturnModeLabel(segment.returnConfig.mode)}`);
          if (segment.returnConfig.mode === 'fixed' && segment.returnConfig.fixedRate !== undefined) {
            lines.push(`      Rendite: ${(segment.returnConfig.fixedRate * 100).toFixed(2)} %`);
          } else if (segment.returnConfig.mode === 'random' && segment.returnConfig.randomConfig) {
            lines.push(`      Durchschnittsrendite: ${(segment.returnConfig.randomConfig.averageReturn * 100).toFixed(2)} %`);
            if (segment.returnConfig.randomConfig.standardDeviation !== undefined) {
              lines.push(`      Standardabweichung: ${(segment.returnConfig.randomConfig.standardDeviation * 100).toFixed(2)} %`);
            }
          }
          
          // Strategy-specific parameters
          if (segment.strategy === 'variabel_prozent' && segment.customPercentage !== undefined) {
            lines.push(`      Variabler Prozentsatz: ${segment.customPercentage.toFixed(2)} %`);
          }
          
          if (segment.strategy === 'monatlich_fest' && segment.monthlyConfig) {
            lines.push(`      Monatlicher Betrag: ${formatCurrency(segment.monthlyConfig.monthlyAmount)}`);
            if (segment.monthlyConfig.enableGuardrails) {
              lines.push(`      Guardrails: ${segment.monthlyConfig.guardrailsThreshold?.toFixed(1) || 'N/A'} %`);
            }
          }
          
          if (segment.strategy === 'dynamisch' && segment.dynamicConfig) {
            lines.push(`      Dynamische Basisrate: ${segment.dynamicConfig.baseWithdrawalRate.toFixed(2)} %`);
            lines.push(`      Obere Schwelle: ${segment.dynamicConfig.upperThresholdReturn.toFixed(2)} %`);
            lines.push(`      Obere Anpassung: ${segment.dynamicConfig.upperThresholdAdjustment.toFixed(2)} %`);
            lines.push(`      Untere Schwelle: ${segment.dynamicConfig.lowerThresholdReturn.toFixed(2)} %`);
            lines.push(`      Untere Anpassung: ${segment.dynamicConfig.lowerThresholdAdjustment.toFixed(2)} %`);
          }
          
          // Inflation configuration
          if (segment.inflationConfig && segment.inflationConfig.inflationRate !== undefined) {
            lines.push(`      Inflation: ${(segment.inflationConfig.inflationRate * 100).toFixed(2)} %`);
          }
          
          // Tax configuration
          if (segment.enableGrundfreibetrag) {
            lines.push(`      Grundfreibetrag aktiv: Ja`);
            if (segment.incomeTaxRate !== undefined) {
              lines.push(`      Einkommensteuersatz: ${segment.incomeTaxRate.toFixed(2)} %`);
            }
          }
          
          if (segment.steuerReduzierenEndkapital !== undefined) {
            lines.push(`      Steuerreduzierung: ${segment.steuerReduzierenEndkapital ? 'Ja' : 'Nein'}`);
          }
        });
      }
    }
    
    if (wc.useComparisonMode) {
      lines.push(`  Vergleichsmodus: Ja`);
      lines.push(`  Anzahl Strategien: ${wc.comparisonStrategies.length}`);
    }
  } else {
    // Show default values when no withdrawal config is set
    const defaultEndOfLife = context.startEnd[1];
    lines.push(`  Lebensende: ${defaultEndOfLife} (Standard)`);
    lines.push(`  Strategie: 4% Regel (Standard)`);
    lines.push(`  Entnahme-Rendite: 5.00 % (Standard)`);
    lines.push(`  Entnahme-Häufigkeit: Jährlich (Standard)`);
    lines.push(`  Inflation aktiv: Nein (Standard)`);
    lines.push(`  Grundfreibetrag aktiv: Nein (Standard)`);
    lines.push(`  Entnahme-Rendite-Modus: Fest (Standard)`);
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
      return 'Dynamische Strategie';
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