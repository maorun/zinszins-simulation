/**
 * Financial Education Quiz Component
 *
 * Interactive quiz to help users test their knowledge of:
 * - German tax law (Vorabpauschale, Teilfreistellung, etc.)
 * - Retirement planning
 * - Portfolio management
 * - Risk management
 */

import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { RadioGroup } from './ui/radio-group'
import { 
  quizQuestions, 
  getQuestionsByCategory, 
  getRandomQuestions,
  calculateQuizStats,
  type QuizCategory,
  type QuizDifficulty 
} from '../data/quiz'
import { GraduationCap, Check, X, RefreshCw, TrendingUp } from 'lucide-react'
import { CollapsibleCard } from './ui/collapsible-card'

/**
 * Props for FinancialEducationQuiz component
 */
interface FinancialEducationQuizProps {
  /** Optional class name for styling */
  className?: string
  /** Whether to start expanded */
  defaultOpen?: boolean
}

/**
 * Component to display and manage the quiz
 */
export function FinancialEducationQuiz({ 
  className,
  defaultOpen = false
}: FinancialEducationQuizProps) {
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [answers, setAnswers] = useState<Array<{
    questionId: string
    userAnswerIndex: number
    isCorrect: boolean
  }>>([])

  // Quiz configuration state
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'Alle'>('Alle')
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | 'Alle'>('Alle')
  const [questionCount, setQuestionCount] = useState(10)
  const [quizStarted, setQuizStarted] = useState(false)

  // Filter questions based on selection
  const filteredQuestions = useMemo(() => {
    let _questions = [...quizQuestions]
    
    if (selectedCategory !== 'Alle') {
      _questions = getQuestionsByCategory(selectedCategory)
    }
    
    if (selectedDifficulty !== 'Alle') {
      _questions = _questions.filter(q => q.difficulty === selectedDifficulty)
    }
    
    return getRandomQuestions(questionCount).filter(q => {
      if (selectedCategory !== 'Alle' && q.category !== selectedCategory) return false
      if (selectedDifficulty !== 'Alle' && q.difficulty !== selectedDifficulty) return false
      return true
    }).slice(0, questionCount)
  }, [selectedCategory, selectedDifficulty, questionCount])

  // Current question
  const currentQuestion = filteredQuestions[currentQuestionIndex]

  // Quiz statistics
  const stats = useMemo(() => calculateQuizStats(answers), [answers])

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return
    setSelectedAnswer(answerIndex)
  }

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex
    setHasAnswered(true)
    
    setAnswers([...answers, {
      questionId: currentQuestion.id,
      userAnswerIndex: selectedAnswer,
      isCorrect
    }])
  }

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setHasAnswered(false)
    }
  }

  // Handle quiz restart
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswers([])
    setQuizStarted(false)
  }

  // Start quiz
  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswers([])
  }

  // Check if quiz is complete
  const isQuizComplete = quizStarted && currentQuestionIndex === filteredQuestions.length - 1 && hasAnswered

  // Render quiz configuration
  const renderQuizConfiguration = () => (
    <div className="space-y-6">
      <div className="text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-blue-600" />
        <h3 className="text-xl font-semibold mb-2">Finanzbildungs-Quiz</h3>
        <p className="text-gray-600 mb-6">
          Testen Sie Ihr Wissen über deutsches Steuerrecht, Altersvorsorge, Portfolio-Management und Risikomanagement.
        </p>
      </div>

      <div className="space-y-4">
        {/* Category selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Kategorie</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Alle', 'Steuern', 'Altersvorsorge', 'Portfolio-Management', 'Risikomanagement'] as const).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Difficulty selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Schwierigkeitsgrad</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Alle', 'Einsteiger', 'Fortgeschritten', 'Experte'] as const).map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty(difficulty)}
                className="text-sm"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Question count selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Anzahl Fragen: {questionCount}</label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((count) => (
              <Button
                key={count}
                variant={questionCount === count ? 'default' : 'outline'}
                onClick={() => setQuestionCount(count)}
                className="text-sm"
              >
                {count} Fragen
              </Button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <Button 
          onClick={handleStartQuiz}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <GraduationCap className="h-4 w-4 mr-2" />
          Quiz starten
        </Button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Hinweis:</strong> Das Quiz dient nur Bildungszwecken. Es ersetzt keine professionelle Steuer- oder Finanzberatung.
        </p>
      </div>
    </div>
  )

  // Render question
  const renderQuestion = () => {
    if (!currentQuestion) return null

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Frage {currentQuestionIndex + 1} von {filteredQuestions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / filteredQuestions.length) * 100} />
        </div>

        {/* Question info */}
        <div className="flex gap-2">
          <Badge variant="outline">{currentQuestion.category}</Badge>
          <Badge variant="outline">{currentQuestion.difficulty}</Badge>
        </div>

        {/* Question text */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold">{currentQuestion.question}</h4>
        </div>

        {/* Answer options */}
        <RadioGroup value={selectedAnswer?.toString() || ''}>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = index === currentQuestion.correctAnswerIndex
              const showCorrect = hasAnswered && isCorrectAnswer
              const showIncorrect = hasAnswered && isSelected && !isCorrectAnswer

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {showCorrect && <Check className="h-5 w-5 text-green-600 flex-shrink-0" />}
                    {showIncorrect && <X className="h-5 w-5 text-red-600 flex-shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
        </RadioGroup>

        {/* Explanation */}
        {hasAnswered && (
          <div className={`p-4 rounded-lg ${
            selectedAnswer === currentQuestion.correctAnswerIndex
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex items-start gap-3 mb-2">
              {selectedAnswer === currentQuestion.correctAnswerIndex ? (
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold mb-2 ${
                  selectedAnswer === currentQuestion.correctAnswerIndex
                    ? 'text-green-900'
                    : 'text-red-900'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswerIndex
                    ? 'Richtig! 🎉'
                    : 'Leider falsch.'}
                </p>
                <p className="text-gray-700">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!hasAnswered ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Antwort prüfen
            </Button>
          ) : (
            <>
              {currentQuestionIndex < filteredQuestions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Nächste Frage
                </Button>
              ) : (
                <Button
                  onClick={handleRestartQuiz}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Neues Quiz starten
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Render results
  const renderResults = () => {
    const percentage = stats.totalAttempts > 0 
      ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) 
      : 0

    return (
      <div className="space-y-6">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold mb-2">Quiz abgeschlossen!</h3>
          <p className="text-gray-600">Hier ist Ihre Auswertung:</p>
        </div>

        {/* Overall stats */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {percentage}%
            </div>
            <p className="text-gray-700">
              {stats.correctAnswers} von {stats.totalAttempts} Fragen richtig beantwortet
            </p>
          </div>
        </Card>

        {/* Stats by category */}
        <div>
          <h4 className="font-semibold mb-3">Ergebnis nach Kategorie</h4>
          <div className="space-y-3">
            {Object.entries(stats.byCategory).map(([category, categoryStats]) => {
              if (categoryStats.total === 0) return null
              
              const categoryPercentage = Math.round((categoryStats.correct / categoryStats.total) * 100)
              
              return (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{category}</span>
                    <span className="text-gray-600">
                      {categoryStats.correct}/{categoryStats.total} ({categoryPercentage}%)
                    </span>
                  </div>
                  <Progress value={categoryPercentage} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance feedback */}
        <div className={`p-4 rounded-lg ${
          percentage >= 80
            ? 'bg-green-50 border-2 border-green-200'
            : percentage >= 60
            ? 'bg-yellow-50 border-2 border-yellow-200'
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          <p className="font-semibold mb-2">
            {percentage >= 80
              ? '🎉 Ausgezeichnet!'
              : percentage >= 60
              ? '👍 Gute Leistung!'
              : '📚 Noch Verbesserungspotenzial'}
          </p>
          <p className="text-sm text-gray-700">
            {percentage >= 80
              ? 'Sie haben ein sehr gutes Verständnis der deutschen Finanzplanung und Steuerregeln!'
              : percentage >= 60
              ? 'Sie haben gute Grundkenntnisse. Vertiefen Sie Ihr Wissen in den Bereichen, wo Sie Fehler gemacht haben.'
              : 'Nutzen Sie die Erklärungen und das Glossar, um Ihr Wissen zu erweitern. Übung macht den Meister!'}
          </p>
        </div>

        {/* Restart button */}
        <Button
          onClick={handleRestartQuiz}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Neues Quiz starten
        </Button>
      </div>
    )
  }

  return (
    <CollapsibleCard
      title="🎓 Finanzbildungs-Quiz"
      className={className}
      defaultOpen={defaultOpen}
    >
      {!quizStarted ? renderQuizConfiguration() : isQuizComplete ? renderResults() : renderQuestion()}
    </CollapsibleCard>
  )
}
