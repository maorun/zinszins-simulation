import { jsPDF } from 'jspdf'
import type { SimulationContextState } from '../contexts/SimulationContext'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { SparplanElement } from './sparplan-utils'
import type { ExportData } from './data-export'
import { formatCurrency } from './currency'

/**
 * PDF Export utility for generating comprehensive financial reports
 * 
 * This module provides functions to export simulation data to PDF format
 * following German financial reporting standards.
 */

/**
 * Format percentage values for PDF display
 */
function formatPercentage(value: number): string {
  return value != null ? `${value.toFixed(2)}%` : '0.00%'
}

/**
 * Format date for PDF display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Add header to PDF document
 */
function addHeader(doc: jsPDF, title: string): number {
  const pageWidth = doc.internal.pageSize.width
  let yPos = 20

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  // Generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Erstellt am: ${formatDate(new Date())}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  return yPos
}

/**
 * Add section header to PDF
 */
function addSectionHeader(doc: jsPDF, text: string, yPos: number): number {
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(text, 15, yPos)
  yPos += 8
  
  // Add underline
  doc.setLineWidth(0.5)
  doc.line(15, yPos, doc.internal.pageSize.width - 15, yPos)
  yPos += 8

  return yPos
}

/**
 * Add parameter section to PDF
 */
function addParameterSection(doc: jsPDF, context: SimulationContextState, yPos: number): number {
  yPos = addSectionHeader(doc, 'Simulationsparameter', yPos)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const params = [
    ['Zeitraum:', `${context.startEnd[0]} - ${context.startEnd[1]}`],
    ['Rendite:', formatPercentage(context.rendite)],
    ['Kapitalertragsteuer:', formatPercentage(context.steuerlast)],
    ['Teilfreistellungsquote:', formatPercentage(context.teilfreistellungsquote)],
    ['Berechnungsmodus:', context.simulationAnnual === 'yearly' ? 'Jährlich' : 'Monatlich'],
  ]

  params.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 80, yPos)
    yPos += 6
  })

  yPos += 5
  return yPos
}

/**
 * Add savings plan summary to PDF
 */
function addSavingsPlanSummary(doc: jsPDF, context: SimulationContextState, yPos: number): number {
  if (!context.sparplan || context.sparplan.length === 0) {
    return yPos
  }

  yPos = addSectionHeader(doc, 'Sparpläne', yPos)

  doc.setFontSize(10)
  
  context.sparplan.forEach((plan, index) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`Sparplan ${index + 1}:`, 15, yPos)
    yPos += 6

    doc.setFont('helvetica', 'normal')
    doc.text(`Betrag: ${formatCurrency(plan.einzahlung || 0)}`, 20, yPos)
    yPos += 5
    doc.text(`Start: ${new Date(plan.start).toLocaleDateString('de-DE')}`, 20, yPos)
    yPos += 5
    
    if (plan.end) {
      doc.text(`Ende: ${new Date(plan.end).toLocaleDateString('de-DE')}`, 20, yPos)
      yPos += 5
    }

    yPos += 3
  })

  yPos += 5
  return yPos
}

/**
 * Add savings phase data table to PDF
 */
function addSavingsDataTable(doc: jsPDF, savingsData: SparplanElement[], yPos: number): number {
  yPos = addSectionHeader(doc, 'Sparphase - Jahresübersicht', yPos)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  // Table headers
  const headers = ['Jahr', 'Startkapital', 'Zinsen', 'Endkapital', 'Steuer']
  const colWidths = [20, 40, 35, 40, 35]
  let xPos = 15

  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos)
    xPos += colWidths[i]
  })
  yPos += 5

  // Table data
  doc.setFont('helvetica', 'normal')
  
  // Get simulation data
  if (!savingsData || savingsData.length === 0) {
    doc.text('Keine Daten verfügbar', 15, yPos)
    return yPos + 10
  }

  // Process up to 30 years to fit on page
  const maxRows = 30
  const dataToShow = savingsData.slice(0, maxRows)

  dataToShow.forEach(element => {
    const simulation = element.simulation
    if (!simulation) return

    // Get first year of data
    const years = Object.keys(simulation).sort()
    years.forEach(yearKey => {
      const yearData = simulation[parseInt(yearKey)]
      if (!yearData) return

      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 30) {
        doc.addPage()
        yPos = 20
      }

      xPos = 15
      doc.text(yearKey, xPos, yPos)
      xPos += colWidths[0]
      doc.text(formatCurrency(yearData.startkapital || 0), xPos, yPos)
      xPos += colWidths[1]
      doc.text(formatCurrency(yearData.zinsen || 0), xPos, yPos)
      xPos += colWidths[2]
      doc.text(formatCurrency(yearData.endkapital || 0), xPos, yPos)
      xPos += colWidths[3]
      doc.text(formatCurrency(yearData.bezahlteSteuer || 0), xPos, yPos)
      
      yPos += 5
    })
  })

  yPos += 10
  return yPos
}

/**
 * Add withdrawal phase data table to PDF
 */
