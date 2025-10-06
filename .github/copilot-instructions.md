# Zinseszins-Simulation (Compound Interest Calculator)

Zinseszins-Simulation is a German compound interest calculator built with Vite, React 19, TypeScript, and modern UI components (shadcn/ui with Tailwind CSS). The application simulates investment growth over time, including German tax considerations (Vorabpauschale, Freibetrag), savings plans, withdrawal strategies, Monte Carlo analysis, and advanced return configurations.

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
- **Testing**: `npm run test` -- runs 578 tests across 77 files in ~32 seconds
  - All tests should pass
  - Uses Vitest for testing
  - Comprehensive test coverage including integration, component, and utility tests

### Known Issues and Workarounds
- **ESLint Configuration**: Uses modern ESLint with flat config (eslint.config.js)
  - Basic configuration supports JavaScript and TypeScript files
  - Linting works correctly with max 0 warnings enforced
- **React 19 Compatibility**: Updated to React 19 
  - All functionality works correctly
  - Uses standard npm package resolution
- **TypeScript**: Well-typed application with no errors
- **UI Framework**: **shadcn/ui components** - Migration from RSuite to shadcn/ui is **COMPLETE**
  - All user-facing components use modern shadcn/ui components
  - New components should use shadcn/ui components from `src/components/ui/`
  - No legacy RSuite components remain in the codebase

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
   - Expand/collapse different sections (Entnahme, Monte Carlo Analyse, Simulation, Daten Export)
   - Test withdrawal strategies in the "Entnahme" section
   - Verify Monte Carlo analysis functionality
   - Test tax configuration changes (Kapitalertragsteuer, Teilfreistellungsquote)
   - Test configurable tax allowances per year
   - Test data export functionality (Parameter export, CSV export, Markdown export)
   - Verify sticky overview navigation shows correct metrics

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
- **`src/components/StickyOverview.tsx`** - Navigation overview component with key metrics
- **`src/components/DataExport.tsx`** - Comprehensive data export functionality
- **`src/components/ui/`** - Modern shadcn/ui components (cards, buttons, inputs, etc.)

### Configuration Files
- **`package.json`** - Dependencies and scripts with test scripts defined
  - Uses React 19, ESLint 9, Vite 5, TypeScript 5.9.2, Vitest 2
  - Migrating from RSuite to shadcn/ui components
  - Lucide React icons for modern iconography
  - Standard npm package resolution
- **`vite.config.ts`** - Vite configuration for development and build
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint flat configuration
- **`components.json`** - shadcn/ui configuration for component generation

## Development Patterns

### State Management
- Uses React hooks (useState, useEffect, useCallback) for local state
- Client-side calculations with immediate updates
- No external state management library

### HTML ID Management - CRITICAL REQUIREMENT
**NEVER create duplicate HTML IDs** - this violates HTML standards and causes accessibility issues.

#### Mandatory Guidelines:
- **Use unique ID utility functions** from `src/utils/unique-id.ts` for all form elements
- **Always import and use**: `generateFormId()`, `generateInstanceId()`, or `generateUniqueId()`
- **Use `useMemo`** to ensure stable IDs within component lifecycle
- **Apply context-specific prefixes** to distinguish between component instances

#### Required Implementation Pattern:
```typescript
import { generateFormId } from '../utils/unique-id'

export function MyComponent() {
  // Generate unique IDs for each form field
  const enabledSwitchId = useMemo(() => generateFormId('component-name', 'enabled'), [])
  const monthlyAmountId = useMemo(() => generateFormId('component-name', 'monthly-amount'), [])
  
  return (
    <>
      <Switch id={enabledSwitchId} />
      <Label htmlFor={enabledSwitchId}>Enable</Label>
      
      <Input id={monthlyAmountId} />
      <Label htmlFor={monthlyAmountId}>Monthly Amount</Label>
    </>
  )
}
```

#### For Multi-Instance Components:
```typescript
// When component may be rendered multiple times
const uniqueId = useMemo(() => generateFormId('component', 'field', instanceContext), [instanceContext])
```

#### Validation Requirements:
- **Test for duplicates**: Run `find . -name "*.tsx" | xargs grep -h "id=" | grep -o 'id="[^"]*"' | sort | uniq -c | sort -nr | grep -E "^\s*[2-9]"`
- **All tests must pass** after implementing unique IDs
- **Manual testing required** to ensure accessibility is maintained

## UI Framework Migration

**Current Status:** **MIGRATION COMPLETED** - Successfully migrated from RSuite to shadcn/ui

