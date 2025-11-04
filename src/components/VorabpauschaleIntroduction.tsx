const VorabpauschaleIntroduction = () => {
  return (
    <div
      style={{
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
  )
}

export default VorabpauschaleIntroduction
