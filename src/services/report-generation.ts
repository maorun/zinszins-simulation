/**
 * Service for generating automated reports from simulation data
 */

import type { SimulationContextState } from '../contexts/SimulationContext'
import type { ReportConfiguration, ReportContentSelection, ReportGenerationResult } from '../types/automated-report'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { SimulationResultElement } from '../utils/simulate'
import { formatCurrency, formatPercentage, formatNumberGerman } from '../utils/currency'
import { exportSavingsDataToExcel } from '../utils/excel-export'
import {
  exportSavingsDataToPDF,
  exportWithdrawalDataToPDF,
  exportAllDataToPDF,
  downloadPDFBlob,
} from '../utils/pdf-export'
import { downloadTextAsFile, type ExportData } from '../utils/data-export'

/**
 * Report data structure combining simulation data
 * Uses simulation result elements which have all calculated values
 */
export interface ReportData {
  context: SimulationContextState
  simulationResults: SimulationResultElement[]
  withdrawalData?: WithdrawalResult
}

/**
 * Portfolio summary section of the report
 */
export interface PortfolioSummary {
  totalValue: number
  totalContributions: number
  totalReturns: number
  returnPercentage: number
  taxesPaid: number
}

/**
 * Performance metrics section of the report
 */
export interface PerformanceMetrics {
  averageAnnualReturn: number
  bestYear: { year: number; return: number }
  worstYear: { year: number; return: number }
  volatility: number
  sharpeRatio: number
}

/**
 * Tax overview section of the report
 */
export interface TaxOverview {
  totalTaxes: number
  vorabpauschale: number
  capitalGainsTax: number
  freibetragUsed: number
  freibetragRemaining: number
}

/**
 * Calculate portfolio summary from simulation data
 */
export function calculatePortfolioSummary(
  simulationResults: SimulationResultElement[],
  totalContributions: number,
): PortfolioSummary {
  if (!simulationResults || simulationResults.length === 0) {
    return {
      totalValue: 0,
      totalContributions: 0,
      totalReturns: 0,
      returnPercentage: 0,
      taxesPaid: 0,
    }
  }

  const lastElement = simulationResults[simulationResults.length - 1]
  const totalValue = lastElement.endkapital
  const totalReturns = totalValue - totalContributions
  const returnPercentage = totalContributions > 0 ? (totalReturns / totalContributions) * 100 : 0

  // Calculate total taxes paid
  const totalTaxes = simulationResults.reduce((sum, element) => sum + element.bezahlteSteuer, 0)

  return {
    totalValue,
    totalContributions,
    totalReturns,
    returnPercentage,
    taxesPaid: totalTaxes,
  }
}

/**
 * Calculate performance metrics from simulation data
 */
export function calculatePerformanceMetrics(
  simulationResults: SimulationResultElement[],
): PerformanceMetrics | null {
  if (!simulationResults || simulationResults.length < 2) {
    return null
  }

  const yearlyReturns: Array<{ year: number; return: number }> = []
  const startYear = new Date().getFullYear()

  // Calculate year-over-year returns based on capital gains
  for (let i = 0; i < simulationResults.length; i++) {
    const element = simulationResults[i]
    if (element.startkapital > 0) {
      const returnRate = (element.zinsen / element.startkapital) * 100
      yearlyReturns.push({ year: startYear + i, return: returnRate })
    }
  }

  if (yearlyReturns.length === 0) {
    return null
  }

  // Calculate average annual return
  const averageAnnualReturn = yearlyReturns.reduce((sum, item) => sum + item.return, 0) / yearlyReturns.length

  // Find best and worst years
  const bestYear = yearlyReturns.reduce((best, curr) => (curr.return > best.return ? curr : best))
  const worstYear = yearlyReturns.reduce((worst, curr) => (curr.return < worst.return ? curr : worst))

  // Calculate volatility (standard deviation)
  const variance =
    yearlyReturns.reduce((sum, item) => sum + Math.pow(item.return - averageAnnualReturn, 2), 0) / yearlyReturns.length
  const volatility = Math.sqrt(variance)

  // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
  const riskFreeRate = 2
  const sharpeRatio = volatility > 0 ? (averageAnnualReturn - riskFreeRate) / volatility : 0

  return {
    averageAnnualReturn,
    bestYear,
    worstYear,
    volatility,
    sharpeRatio,
  }
}

/**
 * Calculate tax overview from simulation data
 */
export function calculateTaxOverview(
  simulationResults: SimulationResultElement[],
  context: SimulationContextState,
): TaxOverview {
  if (!simulationResults || simulationResults.length === 0) {
    return {
      totalTaxes: 0,
      vorabpauschale: 0,
      capitalGainsTax: 0,
      freibetragUsed: 0,
      freibetragRemaining: 0,
    }
  }

  // Calculate total taxes and Vorabpauschale
  const totalTaxes = simulationResults.reduce((sum, element) => sum + element.bezahlteSteuer, 0)
  const vorabpauschale = simulationResults.reduce((sum, element) => sum + (element.vorabpauschale || 0), 0)

  // Calculate Freibetrag usage from the current year
  const currentYear = new Date().getFullYear()
  const freibetragForCurrentYear = context.freibetragPerYear[currentYear] || 2000

  const lastElement = simulationResults[simulationResults.length - 1]
  const freibetragUsed = lastElement.genutzterFreibetrag || 0
  const freibetragRemaining = Math.max(0, freibetragForCurrentYear - freibetragUsed)

  // Capital gains tax is total taxes minus Vorabpauschale tax
  const capitalGainsTax = Math.max(0, totalTaxes - vorabpauschale * (context.steuerlast / 100))

  return {
    totalTaxes,
    vorabpauschale,
    capitalGainsTax,
    freibetragUsed,
    freibetragRemaining,
  }
}

