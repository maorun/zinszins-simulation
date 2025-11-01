interface IntroductionSectionProps {
  introduction: string
}

const IntroductionSection = ({ introduction }: IntroductionSectionProps) => {
  return (
    <div style={{
      background: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e9ecef',
    }}
    >
      <h5 style={{ color: '#1976d2', marginBottom: '12px' }}>🎯 Erklärung</h5>
      <p style={{ margin: '0' }}>
        {introduction}
      </p>
    </div>
  )
}

export default IntroductionSection
