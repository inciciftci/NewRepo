import { useState, useEffect } from 'react'
import Login from './components/Login'
import MainLayout from './components/MainLayout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden">
      {!isAuthenticated ? (
        <Login onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <MainLayout />
      )}
    </div>
  )
}

export default App
