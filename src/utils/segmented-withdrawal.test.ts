import { describe, test, expect } from 'vitest';
import { 
    validateWithdrawalSegments, 
    createDefaultWithdrawalSegment,
    createSingleSegmentConfig
} from './segmented-withdrawal';
import { calculateSegmentedWithdrawal } from './withdrawal';

describe('Segmented Withdrawal', () => {
    describe('validateWithdrawalSegments', () => {
        test('should validate correct segments with no gaps', () => {
            const segments = [
                createDefaultWithdrawalSegment('seg1', 'Phase 1', 2040, 2050),
                createDefaultWithdrawalSegment('seg2', 'Phase 2', 2051, 2060),
                createDefaultWithdrawalSegment('seg3', 'Phase 3', 2061, 2070)
            ];
            
            const errors = validateWithdrawalSegments(segments, 2040, 2070);
            expect(errors).toEqual([]);
        });

        test('should detect gaps between segments', () => {
            const segments = [
                createDefaultWithdrawalSegment('seg1', 'Phase 1', 2040, 2050),
                createDefaultWithdrawalSegment('seg2', 'Phase 2', 2052, 2060) // Gap: 2051 missing
            ];
            
            const errors = validateWithdrawalSegments(segments, 2040, 2060);
            expect(errors).toContain('Lücke zwischen Segment "Phase 1" und "Phase 2"');
        });

        test('should detect overlapping segments', () => {
            const segments = [
                createDefaultWithdrawalSegment('seg1', 'Phase 1', 2040, 2055),
                createDefaultWithdrawalSegment('seg2', 'Phase 2', 2053, 2060) // Overlap: 2053-2055
            ];
            
            const errors = validateWithdrawalSegments(segments, 2040, 2060);
            expect(errors).toContain('Überlappung zwischen Segment "Phase 1" und "Phase 2"');
        });

        test('should detect incorrect start year', () => {
            const segments = [
                createDefaultWithdrawalSegment('seg1', 'Phase 1', 2041, 2060) // Should start at 2040
            ];
            
            const errors = validateWithdrawalSegments(segments, 2040, 2060);
            expect(errors).toContain('Erstes Segment muss im Jahr 2040 beginnen');
        });

        test('should detect incorrect end year', () => {
            const segments = [
                createDefaultWithdrawalSegment('seg1', 'Phase 1', 2040, 2059) // Should end at 2060
            ];
            
            const errors = validateWithdrawalSegments(segments, 2040, 2060);
            expect(errors).toContain('Letztes Segment muss im Jahr 2060 enden');
        });

        test('should detect invalid segment with end before start', () => {
            const segment = createDefaultWithdrawalSegment('seg1', 'Phase 1', 2050, 2040);
            // Manually set endYear to be before startYear
            segment.endYear = 2040;
            segment.startYear = 2050;
            
            const segments = [segment];
            
            const errors = validateWithdrawalSegments(segments, 2040, 2060);
            expect(errors.some(error => error.includes('Endjahr kann nicht vor Startjahr liegen'))).toBe(true);
        });

        test('should require at least one segment', () => {
            const errors = validateWithdrawalSegments([], 2040, 2060);
            expect(errors).toContain('Mindestens ein Segment ist erforderlich');
        });
    });

    describe('createDefaultWithdrawalSegment', () => {
        test('should create segment with correct defaults', () => {
            const segment = createDefaultWithdrawalSegment('test', 'Test Phase', 2040, 2050);
            
            expect(segment.id).toBe('test');
            expect(segment.name).toBe('Test Phase');
            expect(segment.startYear).toBe(2040);
            expect(segment.endYear).toBe(2050);
            expect(segment.strategy).toBe('4prozent');
            expect(segment.returnConfig.mode).toBe('fixed');
            expect(segment.returnConfig.fixedRate).toBe(0.05);
            expect(segment.inflationConfig?.inflationRate).toBe(0.02);
            expect(segment.enableGrundfreibetrag).toBe(false);
        });
    });

    describe('createSingleSegmentConfig', () => {
        test('should create single segment configuration', () => {
            const config = createSingleSegmentConfig(
                '3prozent',
                { mode: 'fixed', fixedRate: 0.04 },
                2040,
                2060
            );
            
            expect(config.segments).toHaveLength(1);
            expect(config.segments[0].strategy).toBe('3prozent');
            expect(config.segments[0].returnConfig.fixedRate).toBe(0.04);
            expect(config.segments[0].startYear).toBe(2040);
            expect(config.segments[0].endYear).toBe(2060);
            expect(config.taxRate).toBe(0.26375);
        });
    });

    describe('calculateSegmentedWithdrawal', () => {
        test('should calculate withdrawal for single segment', () => {
            const config = createSingleSegmentConfig(
                '4prozent',
                { mode: 'fixed', fixedRate: 0.05 },
                2040,
                2042 // 3 years for simple test
            );
            
            const result = calculateSegmentedWithdrawal(100000, config);
            
            // Should have results for all years
            expect(result[2040]).toBeDefined();
            expect(result[2041]).toBeDefined();
            expect(result[2042]).toBeDefined();
            
            // Check 4% withdrawal rule
            expect(result[2040].entnahme).toBeCloseTo(4000, 0); // 4% of 100,000
            expect(result[2040].startkapital).toBe(100000);
            expect(result[2040].endkapital).toBeGreaterThan(0);
        });

        test('should calculate withdrawal for multiple segments with different strategies', () => {
            const segment1 = createDefaultWithdrawalSegment('early', 'Early Retirement', 2040, 2041);
            segment1.strategy = '4prozent';
            segment1.returnConfig = { mode: 'fixed', fixedRate: 0.05 };
            
            const segment2 = createDefaultWithdrawalSegment('later', 'Later Retirement', 2042, 2043);
            segment2.strategy = '3prozent';
            segment2.returnConfig = { mode: 'fixed', fixedRate: 0.03 };
            
            const config = {
                segments: [segment1, segment2],
                taxRate: 0.26375
            };
            
            const result = calculateSegmentedWithdrawal(100000, config);
            
            // Should have results for all years
            expect(result[2040]).toBeDefined();
            expect(result[2041]).toBeDefined();
            expect(result[2042]).toBeDefined();
            expect(result[2043]).toBeDefined();
            
            // First segment should use 4% rule
            expect(result[2040].entnahme).toBeCloseTo(4000, 0);
            
            // Second segment should use 3% rule (but based on remaining capital)
            const remainingCapitalForSegment2 = result[2041].endkapital;
            expect(result[2042].entnahme).toBeCloseTo(remainingCapitalForSegment2 * 0.03, 0);
        });

        test('should handle capital depletion', () => {
            // Create scenario where capital depletes quickly
            const segment = createDefaultWithdrawalSegment('test', 'Test', 2040, 2042);
            segment.strategy = '4prozent';
            segment.returnConfig = { mode: 'fixed', fixedRate: 0.01 }; // Very low return
            
            const config = {
                segments: [segment],
                taxRate: 0.26375
            };
            
            const result = calculateSegmentedWithdrawal(1000, config); // Very small starting capital
            
            // Should have some years before depletion
            expect(result[2040]).toBeDefined();
            
            // With 4% withdrawal on 1000€ capital and only 1% returns,
            // the capital should decline significantly
            expect(result[2040].entnahme).toBeCloseTo(40, 0); // 4% of 1000
            expect(result[2040].endkapital).toBeLessThan(1000); // Should decline
        });
    });
});