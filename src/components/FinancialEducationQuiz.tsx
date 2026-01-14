/**
 * Financial Education Quiz Component
 *
 * Interactive quiz to help users test their knowledge of:
 * - German tax law (Vorabpauschale, Teilfreistellung, etc.)
 * - Retirement planning
 * - Portfolio management
 * - Risk management
 */

import { CollapsibleCard } from './ui/collapsible-card'
import { QuizConfiguration } from './quiz/QuizConfiguration'
import { QuizQuestionDisplay } from './quiz/QuizQuestionDisplay'
import { QuizResults } from './quiz/QuizResults'
import { useQuizState } from '../hooks/useQuizState'

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
export function FinancialEducationQuiz({ className, defaultOpen = false }: FinancialEducationQuizProps) {
  const quizState = useQuizState()

  return (
    <CollapsibleCard title="🎓 Finanzbildungs-Quiz" className={className} defaultOpen={defaultOpen}>
      {!quizState.quizStarted ? (
        <QuizConfiguration
          selectedCategory={quizState.selectedCategory}
          selectedDifficulty={quizState.selectedDifficulty}
          questionCount={quizState.questionCount}
          onCategoryChange={quizState.setSelectedCategory}
          onDifficultyChange={quizState.setSelectedDifficulty}
          onQuestionCountChange={quizState.setQuestionCount}
          onStartQuiz={quizState.handleStartQuiz}
        />
      ) : quizState.isQuizComplete ? (
        <QuizResults stats={quizState.stats} onRestartQuiz={quizState.handleRestartQuiz} />
      ) : quizState.currentQuestion ? (
        <QuizQuestionDisplay
          question={quizState.currentQuestion}
          currentIndex={quizState.currentQuestionIndex}
          totalQuestions={quizState.filteredQuestions.length}
          selectedAnswer={quizState.selectedAnswer}
          hasAnswered={quizState.hasAnswered}
          onAnswerSelect={quizState.handleAnswerSelect}
          onSubmitAnswer={quizState.handleSubmitAnswer}
          onNextQuestion={quizState.handleNextQuestion}
          onRestartQuiz={quizState.handleRestartQuiz}
        />
      ) : null}
    </CollapsibleCard>
  )
}
