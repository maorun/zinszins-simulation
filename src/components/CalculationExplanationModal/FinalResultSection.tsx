interface FinalResultSectionProps {
  finalResult: {
    title: string
    values: Array<{ label: string, value: string }>
  }
}

const FinalResultSection = ({ finalResult }: FinalResultSectionProps) => {
  return (
    <div style={{
      background: '#e8f5e8',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #81c784',
    }}
    >
      <h5 style={{ color: '#2e7d32', marginBottom: '12px' }}>
        ✅
        {finalResult.title}
      </h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {finalResult.values.map((item, index) => (
          <div key={index}>
            <strong>
              {item.label}
              :
            </strong>
            <br />
            {item.value}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinalResultSection
