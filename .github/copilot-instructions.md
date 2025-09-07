# Zinseszins-Simulation (Compound Interest Calculator)

Zinseszins-Simulation is a German compound interest calculator built with Vite, React 19, TypeScript, and RSuite UI components. The application simulates investment growth over time, including German tax considerations (Vorabpauschale, Freibetrag), savings plans, withdrawal strategies, Monte Carlo analysis, and advanced return configurations.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Documentation Requirements

**When implementing new or changed features, always update the README.md to reflect these changes.** Document new functionality clearly in the appropriate sections without using "Neu" or similar markers - integrate them naturally into the existing documentation structure.

## Working Effectively

### Setup and Build Process
- **Install dependencies**: `npm install` -- takes 1-2 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
  - Expect peer dependency warnings about React version mismatches - these are normal due to React 19 upgrade
  - Will show 7 moderate severity vulnerabilities - this is expected and doesn't block development
  - Uses standard npm package resolution
- **Build the application**: `npm run build` -- takes 3-5 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Will show Vite build output - expected behavior
  - Uses Vite for fast bundling and optimization
- **Type checking**: `npm run typecheck` -- takes 10-15 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Expect no TypeScript errors - application functions correctly
  - Main application code is well-typed
- **Development server**: `npm run dev` -- starts in 5-6 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Runs on http://localhost:5173 (Vite default port)
  - Hot module reloading works correctly
  - Will show Vite development server output
- **Testing**: `npm run test` -- runs 106 tests across 11 files in ~1 second
  - All tests should pass
  - Uses Vitest for testing

### Known Issues and Workarounds
- **ESLint Configuration**: Uses modern ESLint with flat config (eslint.config.js)
  - Basic configuration supports JavaScript and TypeScript files
  - Linting works correctly with max 10 warnings allowed
- **React 19 Compatibility**: Updated to React 19 
  - All functionality works correctly
  - Uses standard npm package resolution
- **TypeScript**: Well-typed application with no errors

## Validation and Testing

### Manual Validation Requirements
After making changes, ALWAYS test the complete user workflow:

1. **Start the application**: `npm run dev`
2. **Navigate to http://localhost:5173** and verify the page loads
3. **Test core functionality**:
   - Verify the main calculator loads with default values (24,000€/year, 5% return, 2023-2040 timespan)
   - Confirm end capital shows approximately 596,168.79 €
   - Expand "Sparpläne erstellen" section and verify form fields appear
   - Test the return rate slider (Rendite) - should update calculations in real-time
   - Test different return modes (Fixed, Random, Variable)
   - Verify the year-by-year breakdown table shows investment progression
   - Check that the simulation section displays detailed year-by-year data with Vorabpauschale calculations

4. **Test interactive features**:
   - Change the time span slider and verify calculations update
   - Switch between "jährlich" (yearly) and "monatlich" (monthly) calculation modes
   - Expand/collapse different sections (Entnahme, Monte Carlo Analyse, Simulation)
   - Test withdrawal strategies in the "Entnahme" section
   - Verify Monte Carlo analysis functionality
   - Test tax configuration changes (Kapitalertragsteuer, Teilfreistellungsquote)
   - Test configurable tax allowances per year

### Essential Commands for Development
- `npm run dev` - Start development server (never cancel, wait for startup)
- `npm run build` - Build for production (6-7 seconds, never cancel)
- `npm run typecheck` - Run TypeScript checks (expect errors, but useful for new code)

### Validation Scenarios
- **Calculator accuracy**: Default scenario (24,000€ annual savings, 5% return, 2023-2040) should show ~596,169€ final capital
- **Real-time updates**: Changing any input should immediately update all calculations and tables
- **UI responsiveness**: All collapsible sections should expand/collapse smoothly
- **No runtime errors**: Browser console should only show Vercel Analytics warnings and React DevTools suggestion (expected)

## Codebase Navigation

### Key Application Files
- **`src/pages/HomePage.tsx`** - Main application page with all UI components and state management
- **`src/utils/simulate.ts`** - Core compound interest calculation logic with German tax considerations
- **`helpers/steuer.tsx`** - German tax calculation utilities (Vorabpauschale, Freibetrag)

### UI Components
- **`src/components/SparplanEingabe.tsx`** - Savings plan input forms and management
- **`src/components/SparplanSimulationsAusgabe.tsx`** - Results display tables and summaries
- **`src/components/EntnahmeSimulationsAusgabe.tsx`** - Withdrawal phase planning interface
- **`src/components/Zeitspanne.tsx`** - Time range selection component

### Configuration Files
- **`package.json`** - Dependencies and scripts with test scripts defined
  - Uses React 19, ESLint 8, Vite 5, TypeScript 5.9.2, Vitest 2
  - Standard npm package resolution
- **`vite.config.ts`** - Vite configuration for development and build
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint flat configuration

## Development Patterns

