import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Login from './components/Login'
import AuthCallback from './components/AuthCallback'
import Dashboard from './components/Dashboard'
import FlightForm from './components/FlightForm'
import Matches from './components/Matches'
import AdminEvents from './components/AdminEvents'
import AdminUsers from './components/AdminUsers'
import Navbar from './components/Navbar'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Fetch user info
      axios.get('/auth/me')
        .then(res => {
          setUser({ ...res.data, token })
        })
        .catch(() => {
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-hc-snow">
        <div className="text-hc-red text-xl font-bold animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-hc-snow font-phantom">
        {user && <Navbar user={user} onLogout={logout} />}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
          <Route 
            path="/auth/success" 
            element={<AuthCallback />} 
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
            path="/admin/events" 
            element={user?.role === 'admin' ? <AdminEvents /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin/users" 
            element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/dashboard" />} 
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
