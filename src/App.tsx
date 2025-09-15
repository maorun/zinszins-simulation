import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import HomePage from './pages/HomePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen p-2 max-w-full overflow-x-hidden md:p-4 lg:p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <Analytics />
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
