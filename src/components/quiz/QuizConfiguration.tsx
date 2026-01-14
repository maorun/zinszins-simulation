/**
 * Quiz Configuration Component
 * Allows users to select category, difficulty, and number of questions
 */

import { Button } from '../ui/button'
import { GraduationCap } from 'lucide-react'
import type { QuizCategory, QuizDifficulty } from '../../data/quiz'

interface QuizConfigurationProps {
  selectedCategory: QuizCategory | 'Alle'
  selectedDifficulty: QuizDifficulty | 'Alle'
  questionCount: number
  onCategoryChange: (category: QuizCategory | 'Alle') => void
  onDifficultyChange: (difficulty: QuizDifficulty | 'Alle') => void
  onQuestionCountChange: (count: number) => void
  onStartQuiz: () => void
}

function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: {
  selectedCategory: QuizCategory | 'Alle'
  onCategoryChange: (category: QuizCategory | 'Alle') => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Kategorie</label>
      <div className="grid grid-cols-2 gap-2">
        {(['Alle', 'Steuern', 'Altersvorsorge', 'Portfolio-Management', 'Risikomanagement'] as const).map(
          (category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => onCategoryChange(category)}
              className="text-sm"
            >
              {category}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

function DifficultySelector({
  selectedDifficulty,
  onDifficultyChange,
}: {
  selectedDifficulty: QuizDifficulty | 'Alle'
  onDifficultyChange: (difficulty: QuizDifficulty | 'Alle') => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Schwierigkeitsgrad</label>
      <div className="grid grid-cols-2 gap-2">
        {(['Alle', 'Einsteiger', 'Fortgeschritten', 'Experte'] as const).map((difficulty) => (
          <Button
            key={difficulty}
            variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
            onClick={() => onDifficultyChange(difficulty)}
            className="text-sm"
          >
            {difficulty}
          </Button>
        ))}
      </div>
    </div>
  )
}

function QuestionCountSelector({
  questionCount,
  onQuestionCountChange,
}: {
  questionCount: number
  onQuestionCountChange: (count: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Anzahl Fragen: {questionCount}</label>
      <div className="grid grid-cols-3 gap-2">
        {[5, 10, 15].map((count) => (
          <Button
            key={count}
            variant={questionCount === count ? 'default' : 'outline'}
            onClick={() => onQuestionCountChange(count)}
            className="text-sm"
          >
            {count} Fragen
          </Button>
        ))}
      </div>
    </div>
  )
}

export function QuizConfiguration({
  selectedCategory,
  selectedDifficulty,
  questionCount,
  onCategoryChange,
  onDifficultyChange,
  onQuestionCountChange,
  onStartQuiz,
}: QuizConfigurationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-blue-600" />
        <h3 className="text-xl font-semibold mb-2">Finanzbildungs-Quiz</h3>
        <p className="text-gray-600 mb-6">
          Testen Sie Ihr Wissen über deutsches Steuerrecht, Altersvorsorge, Portfolio-Management und
          Risikomanagement.
        </p>
      </div>

      <div className="space-y-4">
        <CategorySelector selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
        <DifficultySelector selectedDifficulty={selectedDifficulty} onDifficultyChange={onDifficultyChange} />
        <QuestionCountSelector questionCount={questionCount} onQuestionCountChange={onQuestionCountChange} />

        <Button onClick={onStartQuiz} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <GraduationCap className="h-4 w-4 mr-2" />
          Quiz starten
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Hinweis:</strong> Das Quiz dient nur Bildungszwecken. Es ersetzt keine professionelle
          Steuer- oder Finanzberatung.
        </p>
      </div>
    </div>
  )
}