The project has been successfully migrated from RSuite to shadcn/ui components:
- **Primary UI Framework**: **shadcn/ui components** - Modern, accessible UI components built on Radix UI
  - **Component Library**: Use components from `src/components/ui/` directory
  - **Migration Status**: **COMPLETE** - All visible UI components migrated
  - **RadioTile Components**: Custom RadioTile built on shadcn/ui RadioGroup
  - **Card Components**: All Panel components migrated to shadcn/ui Card
  - **Button Components**: All Button components migrated to shadcn/ui Button
  - **Interactive Components**: All user-facing components fully functional
- **CSS Framework**: Uses Tailwind CSS utility classes exclusively
  - **NO new CSS classes**: Never create custom CSS classes or styles in separate CSS files
  - **Tailwind only**: Use only Tailwind CSS utility classes for all styling needs
  - **Index.css**: Contains only Tailwind imports, CSS reset, and essential global styles
- **Icons**: **Lucide React** icons (modern, consistent iconography)
  - Import from `lucide-react` package
  - Use semantic icon names (ChevronDown, ChevronUp, Download, etc.)
- **Legacy Compatibility**: 
  - **Migration Complete**: All RSuite components have been fully migrated to shadcn/ui
  - **All UI Components**: User-facing components use shadcn/ui exclusively

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

#### Implementing New Withdrawal Strategies

**IMPORTANT:** When implementing new withdrawal (Entnahme) strategies, they must be implemented in **BOTH** systems to ensure complete user flexibility:

1. **Unified Strategy System** (`einheitlichen Strategie`):
   - Single strategy applied to the entire withdrawal phase
   - Implementation in unified strategy configurations and calculations
   - Used when users want consistent strategy throughout retirement

2. **Segmented Withdrawal System** (`geteilten Entsparphasen`):  
   - Different strategies for different time periods/life phases
   - Implementation in segmented strategy configurations and calculations
   - Allows users to model changing needs (e.g., active retirement vs. care phase)

3. **Comparison Systems**:
   - **Unified Comparisons**: Compare different strategies as single approaches
   - **Segmented Comparisons**: Compare different segmented withdrawal plans
   - Both comparison systems must support the new strategy

**Architecture Requirements for New Strategies:**
- Add strategy type to `WithdrawalStrategy` union type in `helpers/withdrawal.tsx`
- Implement calculation logic in withdrawal helper functions
- Add configuration components for both unified and segmented contexts
- Add strategy to comparison displays for both systems
- Add comprehensive tests for all contexts (unified, segmented, comparisons)
- Update strategy display names in helper functions

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

### Current Development Status
- **UI Migration: COMPLETED** - Successfully migrated from RSuite to shadcn/ui
- **Modern Component Library**: All user-facing components use shadcn/ui
- **Comprehensive Testing**: 578 tests across 77 files ensure reliability
- **Enhanced User Experience**: Sticky navigation, comprehensive data export, real-time updates
- **German Tax Compliance**: Full Vorabpauschale calculations with explanations
- **Interactive Functionality**: All RadioTile, Card, and Button components fully functional
- **Development Tools**: Use Context7 for up-to-date documentation and best practices

**Author**: Marco (see footer in application)

## Development Workflow with Code Review

**IMPORTANT: Use Context7 for Development Documentation**

When developing new features or making changes to this codebase, always use **Context7** to access up-to-date documentation and examples:

### Context7 Integration
- **Library Documentation**: Use Context7 to get current documentation for any libraries or frameworks
- **Best Practices**: Context7 provides current best practices and patterns for React 19, TypeScript, and shadcn/ui
- **Code Examples**: Get real-world examples and implementation patterns through Context7
- **Problem Solving**: Use Context7 to research solutions for complex technical challenges
- **API References**: Access the latest API documentation for dependencies and frameworks

**Always consult Context7 first** for documentation and examples before implementing new features or making architectural changes.

When making changes to this codebase, follow this complete workflow to ensure high-quality, reliable code:

**IMPORTANT: The following instructions about testing are not optional. They are the most critical part of the workflow.**

## Step-by-Step Development Approach (Teilschritt commits)

This project follows a **step-by-step commit approach** where development work is broken into discrete, focused steps that are individually implemented, tested, and committed. This approach ensures:

- **Better code quality** through focused changes
- **Easier code review** with smaller, understandable commits  
- **Progressive validation** where each step is verified before proceeding
- **Clear progress tracking** through detailed checklists
- **Reduced risk** of introducing bugs through smaller change sets

### Using the report_progress Tool

The `report_progress` tool is central to the step-by-step approach and should be used:

#### Initial Planning
- **Start with `report_progress`** to outline your complete plan as a detailed checklist
- **Break down the work** into 3-8 discrete steps that can be implemented independently
- **Use markdown checklists** with `- [ ]` for pending items and `- [x]` for completed items
- **Include "Fixes #XXX."** as the last line of the PR description

