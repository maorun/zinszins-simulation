// Common styles for table cells
const thStyles = {
  padding: '10px',
  borderBottom: '1px solid #e5e5ea',
}

const thLeftStyle = {
  ...thStyles,
  textAlign: 'left' as const,
}

const thRightStyle = {
  ...thStyles,
  textAlign: 'right' as const,
}

/**
 * Table header component for comparison table
 */
export function ComparisonTableHeader() {
  return (
    <thead>
      <tr style={{ backgroundColor: '#f8f9fa' }}>
        <th style={thLeftStyle}>Strategie</th>
        <th style={thRightStyle}>Rendite</th>
        <th style={thRightStyle}>Endkapital</th>
        <th style={thRightStyle}>Ø Jährliche Entnahme</th>
        <th style={thRightStyle}>Vermögen reicht für</th>
      </tr>
    </thead>
  )
}
