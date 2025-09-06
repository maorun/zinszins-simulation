import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import ReturnConfiguration from './ReturnConfiguration';
import TaxConfiguration from './TaxConfiguration';
import SimulationConfiguration from './SimulationConfiguration';
import { useParameterExport } from '../hooks/useParameterExport';

const SimulationParameters = () => {
  const { exportParameters, isExporting, lastExportResult } = useParameterExport();

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>⚙️ Konfiguration</CardTitle>
          <Button
            variant={getExportButtonVariant()}
            size="sm"
            onClick={handleExportClick}
            disabled={isExporting}
            title="Exportiert alle Parameter in die Zwischenablage für Entwicklung und Fehlerbeschreibung"
          >
            {getExportButtonText()}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="form-grid">
          <TimeRangeConfiguration />
          <ReturnConfiguration />
          <TaxConfiguration />
          <SimulationConfiguration />
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationParameters;
