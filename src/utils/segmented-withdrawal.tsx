import type { WithdrawalStrategy, RenditeBasiertConfig } from "../../helpers/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import type { MonthlyWithdrawalConfig, InflationConfig } from "../../helpers/withdrawal";

/**
 * Configuration for a single withdrawal segment (time period)
 */
export type WithdrawalSegment = {
    /** Unique identifier for the segment */
    id: string;
    /** Display name for the segment */
    name: string;
    /** Start year of the segment (inclusive) */
    startYear: number;
    /** End year of the segment (inclusive) */
    endYear: number;
    /** Withdrawal strategy for this segment */
    strategy: WithdrawalStrategy;
    /** Return configuration for this segment */
    returnConfig: ReturnConfiguration;
    /** Custom withdrawal percentage (for variabel_prozent strategy) */
    customPercentage?: number;
    /** Monthly withdrawal configuration (for monatlich_fest strategy) */
    monthlyConfig?: MonthlyWithdrawalConfig;
    /** Inflation configuration for this segment */
    inflationConfig?: InflationConfig;
    /** Whether to apply Grundfreibetrag for this segment */
    enableGrundfreibetrag?: boolean;
    /** Basic tax allowance per year for this segment */
    grundfreibetragPerYear?: {[year: number]: number};
    /** Income tax rate for this segment */
    incomeTaxRate?: number;
    /** Configuration for return-based adjustment strategy */
    renditeBasiertConfig?: RenditeBasiertConfig;
};

/**
 * Configuration for segmented withdrawal strategy
 */
export type SegmentedWithdrawalConfig = {
    /** Array of withdrawal segments ordered by time */
    segments: WithdrawalSegment[];
    /** Global tax rate applied to all segments */
    taxRate: number;
    /** Global tax allowance configuration */
    freibetragPerYear?: {[year: number]: number};
};

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
    endYear: number
): string[] {
    const errors: string[] = [];
    
    if (segments.length === 0) {
        errors.push("Mindestens ein Segment ist erforderlich");
        return errors;
    }
    
    // Sort segments by start year
    const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear);
    
    // Check if first segment starts at the withdrawal start year
    if (sortedSegments[0].startYear !== startYear) {
        errors.push(`Erstes Segment muss im Jahr ${startYear} beginnen`);
    }
    
    // Check if last segment ends at the withdrawal end year
    if (sortedSegments[sortedSegments.length - 1].endYear !== endYear) {
        errors.push(`Letztes Segment muss im Jahr ${endYear} enden`);
    }
    
    // Check each segment individually
    for (const segment of sortedSegments) {
        // Check if segment end year is before start year
        if (segment.endYear < segment.startYear) {
            errors.push(`Segment "${segment.name}": Endjahr kann nicht vor Startjahr liegen`);
        }
    }
    
    // Check for gaps and overlaps
    for (let i = 0; i < sortedSegments.length - 1; i++) {
        const currentSegment = sortedSegments[i];
        const nextSegment = sortedSegments[i + 1];
        
        // Check for gaps
        if (currentSegment.endYear + 1 < nextSegment.startYear) {
            errors.push(`Lücke zwischen Segment "${currentSegment.name}" und "${nextSegment.name}"`);
        }
        
        // Check for overlaps
        if (currentSegment.endYear >= nextSegment.startYear) {
            errors.push(`Überlappung zwischen Segment "${currentSegment.name}" und "${nextSegment.name}"`);
        }
    }
    
    // Check for duplicate IDs
    const ids = segments.map(s => s.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        errors.push("Segment-IDs müssen eindeutig sein");
    }
    
    return errors;
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
    endYear: number
): WithdrawalSegment {
    return {
        id,
        name,
        startYear,
        endYear,
        strategy: "4prozent",
        returnConfig: {
            mode: 'fixed',
            fixedRate: 0.05 // 5% default
        },
        inflationConfig: {
            inflationRate: 0.02 // 2% default inflation
        },
        enableGrundfreibetrag: false,
        renditeBasiertConfig: {
            baseRate: 0.04,
            upperThreshold: 0,
            upperAdjustment: 0.5,
            lowerThreshold: 0,
            lowerAdjustment: 0.5
        }
    };
}

/**
 * Convert a single withdrawal configuration to segmented format for backward compatibility
 * @param strategy - Withdrawal strategy
 * @param returnConfig - Return configuration
 * @param startYear - Start year
 * @param endYear - End year
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
    customPercentage?: number,
    monthlyConfig?: MonthlyWithdrawalConfig,
    inflationConfig?: InflationConfig,
    enableGrundfreibetrag?: boolean,
    grundfreibetragPerYear?: {[year: number]: number},
    incomeTaxRate?: number
): SegmentedWithdrawalConfig {
    const segment: WithdrawalSegment = {
        id: "main",
        name: "Hauptphase",
        startYear,
        endYear,
        strategy,
        returnConfig,
        customPercentage,
        monthlyConfig,
        inflationConfig,
        enableGrundfreibetrag,
        grundfreibetragPerYear,
        incomeTaxRate
    };
    
    return {
        segments: [segment],
        taxRate: 0.26375 // Default German capital gains tax
    };
}