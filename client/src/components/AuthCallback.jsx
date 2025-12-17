import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const error = urlParams.get('error')

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`)
    } else if (token) {
      // Save token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Fetch user info and redirect
      axios.get('/api/auth/me')
        .then(res => {
          navigate('/dashboard')
        })
        .catch(err => {
          console.error('Failed to fetch user:', err)
          navigate('/login?error=failed_to_fetch_user')
        })
    } else {
      navigate('/login?error=no_token')
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
