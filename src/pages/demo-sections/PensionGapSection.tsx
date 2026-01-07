import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PensionGapKPI } from '../../components/PensionGapKPI';

interface PensionGapSectionProps {
  desiredMonthlyIncome: number;
  expectedPension: number;
  desiredIncomeId: string;
  expectedPensionId: string;
  onDesiredIncomeChange: (value: number) => void;
  onExpectedPensionChange: (value: number) => void;
}

export function PensionGapSection({
  desiredMonthlyIncome,
  expectedPension,
  desiredIncomeId,
  expectedPensionId,
  onDesiredIncomeChange,
  onExpectedPensionChange,
}: PensionGapSectionProps) {
  return (
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
              onChange={(e) => onDesiredIncomeChange(Number(e.target.value))}
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
              onChange={(e) => onExpectedPensionChange(Number(e.target.value))}
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
  );
}
