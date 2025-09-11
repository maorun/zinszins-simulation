import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import { WithdrawalSegmentForm } from "./WithdrawalSegmentForm";
import type { SegmentedComparisonStrategy } from "../utils/config-storage";
import type { WithdrawalSegment } from "../utils/segmented-withdrawal";

interface SegmentedComparisonConfigurationProps {
  segmentedComparisonStrategies: SegmentedComparisonStrategy[];
  withdrawalStartYear: number;
  withdrawalEndYear: number;
  onAddStrategy: (strategy: SegmentedComparisonStrategy) => void;
  onUpdateStrategy: (strategyId: string, updates: Partial<SegmentedComparisonStrategy>) => void;
  onRemoveStrategy: (strategyId: string) => void;
}

export function SegmentedComparisonConfiguration({
  segmentedComparisonStrategies,
  withdrawalStartYear,
  withdrawalEndYear,
  onAddStrategy,
  onUpdateStrategy,
  onRemoveStrategy,
}: SegmentedComparisonConfigurationProps) {

  // Add a new segmented comparison strategy
  const handleAddStrategy = () => {
    const newId = `segmented_strategy_${Date.now()}`;
    const defaultSegment = createDefaultWithdrawalSegment(
      "main",
      "Hauptphase",
      withdrawalStartYear,
      withdrawalEndYear,
    );

    const newStrategy: SegmentedComparisonStrategy = {
      id: newId,
      name: `Konfiguration ${segmentedComparisonStrategies.length + 1}`,
      segments: [defaultSegment],
    };

    onAddStrategy(newStrategy);
  };

  // Update strategy name
  const handleUpdateStrategyName = (strategyId: string, name: string) => {
    onUpdateStrategy(strategyId, { name });
  };

  // Update strategy segments
  const handleUpdateStrategySegments = (strategyId: string, segments: WithdrawalSegment[]) => {
    onUpdateStrategy(strategyId, { segments });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium mb-2">Geteilte Phasen Vergleich</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Erstelle und vergleiche verschiedene Konfigurationen von geteilten Entnahme-Phasen. 
          Jede Konfiguration kann mehrere Phasen mit unterschiedlichen Strategien enthalten.
        </p>

        <Button
          onClick={handleAddStrategy}
          className="mb-4"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Konfiguration hinzufügen
        </Button>
      </div>

      {segmentedComparisonStrategies.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Noch keine Vergleichskonfigurationen erstellt. 
              Klicke auf "Neue Konfiguration hinzufügen", um zu beginnen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {segmentedComparisonStrategies.map((strategy) => (
            <Card key={strategy.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor={`strategy-name-${strategy.id}`}>
                      Konfigurationsname
                    </Label>
                    <Input
                      id={`strategy-name-${strategy.id}`}
                      value={strategy.name}
                      onChange={(e) => handleUpdateStrategyName(strategy.id, e.target.value)}
                      className="mt-1"
                      placeholder="z.B. Konservativ-Aggressiv"
                    />
                  </div>
                  <Button
                    onClick={() => onRemoveStrategy(strategy.id)}
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">
                      Phasen konfigurieren ({strategy.segments.length} Phase{strategy.segments.length !== 1 ? 'n' : ''})
                    </Label>
                    <div className="mt-2">
                      <WithdrawalSegmentForm
                        segments={strategy.segments}
                        onSegmentsChange={(segments) => 
                          handleUpdateStrategySegments(strategy.id, segments)
                        }
                        withdrawalStartYear={withdrawalStartYear}
                        withdrawalEndYear={withdrawalEndYear}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {segmentedComparisonStrategies.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">💡 Hinweise zum Vergleich</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Jede Konfiguration kann verschiedene Phasen mit unterschiedlichen Strategien haben</li>
            <li>• Der Vergleich zeigt Endkapital, Gesamtentnahme und Laufzeit für jede Konfiguration</li>
            <li>• Alle Konfigurationen verwenden das gleiche Startkapital aus der Ansparphase</li>
          </ul>
        </div>
      )}
    </div>
  );
}