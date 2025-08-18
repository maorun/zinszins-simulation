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
  - Expect minimal TypeScript errors - application functions correctly
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
- **TypeScript**: Well-typed application with minimal errors

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