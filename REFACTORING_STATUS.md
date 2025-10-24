# Max-Lines-Per-Function Refactoring Status

## Overview

This document tracks the progress of refactoring all functions that violate the ESLint `max-lines-per-function` rule (max 50 lines).

## Current Status

- **Initial violations**: 140
- **Violations fixed**: 9
- **Remaining violations**: 131
- **Progress**: 6.4%

## Completed Refactorings

### Helper/Utility Functions (1 fixed)

1. ✅ `helpers/health-care-insurance.ts` - `calculateCoupleHealthInsuranceForYear` (108→45 lines)
   - Extracted: `calculateCoupleIncomes`, `calculateFamilyQualifications`, `calculateIndividualResults`, `calculateCoupleInsuranceData`, `prepareStrategyData`, `buildStrategyComparison`, `buildFamilyInsuranceDetails`

### Configuration Components (8 fixed)

2. ✅ `src/components/KapitalerhaltConfiguration.tsx` - `NominalReturnSlider` (51→43 lines)
3. ✅ `src/components/KapitalerhaltConfiguration.tsx` - `InflationRateSlider` (51→43 lines)
4. ✅ `src/components/CareCostConfiguration.tsx` - `CareCostConfigFields` (71→48 lines)
5. ✅ `src/components/GenderConfiguration.tsx` - `CoupleGenderSelection` (63→24 lines)
6. ✅ `src/components/MonthlyFixedWithdrawalConfiguration.tsx` - Main component (71→20 lines)
7. ✅ `src/components/BlackSwanEventConfiguration.tsx` - `EventDetails` (61→28 lines)
8. ✅ `src/components/BucketStrategyConfiguration.tsx` - Main component (62→36 lines)
9. ✅ `src/components/LifeExpectancyTableConfiguration.tsx` - Main component (66→29 lines)

## Remaining Violations by Category

### Critical Priority (>200 lines) - 12 violations

These are the largest functions requiring the most complex refactoring:

- `helpers/withdrawal.tsx` - `processYearlyWithdrawal` (238 lines)
- `src/components/ProfileManagement.tsx` - `ProfileManagement` (380 lines)
- `src/hooks/useHealthCareInsuranceHandlers.ts` (381 lines)
- `src/hooks/useWithdrawalCalculations.ts` (305 lines)
- Various large arrow functions in configuration components (298, 271, 260, 242, 241, 240 lines)

### High Priority (151-200 lines) - 14 violations

Medium-large functions that would benefit from extraction:

- Configuration components
- Display components
- Complex hooks

### Medium Priority (101-150 lines) - 40 violations

Functions with moderate complexity that could be split:

- Form components
- Display logic
- Calculation helpers

### Low Priority (76-100 lines) - 29 violations

Functions slightly over the limit:

- Configuration forms
- Display helpers
- Utility functions

### Minimal Priority (51-75 lines) - 36 violations

Functions barely over the limit, easiest to fix:

- Small component helpers
- Simple configuration logic
- Display formatters

## Refactoring Patterns Applied

### Pattern 1: Extract Configuration Sections

**Example**: `MonthlyFixedWithdrawalConfiguration`

- Split UI sections into separate components
- Each section handles its own state updates
- Main component becomes a composition

### Pattern 2: Extract Helper Functions

**Example**: `calculateCoupleHealthInsuranceForYear`

- Extract calculation logic into named functions
- Group related operations
- Improve readability and testability

### Pattern 3: Extract Display Components

**Example**: `BlackSwanEventConfiguration`

- Split conditional rendering into separate components
- Each component handles its own display logic
- Reduces nesting and improves clarity

### Pattern 4: Extract Mode Logic into Custom Hooks

**Example**: `BucketStrategyConfiguration`

- Move mode determination into custom hooks
- Centralize logic for form vs direct mode
- Simplify main component

## Recommendations for Continuing

### Batch Processing Approach

Group similar violations and apply consistent patterns:

1. **Configuration Sliders**: Apply same pattern as KapitalerhaltConfiguration
2. **Form Fields**: Extract field groups into separate components
3. **Display Sections**: Split conditional rendering into components
4. **Mode Handling**: Extract into custom hooks where appropriate

### Priority Order

1. Fix critical violations first (>200 lines) - highest impact
2. Batch process similar patterns in medium/low violations
3. Clean up minimal violations last (quick wins)

### Estimated Effort

- Critical violations: 2-4 hours each (24-48 hours total)
- High priority: 1-2 hours each (14-28 hours total)
- Medium priority: 30-60 minutes each (20-40 hours total)
- Low priority: 15-30 minutes each (7-15 hours total)
- Minimal: 10-15 minutes each (6-9 hours total)

**Total estimated effort**: 71-140 hours for complete refactoring

## Testing Strategy

- Run full test suite after each refactoring batch
- Verify no functionality changes
- Check for style/lint issues immediately
- Manual UI validation for critical components

## Notes

- All refactorings maintain existing functionality
- No breaking changes to public APIs
- Test coverage remains at 2026 passing tests
- Code quality improves with each refactoring
