import { useState, useMemo } from 'react';
import { generateFormId } from '../utils/unique-id';
import { SavingsRateSection } from './demo-sections/SavingsRateSection';
import { WealthAccumulationSection } from './demo-sections/WealthAccumulationSection';
import { PensionGapSection } from './demo-sections/PensionGapSection';
import { KPIInfoSection } from './demo-sections/KPIInfoSection';

function useDemoFormIds() {
  return useMemo(() => ({
    monthlySavings: generateFormId('kpi-demo', 'monthly-savings'),
    monthlyIncome: generateFormId('kpi-demo', 'monthly-income'),
    currentWealth: generateFormId('kpi-demo', 'current-wealth'),
    targetWealth: generateFormId('kpi-demo', 'target-wealth'),
    yearsToTarget: generateFormId('kpi-demo', 'years-to-target'),
    desiredIncome: generateFormId('kpi-demo', 'desired-income'),
    expectedPension: generateFormId('kpi-demo', 'expected-pension'),
  }), []);
}

/**
 * KPI Dashboard Demo Page
 * 
 * Showcases the Financial KPI components with interactive controls
 * Demonstrates Sparquote, Vermögensaufbau-Rate, and erwartete Rentenlücke
 */
export function KPIDashboardDemo() {
  const [monthlySavings, setMonthlySavings] = useState(1000);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [currentWealth, setCurrentWealth] = useState(100000);
  const [targetWealth, setTargetWealth] = useState(500000);
  const [yearsToTarget, setYearsToTarget] = useState(10);
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(3000);
  const [expectedPension, setExpectedPension] = useState(2000);
  
  const formIds = useDemoFormIds();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Financial KPI Dashboard</h1>
        <p className="text-muted-foreground">
          Interaktive Übersicht wichtiger Finanzkennzahlen für Ihre Altersvorsorge
        </p>
      </div>
      
      <SavingsRateSection
        monthlySavings={monthlySavings}
        monthlyIncome={monthlyIncome}
        monthlySavingsId={formIds.monthlySavings}
        monthlyIncomeId={formIds.monthlyIncome}
        onSavingsChange={setMonthlySavings}
        onIncomeChange={setMonthlyIncome}
      />
      
      <WealthAccumulationSection
        currentWealth={currentWealth}
        targetWealth={targetWealth}
        yearsToTarget={yearsToTarget}
        currentWealthId={formIds.currentWealth}
        targetWealthId={formIds.targetWealth}
        yearsToTargetId={formIds.yearsToTarget}
        onCurrentWealthChange={setCurrentWealth}
        onTargetWealthChange={setTargetWealth}
        onYearsChange={setYearsToTarget}
      />
      
      <PensionGapSection
        desiredMonthlyIncome={desiredMonthlyIncome}
        expectedPension={expectedPension}
        desiredIncomeId={formIds.desiredIncome}
        expectedPensionId={formIds.expectedPension}
        onDesiredIncomeChange={setDesiredMonthlyIncome}
        onExpectedPensionChange={setExpectedPension}
      />
      
      <KPIInfoSection />
    </div>
  );
}
