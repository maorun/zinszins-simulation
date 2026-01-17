# Demos and Examples

This directory contains demonstration files and examples for the zinszins-simulation application. These files are **not** part of the production codebase and are intended for development, testing, and documentation purposes.

## Purpose

- **Documentation**: Show how to use various calculation functions
- **Development**: Test and verify calculation logic with realistic scenarios
- **Examples**: Provide reference implementations for complex calculations

## Files

### `em-rente-examples.ts`

Demonstrates the EM-Rente (Erwerbsminderungsrente - disability pension) calculation functionality with realistic scenarios. This file shows how to:

- Calculate partial and full disability pensions
- Apply Zurechnungszeiten (crediting periods)
- Apply Abschläge (deductions)
- Handle different disability scenarios

**Note**: This file uses `console.log` extensively for demonstration purposes. This is intentional and appropriate for example code.

### `em-rente-examples.test.ts`

Tests the example file to ensure the console output is correct and the examples run without errors.

## Running Examples

To run an example file:

```bash
# Using ts-node (recommended for development)
npx ts-node demos/em-rente-examples.ts

# Or compile and run with node
npm run build
node dist/demos/em-rente-examples.js
```

## Important Notes

- **Console Statements**: Demo files intentionally use `console.log` for output
- **Not Production Code**: These files are excluded from the main application bundle
- **Testing**: Demo tests verify that examples run correctly
- **Documentation**: Examples serve as living documentation for complex calculations

## Adding New Examples

When adding new example files:

1. Place them in this `demos/` directory
2. Include clear comments explaining what the example demonstrates
3. Use descriptive variable names and realistic scenarios
4. Add corresponding test files to verify the examples work
5. Update this README to document the new example
