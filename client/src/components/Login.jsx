import { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleHcaLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await axios.get('/auth/login')
      window.location.href = res.data.authUrl
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-hc-dark via-hc-darker to-hc-dark">
      <div className="max-w-md w-full">
        <div className="card space-y-8">
          <div className="text-center">
            <img 
              src="https://assets.hackclub.com/flag-orpheus-top.svg" 
              alt="Hack Club" 
              className="h-20 mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-hc-dark">
              Sign in to Fly Events
            </h2>
            <p className="mt-2 text-hc-muted">
              Find your perfect travel buddy
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-hc-red text-hc-red px-4 py-3 rounded-hc font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={handleHcaLogin}
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center disabled:opacity-50"
            >
              {loading ? (
                'Redirecting...'
              ) : (
                <>
                  <img 
                    src="https://assets.hackclub.com/icon-rounded.svg" 
                    alt="" 
                    className="h-5 w-5 mr-2"
                  />
                  <span>Sign in with Hack Club</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-sm text-hc-muted">
            You'll be redirected to Hack Club Auth to sign in
          </div>
        </div>
      </div>
    </div>
  )
}