### State Management
- Uses React hooks (useState, useEffect, useCallback) for local state
- Client-side calculations with immediate updates
- No external state management library

### Styling and UI
- **RSuite components** for UI (Tables, Forms, Panels, Sliders)
- **CSS**: Uses `rsuite/dist/rsuite.min.css` - imported in components
- **Icons**: RSuite icons work correctly

### API and Data Flow
- All calculations performed client-side for real-time responsiveness
- Form data processed directly in React components
- No server-side calculation endpoints

## German Financial Features

### Tax Calculations
- **Vorabpauschale**: Advance lump-sum taxation on investment funds with detailed base interest calculations
- **Freibetrag**: Configurable annual tax allowances per year (default 2,000€)
- **Kapitalertragsteuer**: Configurable capital gains tax (default 26.375%)
- **Teilfreistellungsquote**: Configurable partial exemption for equity funds (default 30% for stock funds)
- **Grundfreibetrag**: Income tax basic allowance for retirees without additional income

### Investment Types and Return Configurations
- **Sparplan**: Regular savings plans with monthly/yearly contributions
- **Einmalzahlung**: One-time lump sum investments with date and amount specification
- **Return Modes**:
  - **Fixed Return**: Simple fixed annual return rate
  - **Random Return**: Monte Carlo simulation with configurable average return and volatility
  - **Variable Return**: Year-by-year configurable returns for realistic scenarios

### Withdrawal Strategies
- **4% Rule**: Annual withdrawal of 4% of starting capital
- **3% Rule**: Annual withdrawal of 3% of starting capital  
- **Variable Percentage**: Custom withdrawal percentages
- **Monthly Fixed Withdrawal**: Fixed monthly amounts with inflation adjustment and portfolio guardrails
- **Variable Returns during Withdrawal**: Year-by-year configurable returns for withdrawal phase

## Common Development Tasks

### Adding New Features
1. **Always run `npm run dev` first** to ensure baseline functionality
2. **Run tests with `npm run test`** to verify existing functionality
3. **Update both calculation logic** (helpers/ or src/utils/) and UI components
4. **Validate with complete user scenarios** - don't just test isolated changes

### Debugging Issues
1. **Check browser console** for runtime errors (ignore Vercel Analytics warnings)
2. **Run tests** to verify calculation logic
3. **Test with different input values** to isolate calculation vs UI issues
4. **Use TypeScript errors** - most should be resolved in main application code

### Performance Considerations
- Calculations run client-side for immediate responsiveness
- Real-time updates on every input change - calculations are fast
- Large year ranges render efficiently

## Deployment Information
- **Production URL**: https://zinszins-simulation.vercel.app/
- **Platform**: Vercel (configured for Vite/React deployment)
- **Build**: Uses Vite build process (`npm run build`)
- **Analytics**: Vercel Analytics integrated (causes expected console warnings)

## Project Context
This is a personal finance tool focused on German tax law and investment planning. The application helps users:
- Plan long-term investment strategies
- Understand compound interest effects
- Calculate German tax implications on investments
- Model different savings and withdrawal scenarios
- Make informed financial planning decisions

**Author**: Marco (see footer in application)

## Development Workflow with Code Review

When making changes to this codebase, follow this complete workflow to ensure high-quality, reliable code:

**IMPORTANT: The following instructions about testing are not optional. They are the most critical part of the workflow.**

### Component Refactoring Best Practices

When components become too large (> 500-800 lines), follow this refactoring approach:

#### 1. Extract Display Components
- **Extract simulation/results display** into separate components (e.g., `EntnahmeSimulationDisplay.tsx`)
- **Keep display logic together**: Move related UI rendering, formatting, and presentation logic together
- **Maintain component interfaces**: Ensure props are well-typed and focused on what the component needs
- **Example pattern**: `ComponentNameDisplay.tsx` for rendering logic, `ComponentNameConfig.tsx` for configuration forms

#### 2. Extract Business Logic into Custom Hooks
- **Configuration management**: Extract state and config management into `useComponentConfig` hooks
- **Calculation logic**: Extract complex calculations into `useComponentCalculations` hooks  
- **Modal/UI state**: Extract modal and interaction state into `useComponentModals` hooks
- **Keep simple useState**: Don't extract trivial state management - focus on complex logic

#### 3. Extract Utility Functions
- **Pure functions**: Extract formatting, validation, and transformation functions
- **Currency formatting**: Use shared `formatCurrency` utility from `src/utils/currency.ts`
- **Helper functions**: Extract helper functions that don't need React context

#### 4. Maintain Test Coverage
- **Test extracted components**: Each new component needs comprehensive tests
- **Test custom hooks**: Use `renderHook` to test custom hooks in isolation
- **Test utility functions**: Unit test pure functions thoroughly
- **Integration tests**: Ensure the refactored components work together correctly

