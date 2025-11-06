import type { VorabpauschaleDetails } from '../utils/simulate'

interface VorabpauschaleResultSummaryProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const VorabpauschaleResultSummary = ({ selectedVorabDetails }: VorabpauschaleResultSummaryProps) => {
  return (
    <div
      style={{
        background: '#e8f5e8',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #81c784',
      }}
    >
      <h5 style={{ color: '#2e7d32', marginBottom: '12px' }}>✅ Endergebnis</h5>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        <div>
          <strong>Vorabpauschale:</strong>
          <br />
          {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
          })}{' '}
          €
        </div>
        <div>
          <strong>Steuer (vor Freibetrag):</strong>
          <br />
          {Number(selectedVorabDetails.steuerVorFreibetrag).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
          })}{' '}
          €
        </div>
      </div>
      <div style={{ marginTop: '12px', fontSize: '0.9rem', fontStyle: 'italic' }}>
        💡 <strong>Hinweis:</strong> Der jährliche Sparerpauschfreibetrag reduziert die tatsächlich zu zahlende Steuer.
      </div>
    </div>
  )
}

export default VorabpauschaleResultSummary
