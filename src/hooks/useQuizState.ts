/**
 * Custom hook for quiz state management
 */

import { useState, useMemo } from 'react'
import {
  quizQuestions,
  getQuestionsByCategory,
  getRandomQuestions,
  calculateQuizStats,
  type QuizCategory,
  type QuizDifficulty,
  type QuizQuestion,
} from '../data/quiz'

function useQuizConfiguration() {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'Alle'>('Alle')
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | 'Alle'>('Alle')
  const [questionCount, setQuestionCount] = useState(10)

  const filteredQuestions = useMemo(() => {
    let _questions = [...quizQuestions]

    if (selectedCategory !== 'Alle') {
      _questions = getQuestionsByCategory(selectedCategory)
    }

    if (selectedDifficulty !== 'Alle') {
      _questions = _questions.filter((q) => q.difficulty === selectedDifficulty)
    }

    return getRandomQuestions(questionCount)
      .filter((q: QuizQuestion) => {
        if (selectedCategory !== 'Alle' && q.category !== selectedCategory) return false
        if (selectedDifficulty !== 'Alle' && q.difficulty !== selectedDifficulty) return false
        return true
      })
      .slice(0, questionCount)
  }, [selectedCategory, selectedDifficulty, questionCount])

  return {
    selectedCategory,
    selectedDifficulty,
    questionCount,
    filteredQuestions,
    setSelectedCategory,
    setSelectedDifficulty,
    setQuestionCount,
  }
}

function useQuizHandlers(
  currentQuestionIndex: number,
  setCurrentQuestionIndex: (index: number) => void,
  selectedAnswer: number | null,
  setSelectedAnswer: (answer: number | null) => void,
  hasAnswered: boolean,
  setHasAnswered: (answered: boolean) => void,
  answers: Array<{ questionId: string; userAnswerIndex: number; isCorrect: boolean }>,
  setAnswers: (answers: Array<{ questionId: string; userAnswerIndex: number; isCorrect: boolean }>) => void,
  setQuizStarted: (started: boolean) => void,
  currentQuestion: QuizQuestion | undefined,
  filteredQuestionsLength: number
) {
  const handleAnswerSelect = (answerIndex: number) => {
    if (!hasAnswered) setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return
    const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex
    setHasAnswered(true)
    setAnswers([...answers, { questionId: currentQuestion.id, userAnswerIndex: selectedAnswer, isCorrect }])
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestionsLength - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setHasAnswered(false)
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswers([])
    setQuizStarted(false)
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswers([])
  }

  return { handleAnswerSelect, handleSubmitAnswer, handleNextQuestion, handleRestartQuiz, handleStartQuiz }
}

export function useQuizState() {
  const config = useQuizConfiguration()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [answers, setAnswers] = useState<
    Array<{
      questionId: string
      userAnswerIndex: number
      isCorrect: boolean
    }>
  >([])
  const [quizStarted, setQuizStarted] = useState(false)

  const currentQuestion = config.filteredQuestions[currentQuestionIndex]
  const stats = useMemo(() => calculateQuizStats(answers), [answers])

  const handlers = useQuizHandlers(
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswer,
    setSelectedAnswer,
    hasAnswered,
    setHasAnswered,
    answers,
    setAnswers,
    setQuizStarted,
    currentQuestion,
    config.filteredQuestions.length
  )

  const isQuizComplete = quizStarted && currentQuestionIndex === config.filteredQuestions.length - 1 && hasAnswered

  return {
    ...config,
    currentQuestionIndex,
    selectedAnswer,
    hasAnswered,
    answers,
    quizStarted,
    currentQuestion,
    stats,
    isQuizComplete,
    ...handlers,
  }
}
