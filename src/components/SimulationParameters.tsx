import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import TaxConfiguration from './TaxConfiguration';
import SimulationConfiguration from './SimulationConfiguration';
import { useParameterExport } from '../hooks/useParameterExport';

const SimulationParameters = () => {
  const { exportParameters, isExporting, lastExportResult } = useParameterExport();
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default

  const handleExportClick = async () => {
    await exportParameters();
  };

  const getExportButtonText = () => {
    if (isExporting) return 'Exportiere...';
    if (lastExportResult === 'success') return '✓ Kopiert!';
    if (lastExportResult === 'error') return '✗ Fehler';
    return '📋 Parameter exportieren';
  };

  const getExportButtonVariant = () => {
    if (lastExportResult === 'success') return 'secondary';
    if (lastExportResult === 'error') return 'destructive';
    return 'outline';
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left">⚙️ Konfiguration</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={getExportButtonVariant()}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportClick();
                  }}
                  disabled={isExporting}
                  title="Exportiert alle Parameter in die Zwischenablage für Entwicklung und Fehlerbeschreibung"
                >
                  {getExportButtonText()}
                </Button>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="form-grid">
              <SimulationConfiguration />
              <TimeRangeConfiguration />
              <TaxConfiguration />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SimulationParameters;
