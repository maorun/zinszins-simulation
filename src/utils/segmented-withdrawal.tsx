import { type WithdrawalStrategy, type MonthlyWithdrawalConfig, type InflationConfig, type DynamicWithdrawalConfig, type BucketStrategyConfig, type RMDConfig, type SteueroptimierteEntnahmeConfig } from '../../helpers/withdrawal'
import type { ReturnConfiguration } from '../../helpers/random-returns'
import type { WithdrawalFrequency } from './config-storage'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'

/**
 * Configuration for a single withdrawal segment (time period)
 */
export type WithdrawalSegment = {
  /** Unique identifier for the segment */
  id: string
  /** Display name for the segment */
  name: string
  /** Start year of the segment (inclusive) */
  startYear: number
  /** End year of the segment (inclusive) */
  endYear: number
  /** Withdrawal strategy for this segment */
  strategy: WithdrawalStrategy
  /** Withdrawal frequency for this segment */
  withdrawalFrequency: WithdrawalFrequency
  /** Return configuration for this segment */
  returnConfig: ReturnConfiguration
  /** Custom withdrawal percentage (for variabel_prozent strategy) */
  customPercentage?: number
  /** Monthly withdrawal configuration (for monatlich_fest strategy) */
  monthlyConfig?: MonthlyWithdrawalConfig
  /** Inflation configuration for this segment */
  inflationConfig?: InflationConfig
  /** Dynamic withdrawal configuration (for dynamisch strategy) */
  dynamicConfig?: DynamicWithdrawalConfig
  /** Bucket strategy configuration (for bucket_strategie strategy) */
  bucketConfig?: BucketStrategyConfig
  /** RMD configuration (for rmd strategy) */
  rmdConfig?: RMDConfig
  /** Steueroptimierte Entnahme configuration (for steueroptimiert strategy) */
  steuerOptimierteConfig?: SteueroptimierteEntnahmeConfig
  /** Income tax rate for this segment */
  incomeTaxRate?: number
  /** Whether taxes should reduce capital for this segment */
  steuerReduzierenEndkapital?: boolean
}

/**
 * Configuration for segmented withdrawal strategy
 */
export type SegmentedWithdrawalConfig = {
  /** Array of withdrawal segments ordered by time */
  segments: WithdrawalSegment[]
  /** Global tax rate applied to all segments */
  taxRate: number
  /** Global tax allowance configuration */
  freibetragPerYear?: { [year: number]: number }
  /** Statutory pension configuration (applies to all segments) */
  statutoryPensionConfig?: StatutoryPensionConfig
  /** Church tax configuration */
  kirchensteuerAktiv?: boolean
  kirchensteuersatz?: number
}

/**
 * Validate segment date ranges
 */
function validateSegmentDateRanges(segments: WithdrawalSegment[]): string[] {
  const errors: string[] = []
  for (const segment of segments) {
    if (Math.round(segment.endYear) < Math.round(segment.startYear)) {
      errors.push(`Segment "${segment.name}": Endjahr kann nicht vor Startjahr liegen`)
    }
  }
  return errors
}

/**
 * Validate no overlaps between segments
 */
function validateNoOverlaps(sortedSegments: WithdrawalSegment[]): string[] {
  const errors: string[] = []
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    const currentSegment = sortedSegments[i]
    const nextSegment = sortedSegments[i + 1]
    const currentEndYear = Math.round(currentSegment.endYear)
    const nextStartYear = Math.round(nextSegment.startYear)

    if (currentEndYear >= nextStartYear) {
      errors.push(`Überlappung zwischen Segment "${currentSegment.name}" und "${nextSegment.name}"`)
    }
  }
  return errors
}

/**
 * Validate segment IDs are unique
 */
function validateUniqueIds(segments: WithdrawalSegment[]): string[] {
  const ids = segments.map(s => s.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    return ['Segment-IDs müssen eindeutig sein']
  }
  return []
}

/**
 * Validate segment boundaries match withdrawal period
 */
function validateSegmentBoundaries(
  sortedSegments: WithdrawalSegment[],
  startYear: number,
  endYear: number,
): string[] {
  const errors: string[] = []
  const firstSegment = sortedSegments[0]
  const lastSegment = sortedSegments[sortedSegments.length - 1]

  if (Math.round(firstSegment.startYear) !== Math.round(startYear)) {
    errors.push(`Die erste Phase muss am Entsparzeitpunkt (${startYear}) beginnen. Aktuelle erste Phase beginnt ${Math.round(firstSegment.startYear)}.`)
  }

  if (Math.round(lastSegment.endYear) !== Math.round(endYear)) {
    errors.push(`Die letzte Phase muss am Lebensende (${endYear}) enden. Aktuelle letzte Phase endet ${Math.round(lastSegment.endYear)}.`)
  }

  return errors
}

/**
 * Validate no gaps between consecutive segments
 */
