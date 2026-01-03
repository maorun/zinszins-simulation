/**
 * Utility functions for persisting report configuration in browser's localStorage
 */

import { DEFAULT_REPORT_CONFIG, type ReportConfiguration } from '../types/automated-report'

const REPORT_CONFIG_STORAGE_KEY = 'zinszins-report-config'

/**
 * Saves report configuration to localStorage
 * @param config - Report configuration to save
 * @returns true if successful, false otherwise
 */
export function saveReportConfig(config: ReportConfiguration): boolean {
  try {
    const serialized = JSON.stringify(config)
    localStorage.setItem(REPORT_CONFIG_STORAGE_KEY, serialized)
    return true
  } catch (error) {
    console.error('Failed to save report configuration:', error)
    return false
  }
}

/**
 * Loads report configuration from localStorage
 * @returns Saved configuration or default if none exists
 */
export function loadReportConfig(): ReportConfiguration {
  try {
    const serialized = localStorage.getItem(REPORT_CONFIG_STORAGE_KEY)
    if (!serialized) {
      return DEFAULT_REPORT_CONFIG
    }
    const parsed = JSON.parse(serialized) as ReportConfiguration
    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_REPORT_CONFIG,
      ...parsed,
      content: {
        ...DEFAULT_REPORT_CONFIG.content,
        ...(parsed.content || {}),
      },
    }
  } catch (error) {
    console.error('Failed to load report configuration:', error)
    return DEFAULT_REPORT_CONFIG
  }
}

/**
 * Clears report configuration from localStorage
 * @returns true if successful, false otherwise
 */
export function clearReportConfig(): boolean {
  try {
    localStorage.removeItem(REPORT_CONFIG_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear report configuration:', error)
    return false
  }
}

/**
 * Checks if it's time to generate a new report based on frequency
 * @param config - Report configuration
 * @returns true if report should be generated
 */
export function shouldGenerateReport(config: ReportConfiguration): boolean {
  if (!config.enabled || config.frequency === 'never') {
    return false
  }

  if (!config.lastGenerated) {
    return true
  }

  try {
    const lastGenerated = new Date(config.lastGenerated)
    const now = new Date()
    const daysSinceLastReport = Math.floor((now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24))

    switch (config.frequency) {
      case 'monthly':
        return daysSinceLastReport >= 30
      case 'quarterly':
        return daysSinceLastReport >= 90
      case 'yearly':
        return daysSinceLastReport >= 365
      default:
        return false
    }
  } catch (error) {
    console.error('Failed to check report generation schedule:', error)
    return false
  }
}

/**
 * Updates the last generated timestamp for a report configuration
 * @param config - Report configuration to update
 * @returns Updated configuration
 */
export function updateLastGenerated(config: ReportConfiguration): ReportConfiguration {
  return {
    ...config,
    lastGenerated: new Date().toISOString(),
  }
}
