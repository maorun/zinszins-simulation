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
- **Build the application**: `npm run build` -- takes 3-5 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
- **Type checking**: `npm run typecheck` -- takes 10-15 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
- **Development server**: `npm run dev` -- starts in 5-6 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Runs on http://localhost:5173 (Vite default port)
- **Testing**: `npm run test` -- runs 360+ tests across 59 files in ~24 seconds
  - All tests should pass
  - Uses Vitest for testing

### Known Issues and Workarounds
- **ESLint Configuration**: Uses modern ESLint with flat config (eslint.config.js)
- **React 19 Compatibility**: Updated to React 19 - all functionality works correctly
- **TypeScript**: Well-typed application with no errors
- **UI Framework Migration**: **MIGRATION COMPLETED** - Successfully migrated from RSuite to shadcn/ui components
  - `temp-rsuite-stubs.tsx` provides compatibility layer for internal data binding only
  - New components should use shadcn/ui components from `src/components/ui/`

## Validation and Testing

### Manual Validation Requirements
After making changes, ALWAYS test the complete user workflow:

1. **Start the application**: `npm run dev`
2. **Navigate to http://localhost:5173** and verify the page loads
3. **Test core functionality**:
   - Verify the main calculator loads with default values (24,000€/year, 5% return, 2023-2040 timespan)
   - Confirm end capital shows approximately 596,168.79 €
   - Test the return rate slider (Rendite) - should update calculations in real-time
   - Test different return modes (Fixed, Random, Variable)
   - Verify the year-by-year breakdown table shows investment progression

4. **Test interactive features**:
   - Change the time span slider and verify calculations update
   - Switch between "jährlich" (yearly) and "monatlich" (monthly) calculation modes
   - Expand/collapse different sections (Entnahme, Monte Carlo Analyse, Simulation, Daten Export)
   - Test withdrawal strategies in the "Entnahme" section
   - Test tax configuration changes (Kapitalertragsteuer, Teilfreistellungsquote)
   - Test data export functionality (Parameter export, CSV export, Markdown export)

### Essential Commands for Development
- `npm run dev` - Start development server (never cancel, wait for startup)
- `npm run build` - Build for production (6-7 seconds, never cancel)
- `npm run typecheck` - Run TypeScript checks (expect errors, but useful for new code)
- `npm run test` - Run all tests (should pass all 360+ tests)
- `npm run lint` - Run linting (should pass with max 10 warnings)

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
- **`package.json`** - Dependencies and scripts (React 19, ESLint 8, Vite 5, TypeScript 5.9.2, Vitest 2)
- **`vite.config.ts`** - Vite configuration for development and build
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint flat configuration
- **`components.json`** - shadcn/ui configuration for component generation

## Development Patterns

### State Management
- Uses React hooks (useState, useEffect, useCallback) for local state
- Client-side calculations with immediate updates
- No external state management library

### UI Framework Migration Status: **COMPLETED**
- **Primary UI Framework**: **shadcn/ui components** - Modern, accessible UI components built on Radix UI
- **CSS Framework**: Uses Tailwind CSS utility classes exclusively
  - **NO new CSS classes**: Never create custom CSS classes or styles in separate CSS files
  - **Tailwind only**: Use only Tailwind CSS utility classes for all styling needs
- **Icons**: **Lucide React** icons (modern, consistent iconography)
- **Legacy Compatibility**: All user-facing components fully migrated to shadcn/ui

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

## Development Workflow

### Testing Requirements - MANDATORY
**For every single change or addition of a feature, corresponding tests must be added or adapted. This is a mandatory requirement.**

### Essential Development Steps
1. **Always run `npm run dev` first** to ensure baseline functionality
2. **Run tests with `npm run test`** to verify existing functionality (all 360+ tests must pass)
3. **Update both calculation logic** (helpers/ or src/utils/) and UI components
4. **Validate with complete user scenarios** - don't just test isolated changes
5. **Run linting:** `npm run lint` (should pass with max 10 warnings)
6. **Run build:** `npm run build` (should complete successfully)

### Component Refactoring Guidelines
When components become too large (> 500-800 lines):
1. **Extract Display Components** - Separate UI rendering into focused components
2. **Extract Business Logic into Custom Hooks** - Extract state and calculations into custom hooks
3. **Extract Utility Functions** - Extract pure functions for formatting, validation, transformation
4. **Maintain Test Coverage** - Each extracted component needs comprehensive tests
5. **Test immediately after each extraction** - Run tests and fix failures before proceeding

### Code Quality Guidelines
- **Minimal Changes**: Make surgical, focused changes
- **TypeScript**: Proper types, no `any` without justification
- **UI Framework**: Use shadcn/ui components for new development
- **Styling**: Use only Tailwind CSS utility classes - never create custom CSS classes
- **Performance**: No unnecessary re-renders or expensive calculations
- **German Financial Logic**: Accurate tax calculations and currency formatting

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
- **Comprehensive Testing**: 360+ tests across 59 files ensure reliability
- **Enhanced User Experience**: Sticky navigation, comprehensive data export, real-time updates
- **German Tax Compliance**: Full Vorabpauschale calculations with explanations
- **Interactive Functionality**: All RadioTile, Card, and Button components fully functional
- **Development Tools**: Use Context7 for up-to-date documentation and best practices

**Author**: Marco (see footer in application)

## Development Best Practices

### Context7 Integration
When developing new features or making changes, always use **Context7** to access up-to-date documentation and examples:
- **Library Documentation**: Get current documentation for libraries and frameworks
- **Best Practices**: Access current best practices for React 19, TypeScript, and shadcn/ui
- **Problem Solving**: Research solutions for complex technical challenges
- **API References**: Access latest API documentation for dependencies

### Step-by-Step Development Approach
Use `report_progress` tool for tracking development progress:
1. **Initial Planning**: Outline complete plan as detailed checklist
2. **After Each Step**: Use `report_progress` to commit each completed step individually
3. **Progress Tracking**: Maintain consistent checklist structure between updates
4. **Commit Messages**: Use clear, descriptive messages for each step

### Testing and Validation Checklist
Before completing any work, verify:
- [ ] All tests pass (`npm run test`) - **Most important check**
- [ ] Linting passes (`npm run lint`) 
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing confirms functionality works
- [ ] Changes are minimal and focused
- [ ] UI uses shadcn/ui components and Tailwind CSS only
- [ ] German financial calculations are accurate
- [ ] Documentation updated appropriately
- [ ] No unintended side effects or regressions