function validateContinuousSegments(sortedSegments: WithdrawalSegment[]): string[] {
  const errors: string[] = []
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    const currentSegment = sortedSegments[i]
    const nextSegment = sortedSegments[i + 1]
    const currentEndYear = Math.round(currentSegment.endYear)
    const nextStartYear = Math.round(nextSegment.startYear)

    if (currentEndYear + 1 !== nextStartYear) {
      errors.push(`Lücke zwischen Segment "${currentSegment.name}" (endet ${currentEndYear}) und "${nextSegment.name}" (beginnt ${nextStartYear}). Die Zeiträume müssen durchgängig sein.`)
    }
  }
  return errors
}

/**
 * Validate that withdrawal segments are properly configured without overlaps
 * @param segments - Array of withdrawal segments
 * @param startYear - First year of withdrawal phase (Entsparzeitpunkt)
 * @param endYear - Last year of withdrawal phase (Lebensende)
 * @returns Array of validation errors (empty if valid)
 */
export function validateWithdrawalSegments(
  segments: WithdrawalSegment[],
  startYear: number,
  endYear: number,
): string[] {
  if (segments.length === 0) {
    return ['Mindestens ein Segment ist erforderlich']
  }

  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)

  return [
    ...validateSegmentDateRanges(sortedSegments),
    ...validateNoOverlaps(sortedSegments),
    ...validateUniqueIds(segments),
    ...validateSegmentBoundaries(sortedSegments, startYear, endYear),
    ...validateContinuousSegments(sortedSegments),
  ]
}

/**
 * Create a default withdrawal segment
 * @param id - Unique identifier
 * @param name - Display name
 * @param startYear - Start year
 * @param endYear - End year
 * @returns Default withdrawal segment
 */
export function createDefaultWithdrawalSegment(
  id: string,
  name: string,
  startYear: number,
  endYear: number,
): WithdrawalSegment {
  return {
    id,
    name,
    startYear,
    endYear,
    strategy: '4prozent',
    withdrawalFrequency: 'yearly', // Default to yearly as specified in requirements
    returnConfig: {
      mode: 'fixed',
      fixedRate: 0.05, // 5% default
    },
    inflationConfig: {
      inflationRate: 0.02, // 2% default inflation
    },
    incomeTaxRate: 0.18, // Default income tax rate 18%
    steuerReduzierenEndkapital: true, // Default: taxes reduce capital
  }
}

/**
 * Synchronize withdrawal segments to use a new global end year
 * @param segments - Array of withdrawal segments to synchronize
 * @param newEndYear - New global end of life year
 * @returns Updated segments with synchronized end year
 */
export function synchronizeWithdrawalSegmentsEndYear(
  segments: WithdrawalSegment[],
  newEndYear: number,
): WithdrawalSegment[] {
  if (segments.length === 0) {
    return segments
  }

  // Ensure the new end year is always a whole number
  const roundedEndYear = Math.round(newEndYear)

  // Sort segments by start year to find the last segment
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
  const lastSegment = sortedSegments[sortedSegments.length - 1]

  // If the last segment already ends at the new end year, no changes needed
  if (lastSegment.endYear === roundedEndYear) {
    return segments
  }

  // Update only the last segment to end at the new global end year
  return segments.map((segment) => {
    if (segment.id === lastSegment.id) {
      return {
        ...segment,
        endYear: roundedEndYear,
      }
    }
    return segment
  })
}

/**
 * Convert a single withdrawal configuration to segmented format for backward compatibility
 * @param strategy - Withdrawal strategy
 * @param returnConfig - Return configuration
 * @param startYear - Start year
 * @param endYear - End year
 * @param withdrawalFrequency - Withdrawal frequency (optional, defaults to yearly)
 * @param customPercentage - Custom percentage (optional)
 * @param monthlyConfig - Monthly config (optional)
 * @param inflationConfig - Inflation config (optional)

 * @param incomeTaxRate - Income tax rate (optional)
 * @returns Single segment configuration
 */
export function createSingleSegmentConfig(
  strategy: WithdrawalStrategy,
  returnConfig: ReturnConfiguration,
  startYear: number,
  endYear: number,
  withdrawalFrequency: WithdrawalFrequency = 'yearly',
  customPercentage?: number,
  monthlyConfig?: MonthlyWithdrawalConfig,
  inflationConfig?: InflationConfig,
  incomeTaxRate?: number,
  steuerReduzierenEndkapital = true,
): SegmentedWithdrawalConfig {
  const segment: WithdrawalSegment = {
    id: 'main',
    name: 'Hauptphase',
    startYear,
    endYear,
    strategy,
    withdrawalFrequency,
    returnConfig,
    customPercentage,
    monthlyConfig,
    inflationConfig,
    incomeTaxRate,
    steuerReduzierenEndkapital,
  }

  return {
    segments: [segment],
    taxRate: 0.26375, // Default German capital gains tax
  }
}
