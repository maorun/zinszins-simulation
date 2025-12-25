# Rentenpunkte-Rechner (Pension Points Calculator)

This module provides functionality to calculate German statutory pension based on the Rentenpunkte (pension points) system.

## Overview

The German pension system calculates your pension based on **pension points (Rentenpunkte)**:

- Each year you earn: `(Your Gross Salary) / (Average Gross Salary in Germany)` pension points
- If you earn exactly the average salary, you get 1.0 pension point per year
- Monthly pension = Total Pension Points × Current Pension Value (Rentenwert ≈ €37.60 in 2024)

## Usage

### Basic Calculation

```typescript
import { calculatePensionPoints, createProjectedSalaryHistory } from './helpers/pension-points'

// Create a salary history projection
const { salaryHistory, averageSalaryHistory } = createProjectedSalaryHistory(
  2000,  // Start year
  2040,  // End year
  35000, // Starting salary
  3.0    // Annual increase percentage
)

// Calculate pension points
const result = calculatePensionPoints({
  salaryHistory,
  region: 'west',
  customAverageSalaryHistory: averageSalaryHistory
})

console.log(`Total pension points: ${result.totalPensionPoints}`)
console.log(`Monthly pension: €${result.monthlyPension}`)
console.log(`Annual pension: €${result.annualPension}`)
```

### Manual Salary History

```typescript
import { calculatePensionPoints } from './helpers/pension-points'

const result = calculatePensionPoints({
  salaryHistory: {
    2020: 40000,
    2021: 42000,
    2022: 44000,
    2023: 46000
  },
  region: 'west'
})
```

## API Reference

### Functions

- `calculatePensionPoints(config)` - Main calculation function
- `createSalaryHistory(startYear, endYear, startingSalary, annualIncreasePercent)` - Generate simple salary history
- `createProjectedSalaryHistory(...)` - Generate salary history with future projections
- `estimateFutureAverageSalary(year, growthPercent)` - Estimate future average salaries
- `getAverageGrossSalary(year, customHistory?)` - Get average salary for a year

### Types

- `PensionPointsConfig` - Configuration for pension calculation
- `PensionPointsResult` - Complete calculation result with breakdown
- `YearlyPensionPointsResult` - Individual year result

## Integration with Statutory Pension

The pension points calculator is designed to work alongside the existing statutory pension system:

1. Users can calculate their expected pension based on their career earnings
2. The calculated monthly pension amount can be used in the StatutoryPensionConfiguration
3. Results provide both monthly and annual pension amounts for planning

## Future Enhancements

- UI component for interactive pension points calculation
- Integration with tax return data import
- Visualization of pension points accumulation over time
- Comparison between different career scenarios
