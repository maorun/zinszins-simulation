/**
 * Table header component for comparison table
 */
export function ComparisonTableHeader() {
  return (
    <thead>
      <tr className="bg-[#f8f9fa]">
        <th className="p-[10px] border-b border-[#e5e5ea] text-left">Strategie</th>
        <th className="p-[10px] border-b border-[#e5e5ea] text-right">Rendite</th>
        <th className="p-[10px] border-b border-[#e5e5ea] text-right">Endkapital</th>
        <th className="p-[10px] border-b border-[#e5e5ea] text-right">Ø Jährliche Entnahme</th>
        <th className="p-[10px] border-b border-[#e5e5ea] text-right">Vermögen reicht für</th>
      </tr>
    </thead>
  )
}
