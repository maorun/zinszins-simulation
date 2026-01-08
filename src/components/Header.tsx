import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from './ui/button'

const Header = () => {
  return (
    <header className="mb-3 sm:mb-4">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1.5 sm:mb-2 md:text-3xl lg:text-4xl">
            Zinseszins-Simulation
          </h1>
          <p className="text-sm text-gray-600 md:text-base px-1">
            Berechne deine Kapitalentwicklung mit deutschen Steuerregeln
          </p>
        </div>
        <div className="ml-4">
          <Link to="/glossar">
            <Button variant="outline" size="sm" className="flex items-center gap-2" aria-label="Zum Finanzglossar">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Glossar</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
