import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { SavingsRateKPI } from '../../components/SavingsRateKPI';

interface SavingsRateSectionProps {
  monthlySavings: number;
  monthlyIncome: number;
  monthlySavingsId: string;
  monthlyIncomeId: string;
  onSavingsChange: (value: number) => void;
  onIncomeChange: (value: number) => void;
}

export function SavingsRateSection({
  monthlySavings,
  monthlyIncome,
  monthlySavingsId,
  monthlyIncomeId,
  onSavingsChange,
  onIncomeChange,
}: SavingsRateSectionProps) {
  return (
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
              onChange={(e) => onSavingsChange(Number(e.target.value))}
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
              onChange={(e) => onIncomeChange(Number(e.target.value))}
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
  );
}
