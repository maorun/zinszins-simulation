import { Button, ButtonGroup, Message, Panel } from 'rsuite';
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
    <Panel header="💾 Konfiguration verwalten" bordered collapsible defaultExpanded={false}>
      <Message type="info" showIcon>
        <strong>Automatisches Speichern:</strong> Ihre Einstellungen werden automatisch beim Ändern gespeichert und beim nächsten Besuch wiederhergestellt.
      </Message>
      
      <div style={{ marginTop: '1rem' }}>
        <ButtonGroup>
          <Button 
            appearance="primary" 
            disabled={!hasStoredConfig}
            onClick={handleClearConfiguration}
          >
            🗑️ Einstellungen löschen
          </Button>
        </ButtonGroup>
        
        {hasStoredConfig ? (
          <Message type="success" showIcon style={{ marginTop: '1rem' }}>
            ✅ Gespeicherte Konfiguration gefunden - wird automatisch geladen
          </Message>
        ) : (
          <Message type="warning" showIcon style={{ marginTop: '1rem' }}>
            ⚠️ Keine gespeicherte Konfiguration - Standardwerte werden verwendet
          </Message>
        )}
      </div>
    </Panel>
  );
}