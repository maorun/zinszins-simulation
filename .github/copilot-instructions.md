# Zinseszins-Simulation (Compound Interest Calculator)

Zinseszins-Simulation is a German compound interest calculator built with Remix.js, TypeScript, and RSuite UI components. The application simulates investment growth over time, including German tax considerations (Vorabpauschale, Freibetrag), savings plans, and withdrawal strategies.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Setup and Build Process
- **Install dependencies**: `npm install` -- takes 3-4 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
  - Expect peer dependency warnings about React version mismatches - these are normal due to React 19 upgrade
  - Will show 11-13 vulnerabilities (reduced from previous 24) - this is expected and doesn't block development
  - Legacy peer deps are used for some packages to resolve React 19 compatibility
- **Build the application**: `npm run build` -- takes 3 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Will show Remix warnings about future flags - these are normal
  - Will show "CJS build of Vite's Node API is deprecated" warning - expected behavior
  - Will show TypeScript duplicate key warning in tsconfig.json - this is known and doesn't break builds
- **Type checking**: `npm run typecheck` -- takes 30 seconds with errors. NEVER CANCEL. Set timeout to 2+ minutes.
  - Expect TypeScript errors in dependencies - these don't prevent the application from working
  - Main application code may have some type issues but builds successfully
- **Development server**: `npm run dev` -- starts in 5-6 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Runs on http://localhost:3000
  - Hot module reloading works correctly
  - Will show same warnings as build process
- **Production server**: `npm run start` -- starts immediately after build
  - Must run `npm run build` first
  - Runs on http://localhost:3000

### Known Issues and Workarounds
- **Critical Import Issue**: The import `import { Close } from '@rsuite/icons'` in `/app/components/SparplanEingabe.tsx` causes runtime errors
  - **Workaround**: Comment out the import and replace the `<Close />` component with plain text like "X"
  - This is a known ESM/CommonJS compatibility issue with RSuite icons
- **ESLint Configuration**: Now uses modern ESLint v9 with flat config (eslint.config.js)
  - Basic configuration only supports JavaScript files for now
  - TypeScript/TSX files require additional parser setup but application builds and runs fine
  - @remix-run/eslint-config is not compatible with ESLint v9 yet
- **React 19 Compatibility**: Updated to React 19 with some peer dependency warnings
  - Most packages show warnings but functionality is preserved
  - Uses --legacy-peer-deps for installation to resolve conflicts
- **TypeScript Errors**: Many errors in node_modules dependencies, but application functions correctly

## Validation and Testing

### Manual Validation Requirements
After making changes, ALWAYS test the complete user workflow:

1. **Start the application**: `npm run dev`
2. **Navigate to http://localhost:3000** and verify the page loads
3. **Test core functionality**:
   - Verify the main calculator loads with default values (24,000€/year, 5% return, 2023-2040 timespan)
   - Confirm end capital shows approximately 596,168.79 €
   - Expand "Sparpläne erstellen" section and verify form fields appear
   - Test the return rate slider (Rendite) - should update calculations in real-time
   - Verify the year-by-year breakdown table shows investment progression
   - Check that the simulation section displays detailed year-by-year data

4. **Test interactive features**:
   - Change the time span slider and verify calculations update
   - Switch between "jährlich" (yearly) and "monatlich" (monthly) calculation modes
   - Expand/collapse different sections (Entnahme, Simulation)

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
- **`app/routes/_index.tsx`** - Main application page with all UI components and state management
- **`app/routes/simulate.tsx`** - Server-side simulation endpoint using Zod validation
- **`helpers/simulate.tsx`** - Core compound interest calculation logic with German tax considerations
- **`helpers/steuer.tsx`** - German tax calculation utilities (Vorabpauschale, Freibetrag)

### UI Components
- **`app/components/SparplanEingabe.tsx`** - Savings plan input forms and management (contains the Close icon import issue)
- **`app/components/SparplanSimulationsAusgabe.tsx`** - Results display tables and summaries
- **`app/components/EntnahmeSimulationsAusgabe.tsx`** - Withdrawal phase planning interface
- **`app/components/Zeitspanne.tsx`** - Time range selection component

### Configuration Files
- **`package.json`** - Dependencies and scripts (no test scripts defined)
  - Updated to React 19, ESLint 9, isbot 5, latest Remix 2.16.7, TypeScript 5.9.2
  - Uses --legacy-peer-deps for React 19 compatibility
- **`remix.config.js`** - Remix.js configuration (minimal setup)
- **`tsconfig.json`** - TypeScript configuration (has duplicate moduleResolution warning)
- **`eslint.config.js`** - ESLint v9 flat configuration (basic JavaScript support only)
- **`.eslintrc.cjs`** - REMOVED: Legacy ESLint configuration (replaced with flat config)

## Development Patterns

### State Management
- Uses React hooks (useState, useEffect, useCallback) for local state
- Remix `useFetcher` for server communication
- No external state management library

### Styling and UI
- **RSuite components** for UI (Tables, Forms, Panels, Sliders)
- **CSS**: Uses `rsuite/dist/rsuite.min.css` - imported in components
- **Icons**: RSuite icons (with import compatibility issues)

### API and Data Flow
- Form data validated with Zod schemas in `simulate.tsx`
- Calculations performed server-side for accuracy
- Results returned as JSON and displayed in real-time

## German Financial Features

### Tax Calculations
- **Vorabpauschale**: Advance lump-sum taxation on investment funds
- **Freibetrag**: Annual tax allowance (currently 2,000€ per year in code)
- **Kapitalertragsteuer**: Capital gains tax (26.375% in code)
- **Teilfreistellungsquote**: Partial exemption for equity funds (30% for stock funds)

### Investment Types
- **Sparplan**: Regular savings plans with monthly/yearly contributions
- **Einmalzahlung**: One-time lump sum investments
- **Entnahme**: Withdrawal strategies (4% rule, 3% rule)

## Common Development Tasks

### Adding New Features
1. **Always run `npm run dev` first** to ensure baseline functionality
2. **Test the Close icon workaround** if modifying SparplanEingabe.tsx
3. **Update both calculation logic** (helpers/simulate.tsx) and UI components
4. **Validate with complete user scenarios** - don't just test isolated changes

### Debugging Issues
1. **Check browser console** for runtime errors (ignore Vercel Analytics warnings)
2. **Verify server logs** for calculation errors
3. **Test with different input values** to isolate calculation vs UI issues
4. **Use TypeScript errors selectively** - focus on new code, ignore dependency errors

### Performance Considerations
- Calculations run server-side to avoid client-side precision issues
- Real-time updates on every input change - be mindful of calculation complexity
- Large year ranges (like 2025-2050) may slow down rendering

## Deployment Information
- **Production URL**: https://zinszins-simulation.vercel.app/
- **Platform**: Vercel (configured with @vercel/remix adapter)
- **Build**: Uses standard Remix build process
- **Analytics**: Vercel Analytics integrated (causes expected console warnings)

## Project Context
This is a personal finance tool focused on German tax law and investment planning. The application helps users:
- Plan long-term investment strategies
- Understand compound interest effects
- Calculate German tax implications on investments
- Model different savings and withdrawal scenarios
- Make informed financial planning decisions

**Author**: Marco (see footer in application)