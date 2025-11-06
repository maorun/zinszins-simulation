import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'

// Lazy load the HomePage for code-splitting
const HomePage = lazy(() => import('./pages/HomePage'))

function App() {
  return (
    <Router>
      <div className="min-h-screen p-2 max-w-full overflow-x-hidden md:p-4 lg:p-6">
        <Routes>
          <Route
            path="/"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">Zinseszins-Simulation</div>
                      <div className="text-gray-600">Lädt Anwendung...</div>
                    </div>
                  </div>
                }
              >
                <HomePage />
              </Suspense>
            }
          />
        </Routes>
        <Analytics />
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
