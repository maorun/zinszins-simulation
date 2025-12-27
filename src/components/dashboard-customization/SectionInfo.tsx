import { Eye, EyeOff } from 'lucide-react'
import { CardDescription, CardTitle } from '../ui/card'

interface SectionInfoProps {
  visible: boolean
  label: string
  description: string
}

/**
 * Section information display with icon, label, and description
 */
export function SectionInfo({ visible, label, description }: SectionInfoProps) {
  return (
    <div className="flex-1 min-w-0">
      <CardTitle className="text-base flex items-center gap-2">
        {visible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}

        {label}
      </CardTitle>

      <CardDescription className="mt-1 text-sm">{description}</CardDescription>
    </div>
  )
}