/**
 * Generate report content as a formatted markdown string
 * Complex formatting logic with multiple sections - complexity is justified
 */
// eslint-disable-next-line max-lines-per-function, complexity
export function generateReportMarkdown(data: ReportData, content: ReportContentSelection, title?: string): string {
  const lines: string[] = []
  const reportDate = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Report header
  lines.push(`# ${title || 'Portfolio-Bericht'}`)
  lines.push(``)
  lines.push(`**Erstellt am:** ${reportDate}`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  // Portfolio summary
  if (content.portfolioSummary && data.simulationResults.length > 0) {
    // Calculate total contributions from context
    const totalContributions = data.context.sparplan.reduce((sum, plan) => {
      const months = data.context.simulationAnnual === 'yearly' ? 12 : 1
      return sum + plan.einzahlung * months * (data.context.startEnd[1] - data.context.startEnd[0])
    }, 0)
    const summary = calculatePortfolioSummary(data.simulationResults, totalContributions)
    lines.push(`## 📊 Portfolio-Übersicht`)
    lines.push(``)
    lines.push(`- **Gesamtwert:** ${formatCurrency(summary.totalValue)}`)
    lines.push(`- **Gesamte Einzahlungen:** ${formatCurrency(summary.totalContributions)}`)
    lines.push(`- **Gesamte Erträge:** ${formatCurrency(summary.totalReturns)}`)
    lines.push(`- **Rendite:** ${formatPercentage(summary.returnPercentage)}`)
    lines.push(`- **Bezahlte Steuern:** ${formatCurrency(summary.taxesPaid)}`)
    lines.push(``)
    lines.push(`---`)
    lines.push(``)
  }

  // Performance metrics
  if (content.performanceMetrics && data.simulationResults.length > 0) {
    const metrics = calculatePerformanceMetrics(data.simulationResults)
    if (metrics) {
      lines.push(`## 📈 Performance-Kennzahlen`)
      lines.push(``)
      lines.push(`- **Durchschnittliche jährliche Rendite:** ${formatPercentage(metrics.averageAnnualReturn)}`)
      lines.push(`- **Bestes Jahr:** ${metrics.bestYear.year} (${formatPercentage(metrics.bestYear.return)})`)
      lines.push(`- **Schlechtestes Jahr:** ${metrics.worstYear.year} (${formatPercentage(metrics.worstYear.return)})`)
      lines.push(`- **Volatilität:** ${formatPercentage(metrics.volatility)}`)
      lines.push(`- **Sharpe Ratio:** ${formatNumberGerman(metrics.sharpeRatio)}`)
      lines.push(``)
      lines.push(`---`)
      lines.push(``)
    }
  }

  // Tax overview
  if (content.taxOverview && data.simulationResults.length > 0) {
    const taxOverview = calculateTaxOverview(data.simulationResults, data.context)
    lines.push(`## 💰 Steuer-Übersicht`)
    lines.push(``)
    lines.push(`- **Gesamte Steuern:** ${formatCurrency(taxOverview.totalTaxes)}`)
    lines.push(`- **Vorabpauschale:** ${formatCurrency(taxOverview.vorabpauschale)}`)
    lines.push(`- **Kapitalertragsteuer:** ${formatCurrency(taxOverview.capitalGainsTax)}`)
    lines.push(`- **Genutzter Freibetrag:** ${formatCurrency(taxOverview.freibetragUsed)}`)
    lines.push(`- **Verbleibender Freibetrag:** ${formatCurrency(taxOverview.freibetragRemaining)}`)
    lines.push(``)
    lines.push(`---`)
    lines.push(``)
  }

  // Savings breakdown
  if (content.savingsBreakdown && data.simulationResults.length > 0) {
    lines.push(`## 🏦 Sparplan-Aufschlüsselung`)
    lines.push(``)
    lines.push(`- **Anzahl Sparpläne:** ${data.context.sparplan.length}`)
    lines.push(`- **Zeitraum:** ${data.context.startEnd[0]} - ${data.context.startEnd[1]}`)
    lines.push(`- **Berechnungsmodus:** ${data.context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'}`)
    lines.push(`- **Rendite:** ${formatPercentage(data.context.rendite)}`)
    lines.push(`- **Kapitalertragsteuer:** ${formatPercentage(data.context.steuerlast)}`)
    lines.push(`- **Teilfreistellungsquote:** ${formatPercentage(data.context.teilfreistellungsquote)}`)
    lines.push(``)
    lines.push(`---`)
    lines.push(``)
  }

  // Withdrawal projections
  if (content.withdrawalProjections && data.withdrawalData) {
    lines.push(`## 🏖️ Entnahme-Projektionen`)
    lines.push(``)
    lines.push(`- **Entnahmestrategie:** ${data.context.withdrawalConfig?.formValue?.strategie || 'Nicht konfiguriert'}`)

    // Convert withdrawal result object to array and sort by year
    const withdrawalYears = Object.keys(data.withdrawalData)
      .map(Number)
      .sort((a, b) => a - b)

    if (withdrawalYears.length > 0) {
      const firstYear = withdrawalYears[0]
      const lastYear = withdrawalYears[withdrawalYears.length - 1]

      const startCapital = data.withdrawalData[firstYear].startkapital
      lines.push(`- **Startkapital:** ${formatCurrency(startCapital)}`)
      lines.push(`- **Dauer:** ${withdrawalYears.length} Jahre`)

      const totalWithdrawals = withdrawalYears.reduce(
        (sum: number, year: number) => sum + data.withdrawalData![year].entnahme,
        0,
      )
      lines.push(`- **Gesamte Entnahmen:** ${formatCurrency(totalWithdrawals)}`)

      const finalCapital = data.withdrawalData[lastYear].endkapital
      lines.push(`- **Endkapital:** ${formatCurrency(finalCapital)}`)
    }
    lines.push(``)
    lines.push(`---`)
    lines.push(``)
  }

  // Risk analysis
  if (content.riskAnalysis && data.simulationResults.length > 0) {
    const metrics = calculatePerformanceMetrics(data.simulationResults)
    if (metrics) {
      lines.push(`## ⚠️ Risiko-Analyse`)
      lines.push(``)
      lines.push(
        `- **Risiko-Rating:** ${metrics.volatility < 10 ? 'Niedrig' : metrics.volatility < 20 ? 'Mittel' : 'Hoch'}`,
      )
      lines.push(`- **Volatilität:** ${formatPercentage(metrics.volatility)}`)
      lines.push(`- **Risiko-adjustierte Rendite (Sharpe):** ${formatNumberGerman(metrics.sharpeRatio)}`)
      const maxDrawdown = Math.abs(metrics.worstYear.return)
      lines.push(`- **Maximaler Drawdown:** ${formatPercentage(maxDrawdown)}`)
      lines.push(``)
      lines.push(`---`)
      lines.push(``)
    }
  }

  // Footer
  lines.push(``)
  lines.push(`*Dieser Bericht wurde automatisch vom Zinseszins-Rechner generiert.*`)
  lines.push(`*Stand: ${reportDate}*`)

  return lines.join('\n')
}

/**
 * Generate a report and download it in the specified format
 * Multiple format handlers with error handling - complexity is justified
 */
// eslint-disable-next-line max-lines-per-function, complexity
export async function generateAndDownloadReport(
  data: ReportData,
  config: ReportConfiguration,
): Promise<ReportGenerationResult> {
  const timestamp = new Date().toISOString()
  const dateStr = new Date().toLocaleDateString('de-DE').replace(/\./g, '-')
  const filenameBase = `Portfolio-Bericht-${dateStr}`

  try {
    if (config.format === 'markdown') {
      const markdown = generateReportMarkdown(data, config.content, config.customTitle)
      downloadTextAsFile(markdown, `${filenameBase}.md`)

      return {
        success: true,
        generatedAt: timestamp,
        format: 'markdown',
        filename: `${filenameBase}.md`,
      }
    }

    if (config.format === 'pdf') {
      let pdfBlob: Blob

      const exportData: ExportData = {
        savingsData: data.simulationResults.length > 0 ? { sparplanElements: [] } : undefined,
        withdrawalData: data.withdrawalData,
        context: data.context,
      }

      if (config.content.savingsBreakdown && config.content.withdrawalProjections && data.withdrawalData) {
        pdfBlob = exportAllDataToPDF(exportData)
      } else if (config.content.withdrawalProjections && data.withdrawalData) {
        pdfBlob = exportWithdrawalDataToPDF(exportData)
      } else {
        pdfBlob = exportSavingsDataToPDF(exportData)
      }

      downloadPDFBlob(pdfBlob, `${filenameBase}.pdf`)

      return {
        success: true,
        generatedAt: timestamp,
        format: 'pdf',
        filename: `${filenameBase}.pdf`,
      }
    }

    if (config.format === 'excel') {
      const exportData: ExportData = {
        savingsData: data.simulationResults.length > 0 ? { sparplanElements: [] } : undefined,
        withdrawalData: data.withdrawalData,
        context: data.context,
      }

      // Excel export only supports savings data with the current API
      if (exportData.savingsData) {
        exportSavingsDataToExcel(exportData.savingsData, data.context)
      }

      return {
        success: true,
        generatedAt: timestamp,
        format: 'excel',
        filename: `${filenameBase}.xlsx`,
      }
    }

    return {
      success: false,
      error: 'Ungültiges Format',
      generatedAt: timestamp,
      format: config.format,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      generatedAt: timestamp,
      format: config.format,
    }
  }
}
