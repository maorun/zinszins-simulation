import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Alert, AlertDescription } from './ui/alert';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
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
      toast.success('Konfiguration wurde gelöscht und auf Standardwerte zurückgesetzt.');
    }
  };

  const hasStoredConfig = hasConfiguration();

  return (
    <Card className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">💾 Konfiguration verwalten</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}