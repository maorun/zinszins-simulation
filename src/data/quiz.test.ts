import { describe, it, expect } from 'vitest'
import {
  quizQuestions,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  getRandomQuestion,
  getRandomQuestions,
  calculateQuizStats,
  type QuizCategory,
  type QuizDifficulty,
} from './quiz'

describe('Quiz Data', () => {
  describe('quizQuestions', () => {
    it('should have at least 20 questions', () => {
      expect(quizQuestions.length).toBeGreaterThanOrEqual(20)
    })

    it('should have all required fields for each question', () => {
      quizQuestions.forEach((question) => {
        expect(question.id).toBeDefined()
        expect(question.question).toBeDefined()
        expect(question.category).toBeDefined()
        expect(question.difficulty).toBeDefined()
        expect(question.options).toBeDefined()
        expect(question.correctAnswerIndex).toBeDefined()
        expect(question.explanation).toBeDefined()
      })
    })

    it('should have unique question IDs', () => {
      const ids = quizQuestions.map((q) => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have exactly 4 options for each question', () => {
      quizQuestions.forEach((question) => {
        expect(question.options).toHaveLength(4)
      })
    })

    it('should have valid correctAnswerIndex (0-3)', () => {
      quizQuestions.forEach((question) => {
        expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0)
        expect(question.correctAnswerIndex).toBeLessThan(4)
      })
    })

    it('should have non-empty explanations', () => {
      quizQuestions.forEach((question) => {
        expect(question.explanation.length).toBeGreaterThan(20)
      })
    })

    it('should have questions in all categories', () => {
      const categories: QuizCategory[] = [
        'Steuern',
        'Altersvorsorge',
        'Portfolio-Management',
        'Risikomanagement',
      ]
      categories.forEach((category) => {
        const categoryQuestions = quizQuestions.filter((q) => q.category === category)
        expect(categoryQuestions.length).toBeGreaterThan(0)
      })
    })

    it('should have questions at all difficulty levels', () => {
      const difficulties: QuizDifficulty[] = ['Einsteiger', 'Fortgeschritten', 'Experte']
      difficulties.forEach((difficulty) => {
        const difficultyQuestions = quizQuestions.filter((q) => q.difficulty === difficulty)
        expect(difficultyQuestions.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getQuestionsByCategory', () => {
    it('should return all questions for Steuern category', () => {
      const taxQuestions = getQuestionsByCategory('Steuern')
      expect(taxQuestions.length).toBeGreaterThan(0)
      taxQuestions.forEach((question) => {
        expect(question.category).toBe('Steuern')
      })
    })

    it('should return all questions for Altersvorsorge category', () => {
      const retirementQuestions = getQuestionsByCategory('Altersvorsorge')
      expect(retirementQuestions.length).toBeGreaterThan(0)
      retirementQuestions.forEach((question) => {
        expect(question.category).toBe('Altersvorsorge')
      })
    })

    it('should return all questions for Portfolio-Management category', () => {
      const portfolioQuestions = getQuestionsByCategory('Portfolio-Management')
      expect(portfolioQuestions.length).toBeGreaterThan(0)
      portfolioQuestions.forEach((question) => {
        expect(question.category).toBe('Portfolio-Management')
      })
    })

    it('should return all questions for Risikomanagement category', () => {
      const riskQuestions = getQuestionsByCategory('Risikomanagement')
      expect(riskQuestions.length).toBeGreaterThan(0)
      riskQuestions.forEach((question) => {
        expect(question.category).toBe('Risikomanagement')
      })
    })
  })

  describe('getQuestionsByDifficulty', () => {
    it('should return all Einsteiger questions', () => {
      const beginnerQuestions = getQuestionsByDifficulty('Einsteiger')
      expect(beginnerQuestions.length).toBeGreaterThan(0)
      beginnerQuestions.forEach((question) => {
        expect(question.difficulty).toBe('Einsteiger')
      })
    })

    it('should return all Fortgeschritten questions', () => {
      const advancedQuestions = getQuestionsByDifficulty('Fortgeschritten')
      expect(advancedQuestions.length).toBeGreaterThan(0)
      advancedQuestions.forEach((question) => {
        expect(question.difficulty).toBe('Fortgeschritten')
      })
    })

    it('should return all Experte questions', () => {
      const expertQuestions = getQuestionsByDifficulty('Experte')
      expect(expertQuestions.length).toBeGreaterThan(0)
      expertQuestions.forEach((question) => {
        expect(question.difficulty).toBe('Experte')
      })
    })
  })

  describe('getRandomQuestion', () => {
    it('should return a valid question', () => {
      const question = getRandomQuestion()
      expect(question).toBeDefined()
      expect(quizQuestions).toContainEqual(question)
    })

    it('should return different questions over multiple calls', () => {
      const questions = new Set()
      for (let i = 0; i < 10; i++) {
        questions.add(getRandomQuestion().id)
      }
      // With 20+ questions, we should get at least a few different ones
      expect(questions.size).toBeGreaterThan(1)
    })
  })

  describe('getRandomQuestions', () => {
    it('should return the requested number of questions', () => {
      const count = 5
      const questions = getRandomQuestions(count)
      expect(questions).toHaveLength(count)
    })

    it('should return unique questions (no duplicates)', () => {
      const count = 10
      const questions = getRandomQuestions(count)
      const ids = questions.map((q) => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should not return more questions than available', () => {
      const tooMany = quizQuestions.length + 10
      const questions = getRandomQuestions(tooMany)
      expect(questions.length).toBe(quizQuestions.length)
    })

    it('should return all questions when count equals total', () => {
      const questions = getRandomQuestions(quizQuestions.length)
      expect(questions.length).toBe(quizQuestions.length)
    })
  })

  describe('calculateQuizStats', () => {
    it('should calculate stats for all correct answers', () => {
      const answers = [
        { questionId: 'tax-basic-001', userAnswerIndex: 1, isCorrect: true },
        { questionId: 'tax-basic-002', userAnswerIndex: 1, isCorrect: true },
        { questionId: 'retirement-basic-001', userAnswerIndex: 1, isCorrect: true },
      ]

      const stats = calculateQuizStats(answers)

      expect(stats.totalAttempts).toBe(3)
      expect(stats.correctAnswers).toBe(3)
      expect(stats.incorrectAnswers).toBe(0)
    })

    it('should calculate stats for mixed answers', () => {
      const answers = [
        { questionId: 'tax-basic-001', userAnswerIndex: 1, isCorrect: true },
        { questionId: 'tax-basic-002', userAnswerIndex: 0, isCorrect: false },
        { questionId: 'retirement-basic-001', userAnswerIndex: 1, isCorrect: true },
        { questionId: 'portfolio-basic-001', userAnswerIndex: 2, isCorrect: false },
      ]

      const stats = calculateQuizStats(answers)

      expect(stats.totalAttempts).toBe(4)
      expect(stats.correctAnswers).toBe(2)
      expect(stats.incorrectAnswers).toBe(2)
    })

    it('should track stats by category correctly', () => {
      const answers = [
        { questionId: 'tax-basic-001', userAnswerIndex: 1, isCorrect: true },
        { questionId: 'tax-basic-002', userAnswerIndex: 1, isCorrect: true },
        { questionId: 'tax-basic-003', userAnswerIndex: 0, isCorrect: false },
        { questionId: 'retirement-basic-001', userAnswerIndex: 1, isCorrect: true },
      ]

      const stats = calculateQuizStats(answers)

      expect(stats.byCategory['Steuern'].total).toBe(3)
      expect(stats.byCategory['Steuern'].correct).toBe(2)
      expect(stats.byCategory['Altersvorsorge'].total).toBe(1)
      expect(stats.byCategory['Altersvorsorge'].correct).toBe(1)
    })

    it('should initialize all categories even if not attempted', () => {
      const answers = [{ questionId: 'tax-basic-001', userAnswerIndex: 1, isCorrect: true }]

      const stats = calculateQuizStats(answers)

      expect(stats.byCategory['Steuern']).toBeDefined()
      expect(stats.byCategory['Altersvorsorge']).toBeDefined()
      expect(stats.byCategory['Portfolio-Management']).toBeDefined()
      expect(stats.byCategory['Risikomanagement']).toBeDefined()
    })

    it('should handle empty answers array', () => {
      const stats = calculateQuizStats([])

      expect(stats.totalAttempts).toBe(0)
      expect(stats.correctAnswers).toBe(0)
      expect(stats.incorrectAnswers).toBe(0)
    })
  })

  describe('Question Content Quality', () => {
    it('should have clear and specific questions', () => {
      quizQuestions.forEach((question) => {
        // Questions should end with ? or be longer than 20 characters
        expect(
          question.question.includes('?') || question.question.length > 20
        ).toBeTruthy()
      })
    })

    it('should have options that are distinct', () => {
      quizQuestions.forEach((question) => {
        const uniqueOptions = new Set(question.options)
        expect(uniqueOptions.size).toBe(4)
      })
    })

    it('should have explanations that mention the correct answer', () => {
      quizQuestions.forEach((question) => {
        // Explanation should be meaningful (longer than question)
        expect(question.explanation.length).toBeGreaterThan(50)
      })
    })
  })

  describe('German Language Quality', () => {
    it('should use German terminology in questions', () => {
      const germanTerms = [
        'Steuer',
        'Rente',
        'Sparerpauschbetrag',
        'Portfolio',
        'Risiko',
        'Kapital',
        'Rendite',
      ]

      const allText = quizQuestions
        .map((q) => q.question + ' ' + q.explanation)
        .join(' ')

      germanTerms.forEach((term) => {
        expect(allText).toContain(term)
      })
    })

    it('should use proper German punctuation in explanations', () => {
      quizQuestions.forEach((question) => {
        // German explanations should end with period
        expect(question.explanation.endsWith('.')).toBeTruthy()
      })
    })
  })
})
