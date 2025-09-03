import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useSimulation } from '../contexts/useSimulation';
import { hasConfiguration, clearConfiguration } from '../utils/config-storage';

/**
 * Configuration Management Panel Component
 * Provides user-friendly controls for save/load/reset configuration
 */
export default function ConfigurationManagement() {
  const { resetToDefaults } = useSimulation();

  const handleClearConfiguration = () => {
    if (confirm('Möchten Sie wirklich alle gespeicherten Einstellungen löschen und zu den Standardwerten zurückkehren?')) {
      clearConfiguration();
      resetToDefaults();
      alert('Konfiguration wurde gelöscht und auf Standardwerte zurückgesetzt.');
    }
  };

  const hasStoredConfig = hasConfiguration();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>💾 Konfiguration verwalten</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="info" className="mb-4">
          <AlertDescription>
            <strong>Automatisches Speichern:</strong> Ihre Einstellungen werden automatisch beim Ändern gespeichert und beim nächsten Besuch wiederhergestellt.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <Button 
              variant="destructive"
              disabled={!hasStoredConfig}
              onClick={handleClearConfiguration}
            >
              🗑️ Einstellungen löschen
            </Button>
          </div>
          
          {hasStoredConfig ? (
            <Alert variant="success">
              <AlertDescription>
                ✅ Gespeicherte Konfiguration gefunden - wird automatisch geladen
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning">
              <AlertDescription>
                ⚠️ Keine gespeicherte Konfiguration - Standardwerte werden verwendet
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}