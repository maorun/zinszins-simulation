/**
 * Quiz Question Display Component
 * Shows a question with multiple choice answers and feedback
 */

import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { RadioGroup } from '../ui/radio-group'
import { Check, X } from 'lucide-react'
import type { QuizQuestion } from '../../data/quiz'

interface QuizQuestionDisplayProps {
  question: QuizQuestion
  currentIndex: number
  totalQuestions: number
  selectedAnswer: number | null
  hasAnswered: boolean
  onAnswerSelect: (index: number) => void
  onSubmitAnswer: () => void
  onNextQuestion: () => void
  onRestartQuiz: () => void
}

function QuizProgress({ currentIndex, totalQuestions }: { currentIndex: number; totalQuestions: number }) {
  const percentage = Math.round(((currentIndex + 1) / totalQuestions) * 100)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Frage {currentIndex + 1} von {totalQuestions}</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}

function getOptionClassName(
  isSelected: boolean,
  isCorrect: boolean,
  hasAnswered: boolean
): string {
  if (hasAnswered && isCorrect) {
    return 'border-green-500 bg-green-50'
  }
  if (hasAnswered && isSelected && !isCorrect) {
    return 'border-red-500 bg-red-50'
  }
  if (isSelected) {
    return 'border-blue-500 bg-blue-50'
  }
  return 'border-gray-200 hover:border-gray-300 bg-white'
}

function AnswerOption({
  option,
  isSelected,
  isCorrect,
  hasAnswered,
  onSelect,
}: {
  option: string
  isSelected: boolean
  isCorrect: boolean
  hasAnswered: boolean
  onSelect: () => void
}) {
  const showCorrect = hasAnswered && isCorrect
  const showIncorrect = hasAnswered && isSelected && !isCorrect
  const colorClassName = getOptionClassName(isSelected, isCorrect, hasAnswered)
  const cursorClassName = hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'
  
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={hasAnswered}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${colorClassName} ${cursorClassName}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex-1">{option}</span>
        {showCorrect && <Check className="h-5 w-5 text-green-600 flex-shrink-0" />}
        {showIncorrect && <X className="h-5 w-5 text-red-600 flex-shrink-0" />}
      </div>
    </button>
  )
}

function AnswerExplanation({
  isCorrect,
  explanation,
}: {
  isCorrect: boolean
  explanation: string
}) {
  const bgColor = isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
  const textColor = isCorrect ? 'text-green-900' : 'text-red-900'
  const icon = isCorrect ? <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /> : <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
  const title = isCorrect ? 'Richtig! 🎉' : 'Leider falsch.'
  
  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-start gap-3 mb-2">
        {icon}
        <div>
          <p className={`font-semibold mb-2 ${textColor}`}>{title}</p>
          <p className="text-gray-700">{explanation}</p>
        </div>
      </div>
    </div>
  )
}

function ActionButtons({
  hasAnswered,
  isLastQuestion,
  selectedAnswer,
  onSubmitAnswer,
  onNextQuestion,
  onRestartQuiz,
}: {
  hasAnswered: boolean
  isLastQuestion: boolean
  selectedAnswer: number | null
  onSubmitAnswer: () => void
  onNextQuestion: () => void
  onRestartQuiz: () => void
}) {
  if (!hasAnswered) {
    return (
      <Button
        onClick={onSubmitAnswer}
        disabled={selectedAnswer === null}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
      >
        Antwort prüfen
      </Button>
    )
  }
  
  if (!isLastQuestion) {
    return (
      <Button onClick={onNextQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
        Nächste Frage
      </Button>
    )
  }
  
  return (
    <Button onClick={onRestartQuiz} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
      Ergebnisse anzeigen
    </Button>
  )
}

function QuestionContent({ question }: { question: QuizQuestion }) {
  return (
    <>
      <div className="flex gap-2">
        <Badge variant="outline">{question.category}</Badge>
        <Badge variant="outline">{question.difficulty}</Badge>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold">{question.question}</h4>
      </div>
    </>
  )
}

export function QuizQuestionDisplay({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  hasAnswered,
  onAnswerSelect,
  onSubmitAnswer,
  onNextQuestion,
  onRestartQuiz,
}: QuizQuestionDisplayProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1
  const isAnswerCorrect = selectedAnswer === question.correctAnswerIndex

  return (
    <div className="space-y-6">
      <QuizProgress currentIndex={currentIndex} totalQuestions={totalQuestions} />
      <QuestionContent question={question} />

      <RadioGroup value={selectedAnswer?.toString() || ''}>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <AnswerOption
              key={index}
              option={option}
              isSelected={selectedAnswer === index}
              isCorrect={index === question.correctAnswerIndex}
              hasAnswered={hasAnswered}
              onSelect={() => onAnswerSelect(index)}
            />
          ))}
        </div>
      </RadioGroup>

      {hasAnswered && (
        <AnswerExplanation isCorrect={isAnswerCorrect} explanation={question.explanation} />
      )}

      <div className="flex gap-2">
        <ActionButtons
          hasAnswered={hasAnswered}
          isLastQuestion={isLastQuestion}
          selectedAnswer={selectedAnswer}
          onSubmitAnswer={onSubmitAnswer}
          onNextQuestion={onNextQuestion}
          onRestartQuiz={onRestartQuiz}
        />
      </div>
    </div>
  )
}
