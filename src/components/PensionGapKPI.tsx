import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, PiggyBank, TrendingDown, Calculator } from 'lucide-react';
import { 
  calculatePensionGap, 
  calculateRequiredPortfolioForPensionGap 
} from '../utils/kpi-calculations';
import { generateFormId } from '../utils/unique-id';
import { formatCurrency } from '../utils/currency';
import { Alert, AlertDescription } from './ui/alert';

interface PensionGapKPIProps {
  desiredMonthlyIncome: number;
  expectedPension: number;
  showPortfolioRequirement?: boolean;
}

function NoGapAlert({ hasSurplus, monthlySurplus }: { hasSurplus: boolean; monthlySurplus: number }) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Keine Rentenlücke:</strong> {hasSurplus ? (
          <>
            Die erwartete Rente übersteigt Ihr Wunscheinkommen.
            Sie haben einen Überschuss von <strong>{formatCurrency(monthlySurplus)}</strong> monatlich.
          </>
        ) : (
          'Die erwartete Rente deckt Ihr Wunscheinkommen vollständig.'
        )}
      </AlertDescription>
    </Alert>
  );
}

function PensionGapDetails({
  desiredMonthlyIncome,
  expectedPension,
  coveragePercentage,
  annualGap,
}: {
  desiredMonthlyIncome: number;
  expectedPension: number;
  coveragePercentage: number;
  annualGap: number;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Wunscheinkommen
          </p>
          <p className="font-semibold">{formatCurrency(desiredMonthlyIncome)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground flex items-center gap-1">
            <PiggyBank className="h-3 w-3" />
            Erwartete Rente
          </p>
          <p className="font-semibold">{formatCurrency(expectedPension)}</p>
        </div>
      </div>
      
      <div className="pt-2 border-t space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Abdeckung durch Rente
          </span>
          <span className="font-semibold">{coveragePercentage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Jährliche Lücke
          </span>
          <span className="font-semibold">{formatCurrency(annualGap)}</span>
        </div>
      </div>
    </>
  );
}

function PortfolioRequirementAlert({ requiredPortfolio }: { requiredPortfolio: number }) {
  return (
    <div className="pt-2 border-t">
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">Erforderliches Vermögen (4%-Regel):</p>
          <p className="text-2xl font-bold">{formatCurrency(requiredPortfolio)}</p>
          <p className="text-xs mt-2">
            Bei einer sicheren Entnahmerate von 4% pro Jahr benötigen Sie dieses Vermögen, 
            um die monatliche Rentenlücke dauerhaft zu decken.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function RecommendationsSection() {
  return (
    <div className="pt-2 border-t text-xs text-muted-foreground">
      <p><strong>Empfehlung:</strong></p>
      <p className="mt-1">
        Bauen Sie zusätzliche Altersvorsorge auf, um die Rentenlücke zu schließen. 
        Betriebliche Altersvorsorge, private Rentenversicherungen oder ETF-Sparpläne 
        können helfen, Ihr Wunscheinkommen im Ruhestand zu sichern.
      </p>
    </div>
  );
}

/**
 * PensionGapKPI Component
 * 
 * Displays the expected pension gap (erwartete Rentenlücke) as a KPI widget
 * Shows the difference between desired retirement income and expected pension
 * Optionally calculates the required portfolio size to cover the gap using the 4% rule
 */
export function PensionGapKPI({
  desiredMonthlyIncome,
  expectedPension,
  showPortfolioRequirement = true,
}: PensionGapKPIProps) {
  const cardId = useMemo(() => generateFormId('pension-gap-kpi', 'card'), []);
  
  const monthlyGap = useMemo(() => 
    calculatePensionGap(desiredMonthlyIncome, expectedPension),
    [desiredMonthlyIncome, expectedPension]
  );
  
  const monthlySurplus = useMemo(() =>
    Math.max(0, expectedPension - desiredMonthlyIncome),
    [desiredMonthlyIncome, expectedPension]
  );
  
  const annualGap = useMemo(() => monthlyGap * 12, [monthlyGap]);
  
  const requiredPortfolio = useMemo(() => 
    calculateRequiredPortfolioForPensionGap(monthlyGap),
    [monthlyGap]
  );
  
  const coveragePercentage = useMemo(() => {
    if (desiredMonthlyIncome <= 0) return 100;
    return Math.min(100, (expectedPension / desiredMonthlyIncome) * 100);
  }, [desiredMonthlyIncome, expectedPension]);
  
  const hasGap = monthlyGap > 0;
  const hasSurplus = expectedPension > desiredMonthlyIncome;
  
  return (
    <Card id={cardId} className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Erwartete Rentenlücke
        </CardTitle>
        <CardDescription>Differenz zwischen Wunscheinkommen und gesetzlicher Rente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasGap ? (
          <NoGapAlert hasSurplus={hasSurplus} monthlySurplus={monthlySurplus} />
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(monthlyGap)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / Monat
                </span>
              </div>
            </div>
            
            <PensionGapDetails
              desiredMonthlyIncome={desiredMonthlyIncome}
              expectedPension={expectedPension}
              coveragePercentage={coveragePercentage}
              annualGap={annualGap}
            />
            
            {showPortfolioRequirement && (
              <PortfolioRequirementAlert requiredPortfolio={requiredPortfolio} />
            )}
            
            <RecommendationsSection />
          </>
        )}
      </CardContent>
    </Card>
  );
}