#### After Each Step
- **Use `report_progress`** immediately after completing and validating each step
- **Update the checklist** to mark the current step as completed (`- [x]`)
- **Provide a clear commit message** describing what was accomplished
- **Review the committed files** to ensure only relevant changes are included
- **Never skip this step** - every meaningful unit of work must be committed individually

#### Progress Tracking Guidelines
- **Maintain consistent checklist structure** between updates while being accurate
- **Update step descriptions** if the implementation differs from the original plan
- **Add new steps** if additional work is discovered during implementation
- **Keep stakeholders informed** with regular progress updates
- **Document any changes** in approach or scope in the progress updates

#### Example Progress Flow
```markdown
Initial Plan:
- [ ] Step 1: Analyze current implementation and identify changes needed
- [ ] Step 2: Add new utility function with comprehensive tests  
- [ ] Step 3: Update component to use new utility function
- [ ] Step 4: Update documentation and validate complete workflow

After Step 1:
- [x] Step 1: Analyze current implementation and identify changes needed
- [ ] Step 2: Add new utility function with comprehensive tests
- [ ] Step 3: Update component to use new utility function  
- [ ] Step 4: Update documentation and validate complete workflow

After Step 2:
- [x] Step 1: Analyze current implementation and identify changes needed
- [x] Step 2: Add new utility function with comprehensive tests
- [ ] Step 3: Update component to use new utility function
- [ ] Step 4: Update documentation and validate complete workflow
```

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
- **UI Components**: Prefer shadcn/ui components from `src/components/ui/` for new extractions

#### 4. Maintain Test Coverage - MANDATORY
- **Test extracted components**: Each new component needs comprehensive tests
- **Test custom hooks**: Use `renderHook` to test custom hooks in isolation
- **Test utility functions**: Unit test pure functions thoroughly
- **Integration tests**: Ensure the refactored components work together correctly
- **UI Migration Testing**: Test both shadcn/ui components and legacy RSuite compatibility
- **Fix test failures**: When components are extracted, existing tests may fail due to multiple DOM elements with same text. Use `getAllByText()` instead of `getByText()` when content appears in multiple places

#### 5. Refactoring Process - Testing & Linting at Every Step
1. **Identify extraction boundaries**: Look for distinct UI sections or logical groupings
2. **Extract in small steps**: Start with one component or hook at a time
3. **Test immediately after each extraction**: 
   - Run `npm run test` after each component extraction
   - Fix any test failures immediately before proceeding
   - Tests may fail due to duplicate content across components - update tests to handle this
4. **Lint immediately after each extraction**: 
   - Run `npm run lint` to ensure code style compliance
   - Fix any linting issues before proceeding
5. **Build verification**: Run `npm run build` to ensure TypeScript compilation works
6. **Update imports gradually**: Fix import paths and dependencies systematically
7. **Final validation**: Run full test suite and linting before considering refactoring complete

**CRITICAL: Never proceed to the next extraction if tests are failing or linting issues exist. Each step must be validated before moving forward.**

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

#### Common Testing Issues During Refactoring

**Multiple Element Error**: When components are extracted and display the same content in multiple places (e.g., base strategy summary + comparison table), tests using `getByText()` will fail:

```typescript
// ❌ This will fail if "5%" appears multiple times
expect(screen.getByText('5%')).toBeInTheDocument();

// ✅ Fix by using getAllByText() instead
expect(screen.getAllByText('5%')).toHaveLength(2);

// ✅ Or use more specific queries
expect(screen.getByText(/📊 Basis-Strategie.*5%/)).toBeInTheDocument();
```

**Common patterns that need `getAllByText()`**:
- Currency amounts (e.g., "498.000,00 €") appearing in cards + tables
- Percentages (e.g., "5%") in summaries + tables  
- Duration text (e.g., "25 Jahre", "unbegrenzt") in multiple sections
- Strategy names appearing in headers + table rows

**Always run tests after each component extraction** and fix these issues immediately before proceeding to the next extraction.

### Development Workflow Steps

The development workflow follows a **step-by-step commit approach (Teilschritt commits)** where each discrete development step is implemented, validated, and committed individually. This ensures focused, reviewable commits and better progress tracking.

#### Planning Phase
1. **Analyze the requirements** thoroughly before making any changes
2. **Break down the work** into discrete, focused steps that can be implemented independently
3. **Create an initial plan** using `report_progress` with a checklist of all identified steps
4. **Prioritize steps** to ensure dependencies are handled correctly

#### Step-by-Step Implementation
For each individual step in your plan:

