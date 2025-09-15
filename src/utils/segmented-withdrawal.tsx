import type { WithdrawalStrategy } from '../../helpers/withdrawal'
import type { ReturnConfiguration } from '../../helpers/random-returns'
import type { MonthlyWithdrawalConfig, InflationConfig, DynamicWithdrawalConfig, BucketStrategyConfig, RMDConfig } from '../../helpers/withdrawal'
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
  /** Whether to apply Grundfreibetrag for this segment */
  enableGrundfreibetrag?: boolean
  /** Basic tax allowance per year for this segment */
  grundfreibetragPerYear?: { [year: number]: number }
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
}

/**
 * Validate that withdrawal segments cover the entire withdrawal period without gaps or overlaps
 * @param segments - Array of withdrawal segments
 * @param startYear - First year of withdrawal phase
 * @param endYear - Last year of withdrawal phase
 * @returns Array of validation errors (empty if valid)
 */
export function validateWithdrawalSegments(
  segments: WithdrawalSegment[],
  startYear: number,
  _endYear: number,
): string[] {
  const errors: string[] = []

  if (segments.length === 0) {
    errors.push('Mindestens ein Segment ist erforderlich')
    return errors
  }

  // Ensure all years are rounded to handle floating-point comparisons
  const roundedStartYear = Math.round(startYear)

  // Sort segments by start year
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)

  // Check if first segment starts at the withdrawal start year
  if (Math.round(sortedSegments[0].startYear) !== roundedStartYear) {
    errors.push(`Erstes Segment muss im Jahr ${roundedStartYear} beginnen`)
  }

  // Allow segments to end before the withdrawal end year
  // No longer require segments to end exactly at the withdrawal end year
  // This allows users to create segments that don't cover the entire withdrawal period

  // Check each segment individually
  for (const segment of sortedSegments) {
    // Check if segment end year is before start year
    if (Math.round(segment.endYear) < Math.round(segment.startYear)) {
      errors.push(`Segment "${segment.name}": Endjahr kann nicht vor Startjahr liegen`)
    }
  }

  // Check for gaps and overlaps
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    const currentSegment = sortedSegments[i]
    const nextSegment = sortedSegments[i + 1]

    const currentEndYear = Math.round(currentSegment.endYear)
    const nextStartYear = Math.round(nextSegment.startYear)

    // Check for gaps
    if (currentEndYear + 1 < nextStartYear) {
      errors.push(`Lücke zwischen Segment "${currentSegment.name}" und "${nextSegment.name}"`)
    }

    // Check for overlaps
    if (currentEndYear >= nextStartYear) {
      errors.push(`Überlappung zwischen Segment "${currentSegment.name}" und "${nextSegment.name}"`)
    }
  }

  // Check for duplicate IDs
  const ids = segments.map(s => s.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    errors.push('Segment-IDs müssen eindeutig sein')
  }

  return errors
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
    enableGrundfreibetrag: false,
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
 * @param enableGrundfreibetrag - Enable Grundfreibetrag (optional)
 * @param grundfreibetragPerYear - Grundfreibetrag per year (optional)
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
  enableGrundfreibetrag?: boolean,
  grundfreibetragPerYear?: { [year: number]: number },
  incomeTaxRate?: number,
  steuerReduzierenEndkapital: boolean = true,
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
    enableGrundfreibetrag,
    grundfreibetragPerYear,
    incomeTaxRate,
    steuerReduzierenEndkapital,
  }

  return {
    segments: [segment],
    taxRate: 0.26375, // Default German capital gains tax
  }
}

/**
 * Move a segment up in the order (earlier in time)
 * @param segments - Array of withdrawal segments
 * @param segmentId - ID of the segment to move up
 * @returns Updated segments array with the segment moved up
 */
