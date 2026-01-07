import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { SavingsRateKPI } from '../components/SavingsRateKPI';
import { WealthAccumulationRateKPI } from '../components/WealthAccumulationRateKPI';
import { PensionGapKPI } from '../components/PensionGapKPI';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { generateFormId } from '../utils/unique-id';

/**
 * KPI Dashboard Demo Page
 * 
 * Showcases the Financial KPI components with interactive controls
 * Demonstrates Sparquote, Vermögensaufbau-Rate, and erwartete Rentenlücke
 */
export function KPIDashboardDemo() {
  // Savings Rate inputs
  const [monthlySavings, setMonthlySavings] = useState(1000);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  
  // Wealth Accumulation inputs
  const [currentWealth, setCurrentWealth] = useState(100000);
  const [targetWealth, setTargetWealth] = useState(500000);
  const [yearsToTarget, setYearsToTarget] = useState(10);
  
  // Pension Gap inputs
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(3000);
  const [expectedPension, setExpectedPension] = useState(2000);
  
  // Generate unique IDs
  const monthlySavingsId = useMemo(() => generateFormId('kpi-demo', 'monthly-savings'), []);
  const monthlyIncomeId = useMemo(() => generateFormId('kpi-demo', 'monthly-income'), []);
  const currentWealthId = useMemo(() => generateFormId('kpi-demo', 'current-wealth'), []);
  const targetWealthId = useMemo(() => generateFormId('kpi-demo', 'target-wealth'), []);
  const yearsToTargetId = useMemo(() => generateFormId('kpi-demo', 'years-to-target'), []);
  const desiredIncomeId = useMemo(() => generateFormId('kpi-demo', 'desired-income'), []);
  const expectedPensionId = useMemo(() => generateFormId('kpi-demo', 'expected-pension'), []);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Financial KPI Dashboard</h1>
        <p className="text-muted-foreground">
          Interaktive Übersicht wichtiger Finanzkennzahlen für Ihre Altersvorsorge
        </p>
      </div>
      
      {/* Sparquote Section */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Sparquote (Savings Rate)</CardTitle>
          <CardDescription>Wie viel Prozent Ihres Einkommens sparen Sie?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={monthlySavingsId}>Monatliche Sparrate (€)</Label>
              <Input
                id={monthlySavingsId}
                type="number"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={monthlyIncomeId}>Monatliches Bruttoeinkommen (€)</Label>
              <Input
                id={monthlyIncomeId}
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                min="0"
                step="100"
              />
            </div>
          </div>
          
          <SavingsRateKPI
            monthlySavings={monthlySavings}
            monthlyIncome={monthlyIncome}
          />
        </CardContent>
      </Card>
      
      {/* Vermögensaufbau-Rate Section */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Vermögensaufbau-Rate (Wealth Accumulation Rate)</CardTitle>
          <CardDescription>Wie schnell wächst Ihr Vermögen zum Ziel?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={currentWealthId}>Aktuelles Vermögen (€)</Label>
              <Input
                id={currentWealthId}
                type="number"
                value={currentWealth}
                onChange={(e) => setCurrentWealth(Number(e.target.value))}
                min="0"
                step="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={targetWealthId}>Zielvermögen (€)</Label>
              <Input
                id={targetWealthId}
                type="number"
                value={targetWealth}
                onChange={(e) => setTargetWealth(Number(e.target.value))}
                min="0"
                step="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={yearsToTargetId}>Jahre bis zum Ziel</Label>
              <Input
                id={yearsToTargetId}
                type="number"
                value={yearsToTarget}
                onChange={(e) => setYearsToTarget(Number(e.target.value))}
                min="1"
                max="50"
                step="1"
              />
            </div>
          </div>
          
          <WealthAccumulationRateKPI
            currentWealth={currentWealth}
            targetWealth={targetWealth}
            yearsToTarget={yearsToTarget}
          />
        </CardContent>
      </Card>
      
      {/* Erwartete Rentenlücke Section */}
      <Card>
        <CardHeader>
          <CardTitle>🏦 Erwartete Rentenlücke (Expected Pension Gap)</CardTitle>
          <CardDescription>Wie groß ist Ihre Versorgungslücke im Ruhestand?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={desiredIncomeId}>Gewünschtes monatliches Einkommen (€)</Label>
              <Input
                id={desiredIncomeId}
                type="number"
                value={desiredMonthlyIncome}
                onChange={(e) => setDesiredMonthlyIncome(Number(e.target.value))}
                min="0"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={expectedPensionId}>Erwartete gesetzliche Rente (€)</Label>
              <Input
                id={expectedPensionId}
                type="number"
                value={expectedPension}
                onChange={(e) => setExpectedPension(Number(e.target.value))}
                min="0"
                step="100"
              />
            </div>
          </div>
          
          <PensionGapKPI
            desiredMonthlyIncome={desiredMonthlyIncome}
            expectedPension={expectedPension}
          />
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">ℹ️ Über diese KPIs</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 dark:text-blue-100 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Sparquote (Savings Rate)</h3>
            <p className="text-sm">
              Die Sparquote zeigt, welchen Prozentsatz Ihres Einkommens Sie regelmäßig sparen. 
              Eine hohe Sparquote beschleunigt Ihren Vermögensaufbau erheblich. 
              Experten empfehlen eine Sparquote von mindestens 15-20%.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Vermögensaufbau-Rate (Wealth Accumulation Rate)</h3>
            <p className="text-sm">
              Diese KPI zeigt, wie schnell Ihr Vermögen wachsen muss, um Ihr Sparziel zu erreichen. 
              Sie berücksichtigt Ihren aktuellen Vermögensstand, das Ziel und die verbleibende Zeit. 
              Eine realistische Einschätzung hilft bei der Planung Ihrer Sparstrategie.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Erwartete Rentenlücke (Expected Pension Gap)</h3>
            <p className="text-sm">
              Die Rentenlücke ist die Differenz zwischen Ihrem gewünschten Ruhestandseinkommen 
              und der erwarteten gesetzlichen Rente. Diese KPI zeigt, wie viel zusätzliches Kapital 
              Sie benötigen, um Ihren Lebensstandard im Ruhestand aufrechtzuerhalten. 
              Die Berechnung basiert auf der bewährten 4%-Entnahmeregel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