#### 5. Refactoring Process
1. **Identify extraction boundaries**: Look for distinct UI sections or logical groupings
2. **Extract in small steps**: Start with one component or hook at a time
3. **Test after each extraction**: Ensure functionality remains intact
4. **Update imports gradually**: Fix import paths and dependencies systematically
5. **Run full test suite**: Verify no regressions have been introduced

#### Example Refactoring (EntnahmeSimulationsAusgabe)
```typescript
// Before: 2463 lines in one file
export function EntnahmeSimulationsAusgabe() {
  // All logic mixed together
}

// After: Separated into focused pieces
export function EntnahmeSimulationsAusgabe() {
  // Use custom hooks for logic
  const { currentConfig, updateConfig } = useWithdrawalConfig();
  const { withdrawalData } = useWithdrawalCalculations();
  const { handleModalClick } = useWithdrawalModals();
  
  return (
    <>
      {/* Configuration forms */}
      <Panel>...</Panel>
      
      {/* Extracted display component */}
      <EntnahmeSimulationDisplay
        withdrawalData={withdrawalData}
        onCalculationInfoClick={handleModalClick}
      />
    </>
  );
}
```

This approach resulted in:
- Main component: 2463 → 1131 lines (54% reduction)
- Better separation of concerns
- Easier testing and maintenance
- Reusable components and logic

### Development Workflow Steps

1. **Development Phase**
   - Implement your changes following the guidelines above
   - Make minimal, focused changes that address the specific requirements
   - Follow existing code patterns and architectural decisions
   - Update documentation (README.md) when implementing new features

2. **Testing and Linting Phase - MANDATORY**
   - **No Exceptions:** For **every single change or addition** of a feature, corresponding tests **must** be added or adapted. This is a mandatory requirement for every pull request.
   - **Run all tests:** `npm run test` (should pass all 138+ tests). If you add new features, add new tests. If you change features, adapt existing tests.
   - **Run linting:** `npm run lint` (should pass with max 10 warnings)
   - **Run type checking:** `npm run typecheck` (expect minimal errors)
   - **Run build:** `npm run build` (should complete successfully)
   - **If any errors are found**: Fix them and return to step 1. Do not proceed if tests are failing.

3. **Code Review Phase**
   - Review all changes thoroughly before finalizing
   - **Crucially, verify that the testing requirements have been met.**
   - Check for code quality, maintainability, and adherence to project standards
   - Verify changes align with German financial requirements and tax calculations
   - Ensure no unintended side effects or regressions
   - **If issues are found**: Return to step 1 with feedback

4. **Manual Validation Phase**
   - Start the development server: `npm run dev`
   - Test the complete user workflow as documented in "Manual Validation Requirements"
   - Verify all interactive features work correctly
   - Check browser console for new errors (ignore expected Vercel Analytics warnings)
   - Take screenshots of any UI changes to document the impact

### Code Review Guidelines

When performing code review, examine the following aspects:

#### Code Quality & Standards
- **Minimal Changes**: Are changes surgical and focused? Avoid unnecessary modifications
- **TypeScript**: Are types properly defined? No `any` types without justification
- **React Patterns**: Proper use of hooks, state management, and component structure
- **Performance**: No unnecessary re-renders or expensive calculations
- **Error Handling**: Appropriate error handling for user inputs and edge cases

#### German Financial Logic
- **Tax Calculations**: Vorabpauschale, Freibetrag, and Kapitalertragsteuer correctly implemented
- **Currency Formatting**: Proper Euro formatting and number handling
- **Date Handling**: Correct German date formats and year-based calculations
- **Investment Logic**: Accurate compound interest, withdrawal strategies, and return configurations

#### User Experience
- **UI Consistency**: RSuite components used appropriately and consistently
- **Responsiveness**: Mobile and desktop layouts work correctly
- **Real-time Updates**: Changes reflect immediately in calculations and displays
- **German Language**: Proper German terminology and user-facing text

#### Testing & Documentation
- **Test Coverage**: **Is there sufficient test coverage for the new functionality? This is not a suggestion, it is a requirement.**
- **Documentation Updates**: README.md updated for new features
- **Code Comments**: Complex German tax calculations are well documented
- **Backwards Compatibility**: Changes don't break existing functionality

### Code Review Checklist

Before approving changes, verify:

- [ ] **All tests pass (`npm run test`) - This is the most important check.**
- [ ] Linting passes (`npm run lint`) 
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing confirms functionality works
- [ ] Changes are minimal and focused
- [ ] German financial calculations are accurate
- [ ] UI/UX remains consistent and responsive
- [ ] Documentation is updated appropriately
- [ ] No unintended side effects or regressions
- [ ] Code follows existing patterns and standards

### When Issues Are Found

If the code review identifies problems:

1. Document the specific issues clearly
2. Provide actionable feedback for improvement
3. Return to Development Phase (step 1) to address the feedback
4. Repeat the entire workflow until all issues are resolved

This iterative approach ensures high-quality, maintainable code that serves users effectively while maintaining the application's reliability and accuracy.