export function moveSegmentUp(segments: WithdrawalSegment[], segmentId: string): WithdrawalSegment[] {
  // Sort segments by start year to determine chronological order
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
  const segmentIndex = sortedSegments.findIndex(s => s.id === segmentId)

  // Can't move the first segment up
  if (segmentIndex <= 0) {
    return segments
  }

  const targetSegment = sortedSegments[segmentIndex]
  const previousSegment = sortedSegments[segmentIndex - 1]

  // Calculate new time ranges (inclusive years: duration = end - start + 1)
  const segmentDuration = targetSegment.endYear - targetSegment.startYear + 1
  const previousDuration = previousSegment.endYear - previousSegment.startYear + 1

  // Swap the time ranges
  const newTargetStartYear = previousSegment.startYear
  const newTargetEndYear = newTargetStartYear + segmentDuration - 1
  const newPreviousStartYear = newTargetEndYear + 1
  const newPreviousEndYear = newPreviousStartYear + previousDuration - 1

  // Return the updated segments array maintaining the same order as the original input
  return segments.map((segment) => {
    if (segment.id === segmentId) {
      return { ...segment, startYear: newTargetStartYear, endYear: newTargetEndYear }
    }
    if (segment.id === previousSegment.id) {
      return { ...segment, startYear: newPreviousStartYear, endYear: newPreviousEndYear }
    }
    return segment
  })
}

/**
 * Move a segment down in the order (later in time)
 * @param segments - Array of withdrawal segments
 * @param segmentId - ID of the segment to move down
 * @returns Updated segments array with the segment moved down
 */
export function moveSegmentDown(segments: WithdrawalSegment[], segmentId: string): WithdrawalSegment[] {
  // Sort segments by start year to determine chronological order
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
  const segmentIndex = sortedSegments.findIndex(s => s.id === segmentId)

  // Can't move the last segment down
  if (segmentIndex < 0 || segmentIndex >= sortedSegments.length - 1) {
    return segments
  }

  const targetSegment = sortedSegments[segmentIndex]
  const nextSegment = sortedSegments[segmentIndex + 1]

  // Calculate new time ranges (inclusive years: duration = end - start + 1)
  const segmentDuration = targetSegment.endYear - targetSegment.startYear + 1
  const nextDuration = nextSegment.endYear - nextSegment.startYear + 1

  // Swap the time ranges
  const newNextStartYear = targetSegment.startYear
  const newNextEndYear = newNextStartYear + nextDuration - 1
  const newTargetStartYear = newNextEndYear + 1
  const newTargetEndYear = newTargetStartYear + segmentDuration - 1

  // Return the updated segments array maintaining the same order as the original input
  return segments.map((segment) => {
    if (segment.id === segmentId) {
      return { ...segment, startYear: newTargetStartYear, endYear: newTargetEndYear }
    }
    if (segment.id === nextSegment.id) {
      return { ...segment, startYear: newNextStartYear, endYear: newNextEndYear }
    }
    return segment
  })
}

/**
 * Insert a new segment before an existing segment
 * @param segments - Array of withdrawal segments
 * @param beforeSegmentId - ID of the segment before which to insert
 * @param newSegmentName - Name for the new segment
 * @param newSegmentDuration - Duration in years for the new segment (default: 5)
 * @returns Updated segments array with the new segment inserted
 */
