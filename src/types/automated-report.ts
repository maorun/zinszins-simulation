/**
 * Types and interfaces for automated reporting feature
 */

/**
 * Report frequency options for scheduling automated reports
 */
export type ReportFrequency = 'never' | 'monthly' | 'quarterly' | 'yearly'

/**
 * Report format options for output generation
 */
export type ReportFormat = 'markdown' | 'pdf' | 'excel'

/**
 * Report content sections that can be included
 */
export interface ReportContentSelection {
  /** Include portfolio summary with total value and returns */
  portfolioSummary: boolean
  /** Include detailed performance metrics */
  performanceMetrics: boolean
  /** Include tax calculations and obligations */
  taxOverview: boolean
  /** Include savings plan breakdown */
  savingsBreakdown: boolean
  /** Include withdrawal phase projections */
  withdrawalProjections: boolean
  /** Include risk analysis metrics */
  riskAnalysis: boolean
}

/**
 * Complete report configuration
 */
export interface ReportConfiguration {
  /** Whether automated reporting is enabled */
  enabled: boolean
  /** How often to generate reports */
  frequency: ReportFrequency
  /** Preferred output format */
  format: ReportFormat
  /** Which sections to include in the report */
  content: ReportContentSelection
  /** Last time a report was generated (ISO string) */
  lastGenerated?: string
  /** Custom report title (optional) */
  customTitle?: string
}

/**
 * Default report configuration
 */
export const DEFAULT_REPORT_CONFIG: ReportConfiguration = {
  enabled: false,
  frequency: 'quarterly',
  format: 'pdf',
  content: {
    portfolioSummary: true,
    performanceMetrics: true,
    taxOverview: true,
    savingsBreakdown: true,
    withdrawalProjections: false,
    riskAnalysis: true,
  },
}

/**
 * Report generation result
 */
export interface ReportGenerationResult {
  success: boolean
  error?: string
  generatedAt: string
  format: ReportFormat
  filename?: string
}
