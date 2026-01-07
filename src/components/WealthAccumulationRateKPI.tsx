import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { calculateWealthAccumulationRate } from '../utils/kpi-calculations';
import { generateFormId } from '../utils/unique-id';
import { formatCurrency } from '../utils/currency';

interface WealthAccumulationRateKPIProps {
  currentWealth: number;
  targetWealth: number;
  yearsToTarget: number;
  showDetails?: boolean;
}

/**
 * WealthAccumulationRateKPI Component
 * 
 * Displays the wealth accumulation rate (Vermögensaufbau-Rate) as a KPI widget
 * Shows how quickly wealth needs to grow to reach the target
 */
export function WealthAccumulationRateKPI({
  currentWealth,
  targetWealth,
  yearsToTarget,
  showDetails = true,
}: WealthAccumulationRateKPIProps) {
  const cardId = useMemo(() => generateFormId('wealth-accumulation-kpi', 'card'), []);
  
  const accumulationRate = useMemo(() => 
    calculateWealthAccumulationRate(currentWealth, targetWealth, yearsToTarget),
    [currentWealth, targetWealth, yearsToTarget]
  );
  
  const wealthGap = useMemo(() => 
    Math.max(0, targetWealth - currentWealth),
    [currentWealth, targetWealth]
  );
  
  const annualRequiredGrowth = useMemo(() => 
    yearsToTarget > 0 ? wealthGap / yearsToTarget : 0,
    [wealthGap, yearsToTarget]
  );
  
  const progressPercentage = useMemo(() => {
    if (targetWealth <= 0) return 0;
    return Math.min(100, (currentWealth / targetWealth) * 100);
  }, [currentWealth, targetWealth]);
  
  const isTargetReached = currentWealth >= targetWealth;
  
  return (
    <Card id={cardId} className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Vermögensaufbau-Rate
        </CardTitle>
        <CardDescription>Jährliche Wachstumsrate zum Erreichen des Ziels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTargetReached ? (
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              🎉 Ziel erreicht!
            </div>
            <p className="text-sm text-muted-foreground">
              Das Vermögensziel wurde bereits erreicht oder überschritten.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {accumulationRate.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  pro Jahr
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fortschritt zum Ziel</span>
                <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {showDetails && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Aktuelles Vermögen
                    </p>
                    <p className="font-semibold">{formatCurrency(currentWealth)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Zielvermögen
                    </p>
                    <p className="font-semibold">{formatCurrency(targetWealth)}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Verbleibende Zeit
                    </span>
                    <span className="font-semibold">
                      {yearsToTarget} {yearsToTarget === 1 ? 'Jahr' : 'Jahre'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Erforderliches Wachstum/Jahr
                    </span>
                    <span className="font-semibold">{formatCurrency(annualRequiredGrowth)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Fehlbetrag zum Ziel
                    </span>
                    <span className="font-semibold">{formatCurrency(wealthGap)}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  <p><strong>Hinweis:</strong></p>
                  <p className="mt-1">
                    Diese Rate zeigt, wie viel Ihr Vermögen jährlich wachsen muss, 
                    um das Zielvermögen in der verbleibenden Zeit zu erreichen. 
                    Sie berücksichtigt Sparraten, Renditen und Steuern.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
