import React from 'react'
import { formatCurrency } from '../utils/currency'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  name: string
  Endkapital: number
  Einzahlungen: number
  Gewinne: number
}

interface SensitivityChartProps {
  data: ChartData[]
}

const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="Endkapital" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          <Line
            type="monotone"
            dataKey="Einzahlungen"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line type="monotone" dataKey="Gewinne" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SensitivityChart
