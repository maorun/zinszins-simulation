import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateSavingsRate, evaluateSavingsRate, getSavingsRateColor } from '../utils/kpi-calculations';
import { generateFormId } from '../utils/unique-id';

interface SavingsRateKPIProps {
  monthlySavings: number;
  monthlyIncome: number;
  showComparison?: boolean;
  previousSavingsRate?: number;
}

/**
 * SavingsRateKPI Component
 * 
 * Displays the savings rate (Sparquote) as a KPI widget with visual indicators
 * Shows the percentage of income being saved and provides context through color coding
 */
export function SavingsRateKPI({
  monthlySavings,
  monthlyIncome,
  showComparison = false,
  previousSavingsRate,
}: SavingsRateKPIProps) {
  const cardId = useMemo(() => generateFormId('savings-rate-kpi', 'card'), []);
  
  const savingsRate = useMemo(() => 
    calculateSavingsRate(monthlySavings, monthlyIncome),
    [monthlySavings, monthlyIncome]
  );
  
  const category = useMemo(() => evaluateSavingsRate(savingsRate), [savingsRate]);
  const colorClass = useMemo(() => getSavingsRateColor(savingsRate), [savingsRate]);
  
  const categoryLabels = {
    excellent: 'Ausgezeichnet',
    good: 'Gut',
    average: 'Durchschnittlich',
    low: 'Niedrig'
  };
  
  const trend = useMemo(() => {
    if (!showComparison || previousSavingsRate === undefined) return null;
    
    const difference = savingsRate - previousSavingsRate;
    if (Math.abs(difference) < 0.1) return { icon: Minus, text: 'Unverändert', class: 'text-gray-500' };
    if (difference > 0) return { icon: TrendingUp, text: `+${difference.toFixed(1)}%`, class: 'text-green-600' };
    return { icon: TrendingDown, text: `${difference.toFixed(1)}%`, class: 'text-red-600' };
  }, [savingsRate, previousSavingsRate, showComparison]);
  
  return (
    <Card id={cardId} className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Sparquote</CardTitle>
        <CardDescription>Prozentsatz des Einkommens, der gespart wird</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${colorClass}`}>
              {savingsRate.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              ({categoryLabels[category]})
            </span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend.class}`}>
              <trend.icon className="h-4 w-4" />
              <span>{trend.text}</span>
            </div>
          )}
        </div>
        
        <Progress value={savingsRate} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Monatliche Sparrate</p>
            <p className="font-semibold">{monthlySavings.toLocaleString('de-DE')} €</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monatliches Einkommen</p>
            <p className="font-semibold">{monthlyIncome.toLocaleString('de-DE')} €</p>
          </div>
        </div>
        
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <p><strong>Empfehlung:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>&gt; 20%: Ausgezeichnete Sparquote</li>
            <li>15-20%: Gute Sparquote</li>
            <li>10-15%: Durchschnittliche Sparquote</li>
            <li>&lt; 10%: Verbesserungspotenzial</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
