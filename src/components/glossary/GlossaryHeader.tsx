import { BookOpen, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

export function GlossaryHeader() {
  const navigate = useNavigate()

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 -ml-2"
          aria-label="Zurück zur Startseite"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finanzglossar</h1>
            <p className="text-gray-600 text-lg">
              Alphabetisch sortierte Erklärungen wichtiger Finanzbegriffe für die deutsche Finanzplanung
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
