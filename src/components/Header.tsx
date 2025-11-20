import { TutorialManager } from './TutorialManager'

const Header = () => {
  return (
    <header className="mb-3 sm:mb-4">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1.5 sm:mb-2 md:text-3xl lg:text-4xl">
          Zinseszins-Simulation
        </h1>
        <p className="text-sm text-gray-600 mb-3 sm:mb-4 md:text-base px-1">
          Berechne deine Kapitalentwicklung mit deutschen Steuerregeln
        </p>
      </div>
      <div className="flex justify-center mt-2">
        <TutorialManager />
      </div>
    </header>
  )
}

export default Header
