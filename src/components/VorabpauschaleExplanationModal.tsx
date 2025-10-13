import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import type { VorabpauschaleDetails } from '../utils/simulate'

interface VorabpauschaleExplanationModalProps {
  open: boolean
  onClose: () => void
  selectedVorabDetails: VorabpauschaleDetails | null
}

const VorabpauschaleExplanationModal = ({
  open,
  onClose,
  selectedVorabDetails,
}: VorabpauschaleExplanationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📊 Vorabpauschale-Berechnung Schritt für Schritt</DialogTitle>
        </DialogHeader>
        <div>
          {selectedVorabDetails && (
            <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              <div style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef',
              }}
              >
                <h5 style={{ color: '#1976d2', marginBottom: '12px' }}>🎯 Was ist die Vorabpauschale?</h5>
                <p style={{ margin: '0 0 12px 0' }}>
                  Die Vorabpauschale ist eine deutsche Steuerregelung für thesaurierende Investmentfonds.
                  Sie besteuert fiktive Erträge jährlich, auch wenn diese noch nicht realisiert wurden.
                </p>
                <p style={{ margin: '0' }}>
                  <strong>Grundprinzip:</strong>
                  {' '}
                  Es wird der geringere Betrag zwischen dem
                  <em> Basisertrag</em>
                  {' '}
                  (fiktiver Ertrag) und dem
                  <em>tatsächlichen Gewinn</em>
                  {' '}
                  besteuert.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ color: '#1976d2', marginBottom: '16px' }}>🧮 Schritt-für-Schritt Berechnung</h5>

                <div style={{
                  display: 'grid',
                  gap: '16px',
                  gridTemplateColumns: '1fr',
                  maxWidth: '100%',
                }}
                >
                  <div style={{
                    background: '#fff3e0',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #ffcc80',
                  }}
                  >
                    <strong>Schritt 1: Basiszins ermitteln</strong>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      Der jährliche Basiszins wird vom Bundesfinanzministerium festgelegt.
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#fff',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                    >
                      Basiszins =
                      {' '}
                      {(selectedVorabDetails.basiszins * 100).toFixed(2)}
                      %
                    </div>
                  </div>

                  <div style={{
                    background: '#e8f5e8',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #81c784',
                  }}
                  >
                    <strong>Schritt 2: Basisertrag berechnen</strong>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      70% des theoretischen Ertrags bei Basiszins, anteilig für den Besitzzeitraum.
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#fff',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                    >
                      Startkapital × Basiszins × 70% × (
                      {selectedVorabDetails.anteilImJahr}
                      /12)
                      <br />
                      =
                      {' '}
                      Startkapital ×
                      {' '}
                      {(selectedVorabDetails.basiszins * 100).toFixed(2)}
                      % × 70% × (
                      {selectedVorabDetails.anteilImJahr}
                      /12)
                      <br />
                      =
                      {' '}
                      <strong>
                        {Number(selectedVorabDetails.basisertrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        {' '}
                        €
                      </strong>
                    </div>
                  </div>

                  <div style={{
                    background: '#e3f2fd',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #64b5f6',
                  }}
                  >
                    <strong>Schritt 3: Tatsächlichen Gewinn ermitteln</strong>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      Der reale Wertzuwachs der Anlage im betrachteten Jahr.
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#fff',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                    >
                      Tatsächlicher Gewinn =
                      {' '}
                      {Number(selectedVorabDetails.jahresgewinn).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      {' '}
                      €
                    </div>
                  </div>

                  <div style={{
                    background: '#f3e5f5',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #ba68c8',
                  }}
                  >
                    <strong>Schritt 4: Vorabpauschale bestimmen</strong>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      Das Minimum aus Basisertrag und tatsächlichem Gewinn (nie negativ).
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#fff',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                    >
                      Vorabpauschale = min(
                      {Number(selectedVorabDetails.basisertrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      {' '}
                      €,
                      {' '}
                      {Number(selectedVorabDetails.jahresgewinn).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      {' '}
                      €)
                      <br />
                      = max(0,
                      {' '}
                      <strong>
                        {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        {' '}
                        €
                      </strong>
                      )
                    </div>
                  </div>

                  <div style={{
                    background: '#ffebee',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #ef5350',
                  }}
                  >
                    <strong>Schritt 5: Steuer berechnen (vor Freibetrag)</strong>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      Kapitalertragsteuer auf die Vorabpauschale, reduziert um Teilfreistellung.
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#fff',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                    >
                      Steuer =
                      {' '}
                      {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      {' '}
                      € × Steuersatz × (1 - Teilfreistellung)
                      <br />
                      =
                      {' '}
                      <strong>
                        {Number(selectedVorabDetails.steuerVorFreibetrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        {' '}
                        €
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#e8f5e8',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #81c784',
              }}
              >
                <h5 style={{ color: '#2e7d32', marginBottom: '12px' }}>✅ Endergebnis</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <strong>Vorabpauschale:</strong>
                    <br />
                    {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    {' '}
                    €
                  </div>
                  <div>
                    <strong>Steuer (vor Freibetrag):</strong>
                    <br />
                    {Number(selectedVorabDetails.steuerVorFreibetrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    {' '}
                    €
                  </div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  💡
                  {' '}
                  <strong>Hinweis:</strong>
                  {' '}
                  Der jährliche Sparerpauschfreibetrag reduziert die tatsächlich zu zahlende Steuer.
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>
              Verstanden
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VorabpauschaleExplanationModal
