import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import FlightForm from './components/FlightForm'
import Matches from './components/Matches'
import Navbar from './components/Navbar'

axios.defaults.baseURL = 'http://localhost:5000/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Fetch user info if needed
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser({ ...userData, token })
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {user && <Navbar user={user} onLogout={logout} />}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/flights/new" 
            element={user ? <FlightForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/matches" 
            element={user ? <Matches /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
