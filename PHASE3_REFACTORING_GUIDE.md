# Phase 3 Refactoring - Implementation Guide

## Summary of Completed Refactorings

### Successful Patterns Applied

1. **Extract Handler Logic into Custom Hooks**
   - Example: `useScenarioHandler` extracted 65 lines of scenario application logic
   - Pattern: Move complex event handlers and callback logic into reusable hooks
   - Benefits: Improved testability, code reuse, cleaner component structure

2. **Extract Configuration Builders into Custom Hooks**
   - Example: `useReturnConfig` extracted 40 lines of configuration building logic
   - Pattern: Move complex `useMemo` calculations into dedicated hooks
   - Benefits: Reduced cognitive load, easier to test, better separation of concerns

3. **Extract Utility Functions for Calculations**
   - Example: `calculatePhaseDateRanges` extracted date range logic
   - Pattern: Pure functions for calculations that don't need React context
   - Benefits: Highly testable, reusable across components

4. **Extract Display Components**
   - Example: `SavingsPhaseOverview` and `WithdrawalPhaseOverview` extracted 237 lines of JSX
   - Pattern: Move logical UI sections into separate, well-typed components
   - Benefits: Better readability, easier maintenance, component reuse

## Recommended Approach for Remaining Components

### For Components with Complex Logic (InteractiveChart, SimulationProvider, etc.)

**Step 1: Identify Extraction Candidates**
- Look for:
  - Large `useMemo` blocks → Extract into custom hooks
  - Complex event handlers → Extract into custom hooks
  - Repeated calculation logic → Extract into utility functions
  - Large JSX sections (>30 lines) → Extract into sub-components

**Step 2: Prioritize Extractions**
1. Start with custom hooks (easiest to test independently)
2. Then utility functions (pure, no dependencies)
3. Finally sub-components (maintain component hierarchy)

**Step 3: Implement and Test**
- Create comprehensive tests for each extraction
- Run tests after each extraction
- Ensure no functionality is lost

### For Display Components (EntnahmeSimulationDisplay, SegmentedWithdrawalComparisonDisplay, etc.)

**Step 1: Identify UI Sections**
- Look for logical groupings in JSX (different phases, different modes, summary sections)
- Each section with >20 lines is a candidate for extraction

**Step 2: Extract Sub-Components**
- Create well-typed interfaces for props
- Keep components focused on single responsibility
- Maintain consistent styling and structure

**Step 3: Validate**
- Ensure all data flows correctly through props
- Check for any lost interactivity or state

### For Configuration Components (HistoricalReturnConfiguration, etc.)

**Step 1: Separate Form Logic from Display**
- Extract form handling into custom hooks
- Extract validation logic into utilities
- Keep display components simple

**Step 2: Create Focused Sub-Components**
- Individual field components
- Validation message components
- Summary/preview components

## Testing Strategy

### Custom Hooks
```typescript
// Use renderHook from @testing-library/react
import { renderHook, act } from '@testing-library/react'

describe('useCustomHook', () => {
  it('should handle state changes', () => {
    const { result } = renderHook(() => useCustomHook())
    act(() => {
      result.current.updateValue('new value')
    })
    expect(result.current.value).toBe('new value')
  })
})
```

### Utility Functions
```typescript
// Simple unit tests
describe('utilityFunction', () => {
  it('should calculate correctly', () => {
    const result = utilityFunction(input)
    expect(result).toBe(expected)
  })
})
```

### Components
```typescript
// Use existing component testing patterns
import { render, screen } from '@testing-library/react'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component {...props} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## Validation Checklist for Each Refactoring

- [ ] **Code Reduction**: Component/function under 200 lines ✓
- [ ] **Tests Added**: New tests for extracted code ✓
- [ ] **All Tests Pass**: `npm run test` passes ✓
- [ ] **Linting Clean**: `npm run lint` passes ✓
- [ ] **Build Success**: `npm run build` succeeds ✓
- [ ] **Type Safety**: No new TypeScript errors ✓
- [ ] **Functionality Preserved**: Manual testing confirms no regressions ✓

## Common Pitfalls to Avoid

1. **Over-extraction**: Don't create components/hooks that are too small (< 10 lines)
2. **Breaking Props**: Ensure all required data is passed through props
3. **Lost State**: Watch for useState/useEffect dependencies when extracting
4. **Type Safety**: Always define proper TypeScript interfaces for props
5. **Test Coverage**: Don't skip testing extracted code

## Next Components to Refactor

Priority order based on size and complexity:

1. **InteractiveChart** (249 lines) - Chart rendering and interaction logic
2. **SimulationProvider** (248 lines) - Context provider with complex state
3. **EntnahmeSimulationsAusgabe** (247 lines) - Already partially refactored, needs more
4. **SegmentedWithdrawalComparisonDisplay** (240 lines) - Display component with tables
5. **CareCostConfiguration** (236 lines) - Form configuration component
6. **EntnahmeSimulationDisplay** (226 lines) - Display component  
7. **HistoricalReturnConfiguration** (224 lines) - Form configuration
8. **WithdrawalReturnModeConfiguration** (223 lines) - Form configuration
9. **WithdrawalYearCard** (220 lines) - Display card component
10. **HealthInsuranceCostPreview** (213 lines) - Preview component

## Estimated Time per Component

- Simple display components (3-4 hours each)
- Complex logic components (5-6 hours each)
- Configuration components (4-5 hours each)

**Total estimated time**: ~40-50 hours of focused refactoring work

## Success Metrics

- All 12 components under 200 lines
- At least 95% test coverage for extracted code
- Zero regression in functionality
- All builds and tests passing
- Code quality improved (better separation of concerns, easier to maintain)