1. **Development Phase**
   - Implement **only one focused change** that addresses a single step from your plan
   - Make minimal, surgical changes that address the specific step requirements
   - Follow existing code patterns and architectural decisions
   - Update documentation (README.md) when implementing new features that affect user-facing functionality

2. **Testing and Linting Phase - MANDATORY**
   - **No Exceptions:** For **every single change or addition** of a feature, corresponding tests **must** be added or adapted. This is a mandatory requirement for every step.
   - **Run all tests:** `npm run test` (should pass all 578+ tests across 77 files). If you add new features, add new tests. If you change features, adapt existing tests.
   - **Run linting:** `npm run lint` (should pass with max 10 warnings)
   - **Run type checking:** `npm run typecheck` (expect minimal errors)
   - **Run build:** `npm run build` (should complete successfully)
   - **If any errors are found**: Fix them and return to Development Phase. Do not proceed if tests are failing.

3. **Individual Step Commit**
   - **Use `report_progress`** to commit each completed step individually
   - **Update the checklist** to mark the current step as completed
   - **Provide a clear commit message** describing what was accomplished in this step
   - **Review committed files** to ensure only relevant changes are included
   - **Do not proceed** to the next step until the current step is fully committed

4. **Step Validation Phase**
   - **Manual testing:** Verify the specific functionality changed in this step works correctly
   - **Integration testing:** Ensure the step doesn't break existing functionality
   - **Check browser console** for new errors (ignore expected Vercel Analytics warnings)
   - **Take screenshots** of any UI changes to document the impact of this step

#### Final Review Phase
After all steps are completed:

5. **Comprehensive Code Review**
   - Review all changes across all commits thoroughly
   - **Crucially, verify that the testing requirements have been met for each step.**
   - Check for code quality, maintainability, and adherence to project standards
   - Verify changes align with German financial requirements and tax calculations
   - Ensure no unintended side effects or regressions across the entire change set
   - **If issues are found**: Address them in additional individual commits

6. **Complete Manual Validation**
   - Start the development server: `npm run dev`
   - Test the complete user workflow as documented in "Manual Validation Requirements"
   - Verify all interactive features work correctly across the entire change set
   - Ensure the full integration works as expected

#### Step-by-Step Commit Benefits
- **Focused changes**: Each commit addresses a single, well-defined aspect
- **Better reviewability**: Reviewers can understand and validate individual steps
- **Easier debugging**: Issues can be traced to specific steps
- **Progressive validation**: Each step is tested before proceeding
- **Clear progress tracking**: The checklist shows exactly what has been completed
- **Safer development**: Smaller changes reduce the risk of introducing bugs

#### Commit Message Guidelines
- Use clear, descriptive commit messages for each step
- Format: `[Step X/Y] Brief description of what was accomplished`
- Example: `[Step 2/5] Add withdrawal calculation validation with comprehensive tests`
- Include the step number and total steps when possible
- Focus on what was accomplished, not what will be done next

### Code Review Guidelines

When performing code review, examine the following aspects:

#### Code Quality & Standards
- **Minimal Changes**: Are changes surgical and focused? Avoid unnecessary modifications
- **TypeScript**: Are types properly defined? No `any` types without justification
- **React Patterns**: Proper use of hooks, state management, and component structure
- **UI Framework**: Use shadcn/ui components for new development; avoid mixing UI frameworks
- **Styling Guidelines**: Use only Tailwind CSS utility classes - never create custom CSS classes or separate CSS files
- **Performance**: No unnecessary re-renders or expensive calculations
- **Error Handling**: Appropriate error handling for user inputs and edge cases

#### German Financial Logic
- **Tax Calculations**: Vorabpauschale, Freibetrag, and Kapitalertragsteuer correctly implemented
- **Currency Formatting**: Proper Euro formatting and number handling
- **Date Handling**: Correct German date formats and year-based calculations
- **Investment Logic**: Accurate compound interest, withdrawal strategies, and return configurations

#### User Experience
- **UI Consistency**: shadcn/ui components used appropriately and consistently; avoid mixing UI frameworks
- **Responsiveness**: Mobile and desktop layouts work correctly
- **Real-time Updates**: Changes reflect immediately in calculations and displays
- **German Language**: Proper German terminology and user-facing text
- **Navigation**: Sticky overview and section navigation work smoothly

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
- [ ] **Step-by-step approach followed**: Changes are broken into logical, focused commits
- [ ] **Progress tracking used**: `report_progress` was used appropriately for each step
- [ ] **Commit messages are clear**: Each step has a descriptive commit message
- [ ] Changes are minimal and focused per step
- [ ] **UI Framework**: New components use shadcn/ui; no mixing of UI frameworks
- [ ] **Styling uses only Tailwind CSS utility classes** - no custom CSS classes created
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