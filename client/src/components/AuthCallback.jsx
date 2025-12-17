import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // If we have code/state, forward to backend (in case HCA redirects to frontend)
    if (code && state && !token) {
      // Forward to backend callback
      window.location.href = `http://localhost:5001/api/auth/callback?code=${code}&state=${state}`
      return
    }

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`)
    } else if (token) {
      // Save token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Fetch user info and redirect
      axios.get('/auth/me')
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
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
