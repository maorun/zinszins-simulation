/**
 * Quiz Results Component
 * Displays quiz statistics and performance feedback
 */

import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Progress } from '../ui/progress'
import { RefreshCw, TrendingUp } from 'lucide-react'
import type { QuizStats } from '../../data/quiz'

interface QuizResultsProps {
  stats: QuizStats
  onRestartQuiz: () => void
}

function CategoryResults({ stats }: { stats: QuizStats }) {
  return (
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
  )
}

function PerformanceFeedback({ percentage }: { percentage: number }) {
  const feedbackConfig = percentage >= 80
    ? { bgColor: 'bg-green-50 border-2 border-green-200', title: '🎉 Ausgezeichnet!', message: 'Sie haben ein sehr gutes Verständnis der deutschen Finanzplanung und Steuerregeln!' }
    : percentage >= 60
    ? { bgColor: 'bg-yellow-50 border-2 border-yellow-200', title: '👍 Gute Leistung!', message: 'Sie haben gute Grundkenntnisse. Vertiefen Sie Ihr Wissen in den Bereichen, wo Sie Fehler gemacht haben.' }
    : { bgColor: 'bg-red-50 border-2 border-red-200', title: '📚 Noch Verbesserungspotenzial', message: 'Nutzen Sie die Erklärungen und das Glossar, um Ihr Wissen zu erweitern. Übung macht den Meister!' }

  return (
    <div className={`p-4 rounded-lg ${feedbackConfig.bgColor}`}>
      <p className="font-semibold mb-2">{feedbackConfig.title}</p>
      <p className="text-sm text-gray-700">{feedbackConfig.message}</p>
    </div>
  )
}

export function QuizResults({ stats, onRestartQuiz }: QuizResultsProps) {
  const percentage =
    stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0

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
          <div className="text-5xl font-bold text-blue-600 mb-2">{percentage}%</div>
          <p className="text-gray-700">
            {stats.correctAnswers} von {stats.totalAttempts} Fragen richtig beantwortet
          </p>
        </div>
      </Card>

      <CategoryResults stats={stats} />
      <PerformanceFeedback percentage={percentage} />

      {/* Restart button */}
      <Button onClick={onRestartQuiz} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        <RefreshCw className="h-4 w-4 mr-2" />
        Neues Quiz starten
      </Button>
    </div>
  )
}
