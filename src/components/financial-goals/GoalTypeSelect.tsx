import { Label } from '../ui/label'

interface GoalTypeSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
}

export function GoalTypeSelect({ id, value, onChange }: GoalTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Zieltyp</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="retirement">Altersvorsorge</option>
        <option value="independence">Finanzielle Unabhängigkeit</option>
        <option value="custom">Benutzerdefiniert</option>
      </select>
    </div>
  )
}