function addWithdrawalDataTable(doc: jsPDF, withdrawalData: WithdrawalResult, yPos: number): number {
  yPos = addSectionHeader(doc, 'Entnahmephase - Jahresübersicht', yPos)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  // Table headers
  const headers = ['Jahr', 'Startkapital', 'Entnahme', 'Rendite', 'Endkapital']
  const colWidths = [20, 40, 35, 35, 40]
  let xPos = 15

  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos)
    xPos += colWidths[i]
  })
  yPos += 5

  // Table data
  doc.setFont('helvetica', 'normal')

  if (!withdrawalData || Object.keys(withdrawalData).length === 0) {
    doc.text('Keine Daten verfügbar', 15, yPos)
    return yPos + 10
  }

  // Get years and sort them
  const years = Object.keys(withdrawalData).map(Number).sort((a, b) => a - b)
  
  // Process up to 30 years to fit on page
  const maxRows = 30
  const yearsToShow = years.slice(0, maxRows)

  yearsToShow.forEach(year => {
    const yearData = withdrawalData[year]
    if (!yearData) return

    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 30) {
      doc.addPage()
      yPos = 20
    }

    xPos = 15
    doc.text(year.toString(), xPos, yPos)
    xPos += colWidths[0]
    doc.text(formatCurrency(yearData.startkapital || 0), xPos, yPos)
    xPos += colWidths[1]
    doc.text(formatCurrency(yearData.entnahme || 0), xPos, yPos)
    xPos += colWidths[2]
    doc.text(formatCurrency(yearData.zinsen || 0), xPos, yPos)
    xPos += colWidths[3]
    doc.text(formatCurrency(yearData.endkapital || 0), xPos, yPos)

    yPos += 5
  })

  yPos += 10
  return yPos
}

/**
 * Extract savings summary statistics
 */
function extractSavingsSummary(data: ExportData): Array<[string, string]> {
  const stats: Array<[string, string]> = []
  
  if (!data.savingsData?.sparplanElements || data.savingsData.sparplanElements.length === 0) {
    return stats
  }

  const lastElement = data.savingsData.sparplanElements[data.savingsData.sparplanElements.length - 1]
  if (!lastElement.simulation) {
    return stats
  }

  const years = Object.keys(lastElement.simulation).sort()
  const lastYear = years[years.length - 1]
  const lastYearData = lastElement.simulation[parseInt(lastYear)]
  
  if (lastYearData) {
    stats.push(['Endkapital Sparphase:', formatCurrency(lastYearData.endkapital || 0)])
    stats.push(['Gesamte Zinsen:', formatCurrency(lastYearData.zinsen || 0)])
  }

  return stats
}

/**
 * Extract withdrawal summary statistics
 */
function extractWithdrawalSummary(data: ExportData): Array<[string, string]> {
  const stats: Array<[string, string]> = []
  
  if (!data.withdrawalData || Object.keys(data.withdrawalData).length === 0) {
    return stats
  }

  const years = Object.keys(data.withdrawalData).map(Number).sort((a, b) => a - b)
  const lastYear = years[years.length - 1]
  const lastYearData = data.withdrawalData[lastYear]
  
  if (lastYearData) {
    stats.push(['Endkapital Entnahmephase:', formatCurrency(lastYearData.endkapital || 0)])
    
    const totalWithdrawals = years.reduce(
      (sum, year) => sum + (data.withdrawalData![year]?.entnahme || 0),
      0
    )
    stats.push(['Gesamte Entnahmen:', formatCurrency(totalWithdrawals)])
  }

  return stats
}

/**
 * Add summary statistics to PDF
 */
function addSummaryStatistics(doc: jsPDF, data: ExportData, yPos: number): number {
  yPos = addSectionHeader(doc, 'Zusammenfassung', yPos)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const savingsStats = extractSavingsSummary(data)
  const withdrawalStats = extractWithdrawalSummary(data)
  const stats = [...savingsStats, ...withdrawalStats]

  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 80, yPos)
    yPos += 6
  })

  return yPos
}

/**
 * Add footer to PDF document
 */
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const pageText = `Seite ${i} von ${pageCount}`
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' })
    doc.text('Zinseszins-Simulation', 15, pageHeight - 10)
  }
}

/**
 * Export savings phase data to PDF
 */
export function exportSavingsDataToPDF(data: ExportData): Blob {
  const doc = new jsPDF()
  
  let yPos = addHeader(doc, 'Sparphase - Simulationsbericht')
  
  yPos = addParameterSection(doc, data.context, yPos)
  yPos = addSavingsPlanSummary(doc, data.context, yPos)
  
  if (data.savingsData?.sparplanElements) {
    addSavingsDataTable(doc, data.savingsData.sparplanElements, yPos)
  }
  
  addFooter(doc)
  
  return doc.output('blob')
}

/**
 * Export withdrawal phase data to PDF
 */
export function exportWithdrawalDataToPDF(data: ExportData): Blob {
  const doc = new jsPDF()
  
  let yPos = addHeader(doc, 'Entnahmephase - Simulationsbericht')
  
  yPos = addParameterSection(doc, data.context, yPos)
  
  if (data.withdrawalData) {
    addWithdrawalDataTable(doc, data.withdrawalData, yPos)
  }
  
  addFooter(doc)
  
  return doc.output('blob')
}

/**
 * Export complete simulation data to PDF (both phases)
 */
export function exportAllDataToPDF(data: ExportData): Blob {
  const doc = new jsPDF()
  
  let yPos = addHeader(doc, 'Vollständiger Simulationsbericht')
  
  yPos = addParameterSection(doc, data.context, yPos)
  yPos = addSavingsPlanSummary(doc, data.context, yPos)
  
  // Add summary statistics
  yPos = addSummaryStatistics(doc, data, yPos)
  
  // Add new page for detailed data
  doc.addPage()
  yPos = 20
  
  // Add savings phase data
  if (data.savingsData?.sparplanElements) {
    yPos = addSavingsDataTable(doc, data.savingsData.sparplanElements, yPos)
  }
  
  // Add withdrawal phase data
  if (data.withdrawalData) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage()
      yPos = 20
    }
    yPos = addWithdrawalDataTable(doc, data.withdrawalData, yPos)
  }
  
  addFooter(doc)
  
  return doc.output('blob')
}

/**
 * Download a PDF blob with a given filename
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