export function insertSegmentBefore(
  segments: WithdrawalSegment[],
  beforeSegmentId: string,
  newSegmentName: string,
  newSegmentDuration: number = 5,
): WithdrawalSegment[] {
  // Sort segments by start year to determine chronological order
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
  const targetSegmentIndex = sortedSegments.findIndex(s => s.id === beforeSegmentId)

  if (targetSegmentIndex < 0) {
    return segments
  }

  const targetSegment = sortedSegments[targetSegmentIndex]

  // Calculate the new segment's time range
  const newSegmentStartYear = targetSegment.startYear
  const newSegmentEndYear = newSegmentStartYear + newSegmentDuration - 1

  // Create the new segment
  const newSegmentId = `segment_${Date.now()}`
  const newSegment = createDefaultWithdrawalSegment(
    newSegmentId,
    newSegmentName,
    newSegmentStartYear,
    newSegmentEndYear,
  )

  // Update the target segment to start after the new segment
  const updatedTargetStartYear = newSegmentEndYear + 1
  const targetDuration = targetSegment.endYear - targetSegment.startYear + 1
  const updatedTargetEndYear = updatedTargetStartYear + targetDuration - 1

  // Update all segments that need to be shifted
  const updatedSegments = segments.map((segment) => {
    if (segment.id === beforeSegmentId) {
      return { ...segment, startYear: updatedTargetStartYear, endYear: updatedTargetEndYear }
    }
    // Shift any segments that come after the target segment
    const segmentChronologicalIndex = sortedSegments.findIndex(s => s.id === segment.id)
    if (segmentChronologicalIndex > targetSegmentIndex) {
      const shiftAmount = newSegmentDuration + 1 // +1 for the gap between segments
      return { ...segment, startYear: segment.startYear + shiftAmount, endYear: segment.endYear + shiftAmount }
    }
    return segment
  })

  // Add the new segment to the array
  return [...updatedSegments, newSegment]
}

/**
 * Auto-correct broken segment time ranges while preserving all phase data
 * This function fixes segments with invalid time ranges (e.g. endYear < startYear)
 * while maintaining all configuration, strategies, and other phase information
 * @param segments - Array of potentially broken withdrawal segments
 * @param withdrawalStartYear - Year when withdrawal phase begins
 * @returns Corrected segments with valid time ranges
 */
export function autoCorrectSegmentTimeRanges(
  segments: WithdrawalSegment[],
  withdrawalStartYear: number,
): WithdrawalSegment[] {
  if (segments.length === 0) {
    return segments
  }

  // Sort segments by their original start year to preserve intended order
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)

  let currentStartYear = Math.round(withdrawalStartYear)

  return sortedSegments.map((segment) => {
    // Calculate a reasonable duration - use original if valid, otherwise default to 5 years
    let segmentDuration = segment.endYear - segment.startYear + 1

    // If the original duration is invalid (negative or zero), use 5 years as default
    if (segmentDuration <= 0) {
      segmentDuration = 5
    }

    // Ensure minimum duration of 1 year
    segmentDuration = Math.max(1, segmentDuration)

    const correctedStartYear = currentStartYear
    const correctedEndYear = correctedStartYear + segmentDuration - 1

    // Update the start year for the next segment
    currentStartYear = correctedEndYear + 1

    // Return the segment with corrected time range but all other data preserved
    return {
      ...segment, // Preserve ALL original data: strategy, config, returns, etc.
      startYear: correctedStartYear,
      endYear: correctedEndYear,
    }
  })
}

/**
 * Create a new segment with valid time range based on existing segments
 * @param segments - Array of existing withdrawal segments
 * @param segmentName - Name for the new segment
 * @param segmentDuration - Duration in years for the new segment (default: 5)
 * @returns New segment with valid time range
 */
export function createValidNewSegment(
  segments: WithdrawalSegment[],
  segmentName: string,
  segmentDuration: number = 5,
): WithdrawalSegment {
  const newId = `segment_${Date.now()}`

  if (segments.length === 0) {
    // No existing segments - this shouldn't happen in normal usage
    return createDefaultWithdrawalSegment(newId, segmentName, 2041, 2041 + segmentDuration - 1)
  }

  // Find the chronologically last segment by end year
  const lastSegment = segments.reduce((latest, segment) => {
    return segment.endYear > latest.endYear ? segment : latest
  })

  const newStartYear = lastSegment.endYear + 1
  const newEndYear = newStartYear + segmentDuration - 1

  return createDefaultWithdrawalSegment(newId, segmentName, newStartYear, newEndYear)
}
