import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { WealthAccumulationRateKPI } from '../../components/WealthAccumulationRateKPI';

interface WealthAccumulationSectionProps {
  currentWealth: number;
  targetWealth: number;
  yearsToTarget: number;
  currentWealthId: string;
  targetWealthId: string;
  yearsToTargetId: string;
  onCurrentWealthChange: (value: number) => void;
  onTargetWealthChange: (value: number) => void;
  onYearsChange: (value: number) => void;
}

function WealthInputs({ currentWealthId, currentWealth, onCurrentWealthChange, targetWealthId, targetWealth, onTargetWealthChange, yearsToTargetId, yearsToTarget, onYearsChange }: {
  currentWealthId: string;
  currentWealth: number;
  onCurrentWealthChange: (value: number) => void;
  targetWealthId: string;
  targetWealth: number;
  onTargetWealthChange: (value: number) => void;
  yearsToTargetId: string;
  yearsToTarget: number;
  onYearsChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor={currentWealthId}>Aktuelles Vermögen (€)</Label>
        <Input id={currentWealthId} type="number" value={currentWealth} onChange={(e) => onCurrentWealthChange(Number(e.target.value))} min="0" step="10000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={targetWealthId}>Zielvermögen (€)</Label>
        <Input id={targetWealthId} type="number" value={targetWealth} onChange={(e) => onTargetWealthChange(Number(e.target.value))} min="0" step="10000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={yearsToTargetId}>Jahre bis zum Ziel</Label>
        <Input id={yearsToTargetId} type="number" value={yearsToTarget} onChange={(e) => onYearsChange(Number(e.target.value))} min="1" max="50" step="1" />
      </div>
    </div>
  );
}

export function WealthAccumulationSection({
  currentWealth,
  targetWealth,
  yearsToTarget,
  currentWealthId,
  targetWealthId,
  yearsToTargetId,
  onCurrentWealthChange,
  onTargetWealthChange,
  onYearsChange,
}: WealthAccumulationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Vermögensaufbau-Rate (Wealth Accumulation Rate)</CardTitle>
        <CardDescription>Wie schnell wächst Ihr Vermögen zum Ziel?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <WealthInputs 
          currentWealthId={currentWealthId} 
          currentWealth={currentWealth} 
          onCurrentWealthChange={onCurrentWealthChange}
          targetWealthId={targetWealthId}
          targetWealth={targetWealth}
          onTargetWealthChange={onTargetWealthChange}
          yearsToTargetId={yearsToTargetId}
          yearsToTarget={yearsToTarget}
          onYearsChange={onYearsChange}
        />
        <WealthAccumulationRateKPI currentWealth={currentWealth} targetWealth={targetWealth} yearsToTarget={yearsToTarget} />
      </CardContent>
    </Card>
  );
}
