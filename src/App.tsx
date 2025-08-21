import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import HomePage from './pages/HomePage'
import { Toaster } from "@/components/ui/toaster"
import './index.css'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <Analytics />
        <Toaster />
      </div>
    </Router>
  )
}

export default App